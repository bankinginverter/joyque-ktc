"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner"
import { supabase } from "@/utils/supabase"
import {
  CheckCircle2,
  XCircle,
  Camera,
  ChevronLeft,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  LogIn,
  Gift,
} from "lucide-react"
import { useRouter } from "next/navigation"

const SCANNER_COMPONENTS = { audio: false, finder: true }

type ScanMode = "checkin" | "gift"

type PendingCheckin = { userId: string; mode: ScanMode }

export default function AdminScanPage() {
  const router = useRouter()
  const [mode, setMode] = useState<ScanMode>("checkin")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "duplicate"
  >("idle")
  const [message, setMessage] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  // เพิ่มตัวแปรอ้างอิงเพื่อล็อคการสแกน ป้องกันปัญหากล้องสแกนรัวๆ หลายครั้งใน 1 วินาที
  const isScanning = useRef(false)
  const syncLock = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ฟังก์ชันช่วยดึงข้อมูลจาก LocalStorage อย่างปลอดภัย ป้องกันแอปแครช
  const getSafePendingCheckins = useCallback((): PendingCheckin[] => {
    try {
      return JSON.parse(localStorage.getItem("pendingCheckins") || "[]")
    } catch (error) {
      return []
    }
  }, [])

  useEffect(() => {
    const verifyAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/") // ถ้าไม่ได้ล็อกอิน ให้เด้งกลับหน้าแรก
        return
      }

      // [ปรับใหม่] ไปเช็คสิทธิ์ในตาราง admin ว่ามี ID นี้อยู่ในรายชื่อแอดมินไหม
      const { data: adminData } = await supabase
        .from("admin")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      if (adminData) {
        setIsCheckingAuth(false) // เป็น Admin ให้เลิกโหลด และโชว์หน้าสแกน
      } else {
        router.replace("/") // ไม่ใช่ Admin ให้เด้งกลับหน้าแรก
      }
    }
    verifyAdmin()
  }, [router])

  // ฟังก์ชันอัปเดตตัวเลขรายการที่ตกค้างในเครื่อง
  const updatePendingCount = useCallback(() => {
    const pending = getSafePendingCheckins()
    setPendingCount(pending.length)
  }, [getSafePendingCheckins])

  // ฟังก์ชันสำหรับดันข้อมูลตกค้างขึ้นเซิร์ฟเวอร์
  const syncOfflineData = useCallback(async () => {
    if (syncLock.current) return
    syncLock.current = true
    setIsSyncing(true)

    try {
      const pending = getSafePendingCheckins()
      if (pending.length === 0) return

      const successfullySynced: PendingCheckin[] = []

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token || ""

      for (const item of pending) {
        try {
          const res = await fetch("/api/user-data", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: item.userId, mode: item.mode }),
          })

          // ถ้ายิงผ่าน (ok) หรือ เซิร์ฟเวอร์บอกว่า ID ปลอม/ไม่มีอยู่จริง (404, 400) ให้เอาออกจากคิวเพื่อป้องกัน Infinite Loop
          if (res.ok || res.status === 404 || res.status === 400) {
            successfullySynced.push(item)
          }
        } catch (err) {
          console.error("Sync error", err)
        }
      }

      // สำคัญ: ดึงข้อมูลล่าสุดอีกครั้ง ป้องกันการเซฟทับคิวที่เพิ่งสแกนเพิ่มระหว่างที่รอ API ตอบกลับ
      const latestPending = getSafePendingCheckins()
      const finalRemaining = latestPending.filter(
        (p) =>
          !successfullySynced.some(
            (s) => s.userId === p.userId && s.mode === p.mode,
          ),
      )
      localStorage.setItem("pendingCheckins", JSON.stringify(finalRemaining))
      updatePendingCount()
    } finally {
      syncLock.current = false
      setIsSyncing(false)
    }
  }, [updatePendingCount])

  // ติดตามสถานะอินเตอร์เน็ต เปิด/ปิด
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineData()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // ใช้ setTimeout เพื่อให้การ setState เป็นแบบ Asynchronous
    // ป้องกันปัญหา cascading renders ตามคำแนะนำของ React
    const initTimer = setTimeout(() => {
      setIsOnline(navigator.onLine)
      updatePendingCount()
      if (navigator.onLine) {
        syncOfflineData()
      }
    }, 0)

    return () => {
      clearTimeout(initTimer)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [syncOfflineData, updatePendingCount])

  // ป้องกัน Memory Leak ลบ Timeout ทิ้งถ้า Admin กดสลับหน้าจอกะทันหัน
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const resetScanner = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setStatus("idle")
    setMessage("")
    isScanning.current = false
  }, [])

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    const userId = detectedCodes?.[0]?.rawValue

    if (!userId || isScanning.current) return

    isScanning.current = true
    setStatus("loading")
    setMessage("กำลังตรวจสอบข้อมูล...")

    const actionLabel = mode === "gift" ? "รับของสำเร็จ" : "เช็คอินสำเร็จ"

    // 1. กรณีไม่มีเน็ต (Offline Mode)
    if (!isOnline) {
      const pending = getSafePendingCheckins()
      if (!pending.some((p) => p.userId === userId && p.mode === mode)) {
        pending.push({ userId, mode })
        localStorage.setItem("pendingCheckins", JSON.stringify(pending))
      }
      updatePendingCount()

      setStatus("success")
      setMessage(`${actionLabel} (ออฟไลน์ - รอซิงก์ข้อมูล)`)
      timeoutRef.current = setTimeout(resetScanner, 1000)
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token || ""

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // ตั้งเวลา Time out ที่ 8 วินาที

      const res = await fetch("/api/user-data", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, mode }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const result = await res.json()

      if (!res.ok) {
        setStatus("error")
        setMessage(result.error || "เกิดข้อผิดพลาดในการอัปเดตคิว")
      } else {
        const firstName = result.data?.user?.first_name || "ไม่ทราบชื่อ"
        const lastName = result.data?.user?.last_name || ""

        if (result.alreadyDone) {
          // สแกนซ้ำ (สถานะเป็นแบบนี้อยู่แล้วก่อนสแกนครั้งนี้) - แจ้งเตือนด้วยตัวอักษรสีแดง
          setStatus("duplicate")
          setMessage(`${result.message}: ${firstName} ${lastName}`)
        } else {
          setStatus("success")
          setMessage(`${actionLabel}: ${firstName} ${lastName}`)
        }
      }

      timeoutRef.current = setTimeout(resetScanner, 1000)
    } catch (err) {
      // 2. กรณีมีเน็ต แต่ดันเน็ตหลุด/ขัดข้องกะทันหันตอนยิง API
      if (
        err instanceof TypeError ||
        (err as Error).message === "Failed to fetch" ||
        (err as Error).name === "AbortError" // ดักจับกรณีที่เน็ตช้ามากจนติด Timeout (8 วินาที)
      ) {
        const pending = getSafePendingCheckins()
        if (!pending.some((p) => p.userId === userId && p.mode === mode)) {
          pending.push({ userId, mode })
          localStorage.setItem("pendingCheckins", JSON.stringify(pending))
        }
        updatePendingCount()
        setStatus("success")
        setMessage("อินเตอร์เน็ตขัดข้อง - บันทึกแบบออฟไลน์แทน")
        timeoutRef.current = setTimeout(resetScanner, 1000)
        return
      }

      setStatus("error")
      setMessage("เกิดข้อผิดพลาดของระบบ")

      timeoutRef.current = setTimeout(resetScanner, 1000)
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
        <div className="w-full flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-[#1a1b4b]">Admin Check-in</h1>
            {/* ป้ายแสดงสถานะการเชื่อมต่อ และ การซิงก์ */}
            {!isOnline ? (
              <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full text-xs font-bold shadow-sm border border-rose-100">
                <WifiOff size={12} />
                <span>Offline Mode</span>
              </div>
            ) : pendingCount > 0 ? (
              <button
                onClick={syncOfflineData}
                className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-xs font-bold shadow-sm border border-orange-100 hover:bg-orange-100 transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={isSyncing ? "animate-spin" : ""}
                />
                <span>Syncing {pendingCount} items...</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-50 text-green-500 rounded-full text-xs font-bold shadow-sm border border-green-100">
                <Wifi size={12} />
                <span>Online</span>
              </div>
            )}
          </div>

          <div className="w-12" />
        </div>

        {/* Mode Toggle: เลือกโหมดสแกน เข้างาน / รับของ */}
        <div className="w-full grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode("checkin")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === "checkin"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <LogIn size={18} />
            เข้างาน
          </button>
          <button
            type="button"
            onClick={() => setMode("gift")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === "gift"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <Gift size={18} />
            รับของ
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden relative shadow-inner mb-8">
          <Scanner
            onScan={handleScan}
            formats={["qr_code"]}
            components={SCANNER_COMPONENTS}
            allowMultiple={true}
          />

          {/* Overlay Status (แสดงทับกล้องตอนสแกนติด) */}
          {status !== "idle" && (
            <div
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in cursor-pointer"
              onClick={status !== "loading" ? resetScanner : undefined}
            >
              {status === "loading" && (
                <Loader2
                  size={48}
                  className="text-indigo-400 animate-spin mb-4"
                />
              )}
              {status === "success" && (
                <CheckCircle2
                  size={64}
                  className="text-green-400 mb-4 animate-bounce"
                />
              )}
              {status === "error" && (
                <XCircle
                  size={64}
                  className="text-rose-500 mb-4 animate-bounce"
                />
              )}
              {status === "duplicate" && (
                <XCircle
                  size={64}
                  className="text-red-500 mb-4 animate-bounce"
                />
              )}

              <p
                className={`text-lg font-bold ${
                  status === "success"
                    ? "text-green-400"
                    : status === "error" || status === "duplicate"
                      ? "text-red-500"
                      : "text-white"
                }`}
              >
                {message}
              </p>
              {/* เพิ่มข้อความแนะนำให้ผู้ใช้กดเพื่อสแกนใหม่ */}
              {status !== "loading" && (
                <p className="text-sm text-slate-400 mt-4">
                  (แตะเพื่อสแกนอีกครั้ง)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Scan Ticket</h2>
          <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
            ให้ผู้เข้าร่วมงานเปิด QR Code จากหน้า Result
            แล้วนำมาสแกนเพื่อเช็คอิน
          </p>
        </div>
      </div>
    </div>
  )
}
