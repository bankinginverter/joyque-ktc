import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/utils/supabase-admin"

// POST: เพิ่มรหัสพนักงานใหม่เข้า master list (ตาราง employees) ผ่านหน้า Signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employeeId = (body.employeeId || "").toString().trim()
    const firstName = (body.firstName || "").toString().trim()
    const lastName = (body.lastName || "").toString().trim()
    const branch = (body.branch || "").toString().trim()

    if (!employeeId || !firstName || !lastName || !branch) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: existing, error: existingError } = await supabase
      .from("employees")
      .select("employee_id")
      .eq("employee_id", employeeId)
      .maybeSingle()

    if (existingError) {
      console.error("Signup lookup error:", existingError)
      throw new Error("เกิดข้อผิดพลาดในการตรวจสอบรหัสพนักงาน")
    }

    if (existing) {
      return NextResponse.json(
        { error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" },
        { status: 409 },
      )
    }

    const { error: insertError } = await supabase.from("employees").insert({
      employee_id: employeeId,
      first_name: firstName,
      last_name: lastName,
      branch,
    })

    if (insertError) {
      console.error("Signup insert error:", insertError)
      throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Employees Signup API Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "เกิดข้อผิดพลาดของระบบ",
      },
      { status: 500 },
    )
  }
}
