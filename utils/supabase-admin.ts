import { createClient } from "@supabase/supabase-js"

// ดึง Supabase Client ฝั่ง Server (ถ้ามี Service Key ใช้เลย ถ้าไม่มีใช้ Token)
export const getSupabaseAdmin = (token?: string) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  }

  // ถ้าไม่มี Service Key ให้ใช้ Anon Key คู่กับ Token ที่ส่งมา (เพื่อให้ผ่าน RLS)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const headers = token
    ? { global: { headers: { Authorization: `Bearer ${token}` } } }
    : {}

  return createClient(url, anonKey, {
    ...headers,
    auth: { persistSession: false },
  })
}

// ตรวจสอบ Token ของ Admin
export const verifyAdminApi = async (request: Request) => {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return { isValid: false, token: "" }

  const token = authHeader.replace("Bearer ", "")

  // สร้าง client โดยแนบ Token เพื่อให้ Query ในฐานะ Admin คนนั้น
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser(token)
  if (!user) return { isValid: false, token: "" }

  const { data: admin } = await supabase
    .from("admin")
    .select("id")
    .eq("id", user.id)
    .maybeSingle() // เปลี่ยนเพื่อป้องกันการแจ้งเตือน Error ขยะใน Server Log กรณีผู้ใช้ไม่ใช่ Admin
  return { isValid: !!admin, token }
}
