import { createClient, SupabaseClient } from "@supabase/supabase-js"

// สร้าง client แบบ lazy (สร้างตอนถูกเรียกใช้จริงในเบราว์เซอร์เท่านั้น)
// ป้องกัน Next.js build ล้มเหลวตอน prerender หน้า "use client" บนเซิร์ฟเวอร์
// ในกรณีที่ยังไม่มี environment variables ตอน build (เช่น deploy ครั้งแรกบน Netlify)
let client: SupabaseClient | null = null

const getClient = () => {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
  }
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
