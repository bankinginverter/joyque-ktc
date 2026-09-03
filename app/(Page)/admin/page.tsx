"use client"

import React, { useActionState } from "react"
import { Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"

type LoginState = {
  error?: string
  success?: boolean
} | null

export default function AdminLoginPage() {
  const router = useRouter()

  const loginAction = async (prevState: LoginState, formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (authError) {
      return { error: "อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง" }
    }

    if (authData.user) {
      const { data: adminData, error: dbError } = await supabase
        .from("admin")
        .select("id")
        .eq("id", authData.user.id)
        .single()

      if (dbError || !adminData) {
        await supabase.auth.signOut()
        return { error: "บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบ Admin" }
      }

      router.push("/admin/dashboard")
      return { success: true }
    }

    return { error: "เกิดข้อผิดพลาดของระบบ" }
  }

  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-white md:bg-[#fcfaff] flex items-center justify-center md:p-8 font-sans">
      {/* Container หลัก */}
      <div className="w-full max-w-md min-h-screen md:min-h-fit bg-white/60 backdrop-blur-md md:rounded-[2.5rem] px-6 py-10 md:p-8 relative overflow-hidden shadow-none md:shadow-2xl md:shadow-indigo-100/50 border-none md:border border-white flex flex-col justify-center">
        {/* --- Background Decorations --- */}
        <div className="absolute -top-10 -left-10 w-64 h-64 md:w-40 md:h-40 bg-purple-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-40 md:top-20 -right-10 w-64 h-64 md:w-32 md:h-32 bg-indigo-100/50 blur-3xl rounded-full pointer-events-none" />

        {/* --- Header --- */}
        <div className="text-center mb-8 md:mb-6 relative z-10">
          <h1 className="text-4xl md:text-3xl font-extrabold text-[#1a1b4b] mb-2 tracking-tight">
            Admin Login
          </h1>
          <p className="text-slate-500">ลงชื่อเข้าใช้สำหรับเจ้าหน้าที่</p>
        </div>

        {/* --- Form Section --- */}
        <form action={formAction} className="space-y-4 relative z-10">
          {/* Email */}
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-sm text-slate-700"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-sm text-slate-700"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-5 text-white font-bold text-lg rounded-[1.5rem] shadow-lg shadow-indigo-200 transition-all mt-4 ${
              isPending
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            {isPending ? "Authenticating..." : "Login"}
          </button>

          {/* Error Message */}
          {state?.error && (
            <p className="text-rose-500 text-center text-sm font-medium mt-2">
              {state.error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
