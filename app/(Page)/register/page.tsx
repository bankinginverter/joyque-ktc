"use client"

import React, { useActionState } from "react"
import { IdCard } from "lucide-react"
import { useRouter } from "next/navigation"

type RegisterState = {
  error?: string
  success?: boolean
} | null

export default function RegisterPage() {
  const router = useRouter()

  const registerAction = async (
    prevState: RegisterState,
    formData: FormData,
  ) => {
    const employeeId = (formData.get("employeeId") as string || "").trim()

    if (!employeeId) {
      return { error: "กรุณากรอกรหัสพนักงาน" }
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })
      const result = await res.json()

      if (!res.ok) {
        return { error: result.error || "ใส่รหัสพนักงานไม่ถูกต้อง" }
      }

      // เก็บ userId ไว้ที่เครื่อง เพื่อให้หน้า Result ดึงข้อมูลมาแสดง QR ได้
      localStorage.setItem("ticketUserId", result.userId)

      router.push("/result")
      return { success: true }
    } catch {
      return { error: "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง" }
    }
  }

  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#f0f8ff] font-sans">
      {/* ================= BACKGROUND (จากหน้า Main) ================= */}

      {/* TOP RIGHT BLOB */}
      <div className="absolute top-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-[#b3e0ff] via-[#80ccff] to-[#33adff] blur-3xl opacity-80 pointer-events-none" />

      {/* LEFT PINK BLOB */}
      <div className="absolute left-[-140px] top-[420px] h-[420px] w-[260px] rounded-full bg-gradient-to-b from-[#00a3e0] to-[#66c2ff] blur-2xl opacity-90 pointer-events-none" />

      {/* RIGHT CYAN BLOB */}
      <div className="absolute right-[-120px] bottom-[180px] h-[420px] w-[240px] rounded-full bg-gradient-to-b from-[#00508a] to-[#00a3e0] blur-2xl opacity-80 pointer-events-none" />

      {/* BOTTOM PURPLE BLOB */}
      <div className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 h-[240px] w-[420px] rounded-full bg-gradient-to-r from-[#00c1d5] to-[#007ab3] blur-3xl opacity-70 pointer-events-none" />

      {/* ================= FLOATING SHAPES ================= */}
      <div className="absolute left-[58px] top-[430px] h-3 w-3 rounded-full bg-white/70 pointer-events-none" />
      <div className="absolute left-[72px] top-[530px] h-2 w-2 rounded-full bg-white/60 pointer-events-none" />
      <div className="absolute left-[72px] top-[860px] h-4 w-4 rounded-full bg-white/70 pointer-events-none" />
      <div className="absolute left-[140px] top-[210px] h-5 w-5 rounded-full border-[4px] border-[#00a3e0] pointer-events-none" />
      <div className="absolute left-[165px] top-[145px] h-3 w-10 rotate-[-25deg] rounded-full bg-[#00c1d5] pointer-events-none" />
      <div className="absolute right-[92px] top-[215px] text-[#00508a] text-4xl font-light pointer-events-none">
        ✦
      </div>
      <div className="absolute right-[72px] top-[435px] h-6 w-6 rounded-full bg-[#00a3e0] pointer-events-none" />
      <div className="absolute right-[60px] top-[590px] grid grid-cols-4 gap-2 opacity-60 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#b3e0ff]" />
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex w-full flex-col items-center px-5 py-8 md:px-8 md:py-20">
        <div
          className="
            w-full
            max-w-[400px]
            rounded-3xl
            bg-white/88
            px-6
            py-8
            backdrop-blur-xl
            shadow-[0_25px_60px_rgba(0,0,0,0.08)]
            border border-white/70
            flex flex-col justify-center
            md:max-w-[480px]
            md:rounded-[32px]
            md:px-10
            md:py-10
          "
        >
          {/* --- Icon Illustration --- */}
          <div className="flex justify-center mb-6 md:mb-8 relative z-10">
            <div className="relative flex h-20 w-20 md:h-[92px] md:w-[92px] items-center justify-center rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br from-[#00a3e0] to-[#007ab3] shadow-[0_18px_30px_rgba(0,163,224,0.18)] transform -rotate-6">
              <IdCard
                className="h-10 w-10 md:h-12 md:w-12 text-white opacity-90"
                strokeWidth={2.5}
              />

              {/* Confetti เล็กๆ */}
              <div className="absolute -top-2 -right-3 w-4 h-4 bg-[#ffd237] rotate-12 rounded-sm opacity-90" />
              <div className="absolute bottom-1 -left-4 w-3 h-3 bg-[#00d6ff] -rotate-12 rounded-full opacity-80" />
            </div>
          </div>

          {/* --- Header --- */}
          <div className="text-center mb-8 md:mb-6 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#003876] mb-2 tracking-tight">
              ลงทะเบียน
            </h1>
            <p className="text-[#70758b] text-sm md:text-base">
              กรอกรหัสพนักงานเพื่อรับ QR Code เข้างาน
            </p>
          </div>

          {/* --- Form Section --- */}
          <form
            action={formAction}
            className="space-y-4 md:space-y-5 relative z-10"
          >
            {/* Employee ID */}
            <div className="relative">
              <IdCard
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                name="employeeId"
                placeholder="รหัสพนักงาน"
                autoFocus
                className="w-full bg-white/70 border border-[#e7e1f3] rounded-2xl py-3.5 md:py-4 pl-12 pr-4 outline-none focus:border-[#00a3e0] focus:ring-4 focus:ring-[#00a3e0]/10 transition-all shadow-sm text-[#003876] font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`mt-6 md:mt-8 flex h-14 md:h-[64px] w-full items-center justify-center rounded-2xl md:rounded-[20px] text-lg md:text-[20px] font-extrabold text-white transition-all ${
                isPending
                  ? "bg-slate-300 cursor-not-allowed shadow-none text-slate-500" // สไตล์ตอนกดแล้ว กำลังโหลด
                  : "bg-gradient-to-r from-[#00c1d5] via-[#00a3e0] to-[#00508a] shadow-[0_20px_35px_rgba(0,163,224,0.25)] hover:scale-[1.015] active:scale-[0.99]"
              }`}
            >
              {isPending ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </button>

            {/* แสดง Error Message ถ้ามีปัญหาเกิดขึ้นระหว่างบันทึก */}
            {state?.error && (
              <p className="text-rose-500 text-center text-sm font-medium mt-2">
                {state.error}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
