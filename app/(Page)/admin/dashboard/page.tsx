"use client"

import React, { useEffect } from "react"

export default function AdminDashboardPage() {
  useEffect(() => {
    // เรียก API keep-alive แบบ Fire-and-forget เพื่อปลุก Supabase 1 ครั้งตอนเข้ามาหน้านี้
    fetch("/api/keep-alive").catch(console.error)
  }, [])

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-extrabold text-[#1a1b4b] mb-4">
        Admin Dashboard
      </h1>
      <p className="text-slate-500">ยินดีต้อนรับสู่ระบบจัดการหลังบ้าน</p>
      {/* สามารถเพิ่ม Component อื่นๆ เช่น กราฟหรือสถิติมาแสดงตรงนี้ได้ในอนาคต */}
    </div>
  )
}
