"use client"
import React, { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react"
import QRCode from "react-qr-code"
import { useRouter } from "next/navigation"

export default function EventSuccessPage() {
  const router = useRouter()
  // 1. สร้าง State สำหรับเก็บข้อมูลที่จะแสดงบนหน้าจอ
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    userId: "",
    eventDate: "14/06/2569",
    eventTime: "16:00 - 22:00",
    location: "Bangkok, Thailand",
    address: "123 Event Street, Bangkok",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("ticketUserId")

      // ถ้าไม่มี userId (เข้าหน้านี้ตรงๆ โดยยังไม่ได้ลงทะเบียน) ให้เด้งกลับไปหน้า Register
      if (!userId) {
        router.replace("/register")
        return
      }

      try {
        const res = await fetch(
          `/api/register?userId=${encodeURIComponent(userId)}`,
        )
        const result = await res.json()

        if (!res.ok) {
          router.replace("/register")
          return
        }

        setUserData((prev) => ({
          ...prev,
          userId: result.userId,
          firstName: result.firstName || "Guest",
          lastName: result.lastName || "",
        }))
      } catch {
        router.replace("/register")
        return
      }
      setIsLoading(false)
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#f5f2fb] font-sans">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-indigo-600 font-bold animate-pulse">
          Loading your ticket...
        </p>
      </main>
    )
  }

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#f5f2fb] font-sans">
      {/* ================= BACKGROUND ================= */}
      <div className="absolute top-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-[#ffe7a8] via-[#ffd8c8] to-[#ffc7dc] blur-3xl opacity-80 pointer-events-none" />
      <div className="absolute left-[-140px] top-[420px] h-[420px] w-[260px] rounded-full bg-gradient-to-b from-[#ffb6d9] to-[#ffd8e8] blur-2xl opacity-90 pointer-events-none" />
      <div className="absolute right-[-120px] bottom-[180px] h-[420px] w-[240px] rounded-full bg-gradient-to-b from-[#73ecff] to-[#d8c8ff] blur-2xl opacity-80 pointer-events-none" />
      <div className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 h-[240px] w-[420px] rounded-full bg-gradient-to-r from-[#f2b1ff] to-[#c9b3ff] blur-3xl opacity-70 pointer-events-none" />

      {/* ================= FLOATING SHAPES ================= */}
      <div className="absolute left-[58px] top-[430px] h-3 w-3 rounded-full bg-white/70 pointer-events-none" />
      <div className="absolute left-[72px] top-[530px] h-2 w-2 rounded-full bg-white/60 pointer-events-none" />
      <div className="absolute left-[72px] top-[860px] h-4 w-4 rounded-full bg-white/70 pointer-events-none" />
      <div className="absolute left-[140px] top-[210px] h-5 w-5 rounded-full border-[4px] border-[#c39cff] pointer-events-none" />
      <div className="absolute left-[165px] top-[145px] h-3 w-10 rotate-[-25deg] rounded-full bg-[#ff6db2] pointer-events-none" />
      <div className="absolute right-[92px] top-[215px] text-[#9fe8f0] text-4xl font-light pointer-events-none">
        ✦
      </div>
      <div className="absolute right-[72px] top-[435px] h-6 w-6 rounded-full bg-[#ffd75c] pointer-events-none" />
      <div className="absolute right-[60px] top-[590px] grid grid-cols-4 gap-2 opacity-60 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#7fe4ff]" />
        ))}
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-4 py-6 md:px-8 md:py-20">
        <div
          className="
            w-full
            max-w-[340px]
            rounded-3xl
            bg-white/88
            px-5
            py-6
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
          {/* --- Success Illustration Group --- */}
          <div className="flex flex-col items-center mt-2 md:mt-0 pb-4 md:pb-6 relative z-10">
            {/* Confetti & Graphic Element */}
            <div className="relative w-20 h-20 md:w-32 md:h-32 mb-3 md:mb-4">
              <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-100">
                <CheckCircle2
                  className="text-white w-10 h-10 md:w-16 md:h-16"
                  strokeWidth={3}
                />
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-[#20123c] mb-1.5 md:mb-2 text-center tracking-tight">
              You re All Set!
            </h1>
            <p className="text-[#70758b] text-xs md:text-base text-center px-1 md:px-2 leading-relaxed">
              Thanks for registering
              <span className="font-bold text-[#ff4ea8] ml-1">
                {userData.firstName}
              </span>
              . We can t wait to see you at the event!
            </p>
          </div>

          {/* --- Event Detail Card --- */}
          <div className="relative z-10 bg-white/70 rounded-3xl md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-[#e7e1f3] mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 mb-3 md:mb-4 border-b border-[#e7e1f3]">
              <div className="p-1.5 md:p-2 bg-[#ff4ea8]/10 rounded-lg md:rounded-xl text-[#ff4ea8]">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h2 className="font-bold text-sm md:text-base text-[#20123c]">
                Event Details
              </h2>
            </div>

            {/* User Info (First & Last Name) */}
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-[#e7e1f3] flex flex-col items-center shadow-sm">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">
                Attendee
              </p>
              <p className="text-base md:text-xl font-bold text-[#20123c]">
                {userData.firstName} {userData.lastName}
              </p>

              {/* --- QR Code สำหรับ Admin Scan --- */}
              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#e7e1f3] w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                <QRCode
                  value={userData.userId || "placeholder"} // ป้องกันการแครชถ้าไม่ได้ userId มา
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <p className="text-[9px] md:text-[10px] text-slate-400 mt-1.5 md:mt-2">
                Scan for Check-in
              </p>
            </div>

            {/* Date, Time, Location */}
            <div className="space-y-3 md:space-y-5">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-1.5 md:p-2 bg-white rounded-lg text-[#00d6ff] shadow-sm border border-[#e7e1f3]">
                  <Calendar className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="font-bold text-[#20123c] text-xs md:text-sm">
                    {userData.eventDate}
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-400">
                    Sat - Mon
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-1.5 md:p-2 bg-white rounded-lg text-[#ffb66c] shadow-sm border border-[#e7e1f3]">
                  <Clock className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="font-bold text-[#20123c] text-xs md:text-sm">
                    {userData.eventTime}
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-400">
                    GMT +7
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-1.5 md:p-2 bg-white rounded-lg text-[#ff61c9] shadow-sm border border-[#e7e1f3]">
                  <MapPin className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="font-bold text-[#20123c] text-xs md:text-sm">
                    {userData.location}
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-400">
                    {userData.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div className="relative z-10 w-full">
            <button
              onClick={() => router.push("/")}
              className="mt-1 md:mt-2 flex h-12 md:h-[64px] w-full items-center justify-center rounded-xl md:rounded-[20px] text-base md:text-[20px] font-extrabold text-white transition-all bg-gradient-to-r from-[#ff4ea8] via-[#ffb66c] to-[#00d6ff] shadow-[0_15px_25px_rgba(255,105,180,0.25)] hover:scale-[1.015] active:scale-[0.99]"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
