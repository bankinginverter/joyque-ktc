"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminImportCSVPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")

  // เช็คสิทธิ์ Admin ก่อนเข้าใช้งานหน้านี้
  useEffect(() => {
    const verifyAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/")
        return
      }
      const { data: adminData } = await supabase
        .from("admin")
        .select("id")
        .eq("id", user.id)
        .maybeSingle() // เปลี่ยนเป็น maybeSingle เพื่อไม่ให้เกิด Console Error กรณีที่ไม่ใช่แอดมิน

      if (adminData) {
        setIsCheckingAuth(false)
      } else {
        router.replace("/")
      }
    }
    verifyAdmin()
  }, [router])

  // จัดการเมื่อมีการเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setStatus("idle")
      setMessage("")
    }
  }

  // ฟังก์ชันสำหรับอ่านและนำเข้าข้อมูล
  const handleImport = async () => {
    if (!file) return

    setStatus("uploading")
    setMessage("กำลังอ่านไฟล์ CSV...")

    try {
      // 1. อ่านไฟล์ CSV บนหน้าเว็บ
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "")
      if (lines.length < 2)
        throw new Error("ไฟล์ CSV ต้องมี Header และข้อมูลอย่างน้อย 1 แถว")

      const headers = lines[0]
        .replace(/^\uFEFF/, "") // ลบอักขระ BOM ล่องหน ที่มักจะมาจากไฟล์ที่เซฟด้วย Excel
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((h) => h.trim().replace(/^"|"$/g, ""))

      const allData = lines.slice(1).map((line) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        const obj: Record<string, string> = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] ? values[i].trim().replace(/^"|"$/g, "") : ""
        })
        return obj
      })

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token || ""

      // 2. แบ่งข้อมูลส่งทีละก้อน (Chunking/Batching) ก้อนละ 20 คน
      const CHUNK_SIZE = 20
      let successCount = 0

      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        const chunk = allData.slice(i, i + CHUNK_SIZE)

        // อัปเดตข้อความให้แอดมินรู้ว่ากำลังทำถึงไหนแล้ว
        const currentProgress = Math.min(i + CHUNK_SIZE, allData.length)
        setMessage(
          `กำลังนำเข้าข้อมูล... ${currentProgress} / ${allData.length}`,
        )

        const response = await fetch("/api/import-csv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataToInsert: chunk }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error ||
              `เกิดข้อผิดพลาดที่รายการ ${i + 1}-${currentProgress}`,
          )
        }

        successCount += chunk.length
      }

      setStatus("success")
      setMessage(`นำเข้าข้อมูลสำเร็จทั้งหมด ${successCount} รายการ`)
      setFile(null)
    } catch (err: unknown) {
      console.error("Import Error:", err)
      setStatus("error")
      setMessage(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
      )
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white md:bg-[#f8f6ff] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#f8f6ff] flex items-center justify-center md:p-8 font-sans">
      <div className="w-full max-w-md min-h-screen md:min-h-fit bg-white md:rounded-[2.5rem] px-6 py-10 md:p-8 relative shadow-none md:shadow-2xl md:shadow-indigo-100/50 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex flex-col items-center mb-8">
          <h1 className="text-xl font-bold text-[#1a1b4b]">
            Import รายชื่อพนักงาน
          </h1>
          <p className="text-xs text-slate-400 mt-1 text-center">
            ไฟล์ CSV ต้องมีคอลัมน์ employee_id, first_name, last_name, branch
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center relative transition-colors ${
            file
              ? "border-indigo-400 bg-indigo-50/50"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={status === "uploading"}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {file ? (
            <>
              <FileText className="w-12 h-12 text-indigo-500 mb-3" />
              <p className="text-sm font-bold text-slate-800 text-center">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-700">
                คลิก หรือ ลากไฟล์ CSV ลงที่นี่
              </p>
              <p className="text-xs text-slate-400 mt-1">
                รองรับเฉพาะไฟล์นามสกุล .csv
              </p>
            </>
          )}
        </div>

        {/* Status Messages */}
        {status !== "idle" && (
          <div
            className={`w-full mt-6 p-4 rounded-2xl flex items-start gap-3 ${
              status === "uploading"
                ? "bg-blue-50 text-blue-700"
                : status === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-rose-50 text-rose-700"
            }`}
          >
            {status === "uploading" && (
              <Loader2 className="w-5 h-5 animate-spin shrink-0 mt-0.5" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            {status === "error" && (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleImport}
          disabled={!file || status === "uploading"}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg mt-8 transition-all ${
            !file || status === "uploading"
              ? "bg-slate-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-200"
          }`}
        >
          {status === "uploading"
            ? "กำลังนำเข้าข้อมูล..."
            : "เริ่มนำเข้าข้อมูล (Import)"}
        </button>
      </div>
    </div>
  )
}
