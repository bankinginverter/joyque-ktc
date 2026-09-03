import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/utils/supabase-admin"

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin()

    // ดึงข้อมูลแค่ 1 รายการเพื่อสร้าง Activity ให้ Supabase ไม่หลับ
    const { data, error } = await supabase.from("queues").select("id").limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Supabase is awake!",
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error("Keep alive error:", error)
    return NextResponse.json(
      { error: "Failed to wake up Supabase" },
      { status: 500 },
    )
  }
}
