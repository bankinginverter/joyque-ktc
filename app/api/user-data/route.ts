import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin, verifyAdminApi } from "@/utils/supabase-admin"

// ==========================================
// 1. GET: สำหรับดึงข้อมูลแบบ Pagination
// ==========================================
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminApi(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin(auth.token)
    const searchParams = request.nextUrl.searchParams

    // รับค่า page และ limit จาก URL Query (ถ้าไม่มีให้ใช้ค่าเริ่มต้นคือ หน้า 1, 10 รายการ)
    // ป้องกันกรณีที่ได้ค่าเป็น 0 หรือ NaN และจำกัดเพดานสูงสุด (Max Limit) เพื่อไม่ให้โหลดข้อมูลหนักเกินไป
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1)
    const rawLimit = parseInt(searchParams.get("limit") || "10") || 10
    const limit = Math.min(Math.max(1, rawLimit), 100) // ดึงข้อมูลได้สูงสุด 100 รายการต่อครั้ง
    const search = searchParams.get("search") || ""

    // คำนวณช่วง index ข้อมูล (0-based index)
    const from = (page - 1) * limit
    const to = from + limit - 1

    // เตรียมคำสั่งดึงข้อมูล (employee_id, branch อยู่ในตาราง queues โดยตรง ไม่ต้อง join แล้ว)
    let query = supabase
      .from("queues")
      // หากในอนาคตข้อมูลมีมากกว่า 100k แถว แนะนำให้พิจารณาเปลี่ยน exact เป็น estimated
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }) // เรียงจากใหม่ไปเก่า
      .range(from, to)

    // ถ้ามีการค้นหา ให้เพิ่ม Filter ด้วย ilike (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
    if (search) {
      query = query.ilike("username", `%${search}%`)
    }

    // รันคำสั่งดึงข้อมูล
    const { data, error, count } = await query

    if (error) {
      console.error("Supabase GET Error:", error)
      throw new Error(
        error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลจาก Database",
      )
    }

    // ส่งข้อมูลกลับไปพร้อม Meta data สำหรับทำปุ่มเปลี่ยนหน้า
    return NextResponse.json({
      data,
      meta: {
        totalItems: count,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (error: unknown) {
    console.error("API GET Exception:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดทางฝั่งเซิร์ฟเวอร์",
      },
      { status: 500 },
    )
  }
}

// ==========================================
// 2. PATCH: สำหรับอัปเดตสถานะ (เช่น เปลี่ยนจาก waiting -> checked_in)
// ==========================================
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminApi(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin(auth.token)
    const body = await request.json()
    const { user_id, mode, status } = body

    if (!user_id) {
      return NextResponse.json(
        { error: "กรุณาส่ง user_id ให้ครบถ้วน" },
        { status: 400 },
      )
    }

    // mode "checkin" อัปเดตสถานะเข้างาน (status), mode "gift" อัปเดตสถานะรับของ (gift_status)
    // แยกอิสระจากกัน แอดมินเลือกโหมดเองตอนสแกน
    // รองรับการเรียกแบบเดิม (ส่ง status ตรงๆ ไม่มี mode) เพื่อความเข้ากันได้กับหน้า User Data
    let updatePayload: Record<string, string> = {}
    if (mode === "gift") {
      updatePayload = { gift_status: status || "received" }
    } else if (mode === "checkin") {
      updatePayload = { status: status || "checked_in" }
    } else if (status) {
      updatePayload = { status }
    } else {
      return NextResponse.json(
        { error: "กรุณาระบุ mode หรือ status ให้ถูกต้อง" },
        { status: 400 },
      )
    }

    // ฟิลด์/ค่าที่กำลังจะเซ็ต ใช้เช็คว่าก่อนหน้านี้เป็นค่าเดิมอยู่แล้วหรือไม่ (สแกนซ้ำ)
    const targetField = mode === "gift" ? "gift_status" : "status"
    const targetValue = updatePayload[targetField]

    // อัปเดตเฉพาะกรณีที่ค่ายังไม่ตรงกับเป้าหมาย (neq) พร้อม join ดึงชื่อ-นามสกุลมาในคำสั่งเดียวกันเลย
    // (เดิมแยก query select user_details อีกรอบ ทำให้ยิง 2 request ต่อการสแกน 1 ครั้ง)
    const { data, error } = await supabase
      .from("queues")
      .update(updatePayload)
      .eq("user_id", user_id)
      .neq(targetField, targetValue)
      .select("*, user:user_details(first_name, last_name)")
      .maybeSingle()

    if (error) {
      // ดักจับรูปแบบ UUID ไม่ถูกต้อง (22P02)
      if (error.code === "22P02") {
        return NextResponse.json(
          { error: "รูปแบบ ID ไม่ถูกต้อง" },
          { status: 400 },
        )
      }

      console.error("Supabase PATCH Error:", error)
      throw new Error(error.message || "เกิดข้อผิดพลาดในการอัปเดต Database")
    }

    // ไม่มีแถวไหนถูกอัปเดต แปลว่า user_id นี้ไม่มีอยู่จริง หรือค่าตรงกับเป้าหมายอยู่แล้ว (สแกนซ้ำ)
    if (!data) {
      const { data: current } = await supabase
        .from("queues")
        .select("*, user:user_details(first_name, last_name)")
        .eq("user_id", user_id)
        .maybeSingle()

      if (!current) {
        return NextResponse.json(
          { error: "ไม่พบข้อมูลคิวนี้ในระบบ" },
          { status: 404 },
        )
      }

      const alreadyMessage =
        targetField === "gift_status" && targetValue === "received"
          ? "รับของไปแล้ว"
          : targetField === "status" && targetValue === "checked_in"
            ? "เข้าร่วมงานแล้ว"
            : "สถานะนี้ถูกอัปเดตไปแล้ว"

      return NextResponse.json({
        success: true,
        alreadyDone: true,
        message: alreadyMessage,
        data: current,
      })
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตสถานะสำเร็จ",
      data,
    })
  } catch (error: unknown) {
    console.error("API PATCH Exception:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      },
      { status: 500 },
    )
  }
}
