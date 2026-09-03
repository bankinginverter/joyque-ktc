"use client"

import Image from "next/image"
import { Ticket, CalendarDays, Gift, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const handleGetStarted = () => {
    router.push("/register")
  }

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#f0f8ff]">
      {/* ================= BACKGROUND ================= */}

      {/* TOP RIGHT BLOB */}
      <div
        className="
          absolute
          top-[-120px]
          right-[-80px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-gradient-to-br
          from-[#b3e0ff]
          via-[#80ccff]
          to-[#33adff]
          blur-3xl
          opacity-80
        "
      />

      {/* LEFT PINK BLOB */}
      <div
        className="
          absolute
          left-[-140px]
          top-[420px]
          h-[420px]
          w-[260px]
          rounded-full
          bg-gradient-to-b
          from-[#00a3e0]
          to-[#66c2ff]
          blur-2xl
          opacity-90
        "
      />

      {/* RIGHT CYAN BLOB */}
      <div
        className="
          absolute
          right-[-120px]
          bottom-[180px]
          h-[420px]
          w-[240px]
          rounded-full
          bg-gradient-to-b
          from-[#00508a]
          to-[#00a3e0]
          blur-2xl
          opacity-80
        "
      />

      {/* BOTTOM PURPLE BLOB */}
      <div
        className="
          absolute
          bottom-[-160px]
          left-1/2
          -translate-x-1/2
          h-[240px]
          w-[420px]
          rounded-full
          bg-gradient-to-r
          from-[#00c1d5]
          to-[#007ab3]
          blur-3xl
          opacity-70
        "
      />

      {/* ================= FLOATING SHAPES ================= */}

      <div className="absolute left-[58px] top-[430px] h-3 w-3 rounded-full bg-white/70" />
      <div className="absolute left-[72px] top-[530px] h-2 w-2 rounded-full bg-white/60" />
      <div className="absolute left-[72px] top-[860px] h-4 w-4 rounded-full bg-white/70" />

      <div className="absolute left-[140px] top-[210px] h-5 w-5 rounded-full border-[4px] border-[#00a3e0]" />

      <div className="absolute left-[165px] top-[145px] h-3 w-10 rotate-[-25deg] rounded-full bg-[#00c1d5]" />

      <div className="absolute right-[92px] top-[215px] text-[#00508a] text-4xl font-light">
        ✦
      </div>

      <div className="absolute right-[72px] top-[435px] h-6 w-6 rounded-full bg-[#00a3e0]" />

      {/* DOT GRID */}
      <div className="absolute right-[60px] top-[590px] grid grid-cols-4 gap-2 opacity-60">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#b3e0ff]" />
        ))}
      </div>

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 flex w-full flex-col items-center px-5 py-8 md:px-8 md:py-20">
        {/* LOGO */}
        <div className="mb-5 md:mb-8">
          <Image
            src="/logo.png"
            alt="JOY QUE"
            width={520}
            height={260}
            priority
            className="
              w-[220px]
              md:w-[280px]
              drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)]
            "
          />
        </div>

        {/* TITLE */}
        <div className="mb-4 text-center md:mb-6">
          <h1
            className="
              text-2xl
              md:text-[28px]
              md:leading-[1.3]
              font-extrabold
              tracking-[-0.03em]
              text-[#003876]
            "
          >
            ลงทะเบียนเพื่อเข้าร่วมงาน
            <br />
            รับข่าวสารและสิทธิพิเศษก่อนใคร!
          </h1>
        </div>

        {/* SMALL LINE */}
        <div className="mb-6 flex items-center gap-2 md:mb-10">
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#00a3e0] via-[#66c2ff] to-transparent md:h-[6px] md:w-24" />

          <div className="h-2 w-2 rounded-full bg-[#00508a] md:h-3 md:w-3" />
        </div>

        {/* ================= CARD ================= */}

        <div
          className="
            w-full
            max-w-[400px]
            rounded-3xl
            bg-white/88
            px-5
            py-6
            backdrop-blur-xl
            shadow-[0_25px_60px_rgba(0,0,0,0.08)]
            border border-white/70
            md:max-w-[500px]
            md:rounded-[32px]
            md:px-8
            md:py-8
          "
        >
          {/* FEATURE 1 */}
          <div className="flex items-center gap-4 md:items-start md:gap-6">
            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#00a3e0]
                to-[#007ab3]
                shadow-[0_18px_30px_rgba(0,163,224,0.18)]
                md:h-[72px]
                md:w-[72px]
                md:rounded-[1.25rem]
              "
            >
              <Ticket
                className="h-8 w-8 text-white md:h-9 md:w-9"
                strokeWidth={2.5}
              />
            </div>

            <div className="pt-1 md:pt-1.5">
              <h2 className="text-xl font-extrabold text-[#003876] md:text-2xl">
                ลงทะเบียนง่าย
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-[#70758b] md:mt-1.5 md:text-base">
                ลงทะเบียนง่ายๆ ไม่ต้องใช้ email ก็ลงได้
              </p>
            </div>
          </div>

          <div className="my-4 h-[2px] w-full border-b border-dashed border-[#e7e1f3] md:my-6" />

          {/* FEATURE 2 */}
          <div className="flex items-center gap-4 md:items-start md:gap-6">
            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#00c1d5]
                to-[#00a3e0]
                shadow-[0_18px_30px_rgba(0,193,213,0.18)]
                md:h-[72px]
                md:w-[72px]
                md:rounded-[1.25rem]
              "
            >
              <CalendarDays
                className="h-8 w-8 text-white md:h-9 md:w-9"
                strokeWidth={2.5}
              />
            </div>

            <div className="pt-1 md:pt-1.5">
              <h2 className="text-xl font-extrabold text-[#003876] md:text-2xl">
                ใช้งานได้หลากหลาย
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-[#70758b] md:mt-1.5 md:text-base">
                สามารถนำไปใช้งานงานอื่นๆ ได้ด้วยนะ
                <br />
                ไม่จำกัดแค่ Event นี้เท่านั้น
              </p>
            </div>
          </div>

          <div className="my-4 h-[2px] w-full border-b border-dashed border-[#e7e1f3] md:my-6" />

          {/* FEATURE 3 */}
          <div className="flex items-center gap-4 md:items-start md:gap-6">
            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#00508a]
                to-[#003876]
                shadow-[0_18px_30px_rgba(0,80,138,0.18)]
                md:h-[72px]
                md:w-[72px]
                md:rounded-[1.25rem]
              "
            >
              <Gift
                className="h-8 w-8 text-white md:h-9 md:w-9"
                strokeWidth={2.5}
              />
            </div>

            <div className="pt-1 md:pt-1.5">
              <h2 className="text-xl font-extrabold text-[#003876] md:text-2xl">
                กิจกรรมและของรางวัล
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-[#70758b] md:mt-1.5 md:text-base">
                สามารถเพิ่มระบบกิจกรรมต่างๆ
                <br />
                แบบลุ้นรับของรางวัลได้ด้วยนะ
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleGetStarted}
            className="
              mt-6
              flex
              h-14
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-[#00c1d5]
              via-[#00a3e0]
              to-[#00508a]
              text-lg
              font-extrabold
              text-white
              shadow-[0_20px_35px_rgba(0,163,224,0.25)]
              transition-all
              hover:scale-[1.015]
              active:scale-[0.99]
              md:mt-8
              md:h-[64px]
              md:gap-3
              md:rounded-2xl
              md:text-[20px]
            "
          >
            <span>Get Started</span>
          </button>
        </div>
      </div>
    </main>
  )
}
