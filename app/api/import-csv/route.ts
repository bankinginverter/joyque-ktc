import { NextResponse } from "next/server"
import { getSupabaseAdmin, verifyAdminApi } from "@/utils/supabase-admin"

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminApi(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const dataToInsert = body.dataToInsert

    if (!dataToInsert || !Array.isArray(dataToInsert)) {
      return NextResponse.json(
        { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()

    // แปลงข้อมูลแต่ละแถวของ CSV ให้ตรงกับคอลัมน์ในตาราง employees
    const rows = dataToInsert
      .map((row: Record<string, string>) => ({
        employee_id:
          row.employee_id ||
          row.employeeId ||
          row["Employee ID"] ||
          row["รหัสพนักงาน"] ||
          "",
        first_name:
          row.first_name || row.firstName || row["First Name"] || "-",
        last_name: row.last_name || row.lastName || row["Last Name"] || "-",
        branch: row.branch || row["Branch"] || row["สาขา"] || "-",
        position: row.position || row["Position"] || "-",
        phone_number:
          row.phone_number || row.phone || row["Phone"] || "-",
      }))
      // ข้ามแถวที่ไม่มีรหัสพนักงาน เพราะเป็น Primary Key
      .filter((row) => row.employee_id)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบคอลัมน์รหัสพนักงาน (employee_id) ในไฟล์ที่อัปโหลด" },
        { status: 400 },
      )
    }

    // Upsert ตาม employee_id เพื่อให้ import ไฟล์เดิมซ้ำได้โดยไม่เกิดข้อมูลซ้อน
    const { error } = await supabase
      .from("employees")
      .upsert(rows, { onConflict: "employee_id" })

    if (error) {
      console.error("Import CSV Error:", error)
      throw new Error(error.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล")
    }

    return NextResponse.json({
      message: `นำเข้ารายชื่อพนักงานสำเร็จ ${rows.length} จาก ${dataToInsert.length} รายการ`,
    })
  } catch (error) {
    console.error("Import API Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์",
      },
      { status: 500 },
    )
  }
}
