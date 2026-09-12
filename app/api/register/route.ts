import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/utils/supabase-admin"

// POST: ลงทะเบียนด้วยรหัสพนักงาน (ตรวจกับ master list ตาราง employees)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employeeId = (body.employeeId || "").toString().trim()

    if (!employeeId) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสพนักงาน" },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()

    // 1. เช็คว่ารหัสพนักงานนี้มีสิทธิ์ลงทะเบียนไหม
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("employee_id, first_name, last_name, branch")
      .eq("employee_id", employeeId)
      .maybeSingle()

    if (employeeError) {
      console.error("Register lookup error:", employeeError)
      throw new Error("เกิดข้อผิดพลาดในการตรวจสอบรหัสพนักงาน")
    }

    if (!employee) {
      return NextResponse.json(
        { error: "ใส่รหัสพนักงานไม่ถูกต้อง" },
        { status: 400 },
      )
    }

    // 2. ถ้าเคยลงทะเบียนไปแล้ว ให้คืนข้อมูล QR เดิม (ไม่สร้างซ้ำ)
    const { data: existing, error: existingError } = await supabase
      .from("user_details")
      .select("id, first_name, last_name")
      .eq("employee_id", employeeId)
      .maybeSingle()

    if (existingError) {
      console.error("Register existing lookup error:", existingError)
      throw new Error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูลการลงทะเบียน")
    }

    if (existing) {
      return NextResponse.json({
        userId: existing.id,
        firstName: existing.first_name,
        lastName: existing.last_name,
        alreadyRegistered: true,
      })
    }

    // 3. ยังไม่เคยลงทะเบียน สร้างข้อมูลใหม่จากข้อมูล master ของพนักงานคนนี้
    const { data: newUser, error: insertUserError } = await supabase
      .from("user_details")
      .insert({
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        branch: employee.branch,
      })
      .select("id, first_name, last_name")
      .single()

    if (insertUserError || !newUser) {
      console.error("Register insert user_details error:", insertUserError)
      throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    }

    const { error: insertQueueError } = await supabase.from("queues").insert({
      user_id: newUser.id,
      employee_id: employee.employee_id,
      branch: employee.branch,
      username: `${newUser.first_name} ${newUser.last_name}`.trim(),
    })

    if (insertQueueError) {
      console.error("Register insert queue error:", insertQueueError)
      throw new Error("เกิดข้อผิดพลาดในการบันทึกคิว")
    }

    return NextResponse.json({
      userId: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      alreadyRegistered: false,
    })
  } catch (error) {
    console.error("Register API Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "เกิดข้อผิดพลาดของระบบ",
      },
      { status: 500 },
    )
  }
}

// GET: ดึงข้อมูลสำหรับหน้าตั๋ว (Result) ด้วย userId ที่เก็บไว้บนเครื่องผู้ใช้
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || ""
    if (!userId) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("user_details")
      .select("id, first_name, last_name")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("Register GET error:", error)
      throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล")
    }

    if (!data) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการลงทะเบียนนี้" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      userId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
    })
  } catch (error) {
    console.error("Register GET Exception:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "เกิดข้อผิดพลาดของระบบ",
      },
      { status: 500 },
    )
  }
}
