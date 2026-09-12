"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "@/app/component/table/Table"
import { PaginationControls } from "@/app/component/pagination/Pagination"
import { Search, Loader2 } from "lucide-react"
import { supabase } from "@/utils/supabase"

interface QueueItem {
  id: string
  user_id: string
  queue_number: number
  username: string
  employee_id: string
  branch: string | null
  status: string
  gift_status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // State สำหรับช่องค้นหา
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  // เรียกใช้เมื่อ page หรือ searchQuery เปลี่ยน
  useEffect(() => {
    let ignore = false // เพิ่ม ignore flag ป้องกัน Race Condition

    // ประกาศฟังก์ชัน async ไว้ข้างใน useEffect และเรียกใช้ทันที
    const fetchData = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const token = session?.access_token || ""

        const res = await fetch(
          `/api/user-data?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const json = await res.json()
        if (!ignore) {
          // ตรวจสอบว่านี่คือผลลัพธ์รอบล่าสุดหรือไม่
          if (res.ok) {
            setData(json.data || [])
            setTotalPages(json.meta?.totalPages || 1)
          } else {
            console.error(json.error)
          }
        }
      } catch (error) {
        if (!ignore) console.error("Failed to fetch data:", error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchData()

    return () => {
      ignore = true // เมื่อ useEffect ถูกเรียกซ้ำ จะตั้งค่าให้ผลลัพธ์รอบเก่าถูก ignore ทันที
    }
  }, [page, searchQuery])

  // ค้นหาเมื่อผู้ใช้กด Enter หรือกดปุ่มค้นหา (ไม่ต้องหน่วงเวลา)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput) // อัปเดต searchQuery เพื่อสั่งให้ fetchData ทำงาน
    setPage(1) // รีเซ็ตกลับไปหน้า 1
  }

  // ฟังก์ชันอัปเดตสถานะ (field คือ "status" สำหรับเข้างาน หรือ "gift_status" สำหรับรับของ)
  const handleStatusChange = async (
    userId: string,
    field: "status" | "gift_status",
    newValue: string,
  ) => {
    setUpdating(userId)

    // หาค่าสถานะเดิมของคนนี้เก็บไว้ เพื่อ rollback เฉพาะคนกรณีที่เกิด Error
    const oldValue =
      data.find((item) => item.user_id === userId)?.[field] ||
      (field === "status" ? "waiting" : "pending")

    // อัปเดตข้อมูลบนหน้าจอไปก่อนเลย (Optimistic UI) เพื่อความลื่นไหล
    setData((prev) =>
      prev.map((item) =>
        item.user_id === userId ? { ...item, [field]: newValue } : item,
      ),
    )

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token || ""

      const mode = field === "gift_status" ? "gift" : "checkin"
      const res = await fetch("/api/user-data", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, mode, status: newValue }),
      })
      if (!res.ok) throw new Error("API responded with an error")
    } catch (error) {
      console.error("Update failed:", error)
      // ถ้าอัปเดตพัง ให้ Rollback ข้อมูลของคนนี้คนเดียวกลับเป็นเหมือนเดิม
      setData((prev) =>
        prev.map((item) =>
          item.user_id === userId ? { ...item, [field]: oldValue } : item,
        ),
      )
      alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้")
    } finally {
      setUpdating(null)
    }
  }

  // ตั้งค่าคอลัมน์สำหรับ DataTable
  const columns = [
    { key: "queue_number" as keyof QueueItem, header: "Queue No." },
    { key: "employee_id" as keyof QueueItem, header: "Employee ID" },
    { key: "username" as keyof QueueItem, header: "Name" },
    { key: "branch" as keyof QueueItem, header: "Branch" },
    {
      key: "status" as keyof QueueItem,
      header: "Check-in",
      render: (row: QueueItem) => (
        <select
          value={row.status}
          disabled={updating === row.user_id}
          onChange={(e) =>
            handleStatusChange(row.user_id, "status", e.target.value)
          }
          className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none transition-colors disabled:opacity-50 ${
            row.status === "checked_in"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          <option value="waiting">Waiting</option>
          <option value="checked_in">Checked In</option>
        </select>
      ),
    },
    {
      key: "gift_status" as keyof QueueItem,
      header: "Gift",
      render: (row: QueueItem) => (
        <select
          value={row.gift_status}
          disabled={updating === row.user_id}
          onChange={(e) =>
            handleStatusChange(row.user_id, "gift_status", e.target.value)
          }
          className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none transition-colors disabled:opacity-50 ${
            row.gift_status === "received"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          <option value="pending">Pending</option>
          <option value="received">Received</option>
        </select>
      ),
    },
    {
      key: "created_at" as keyof QueueItem,
      header: "Registered Date",
      render: (row: QueueItem) =>
        new Date(row.created_at).toLocaleString("th-TH"),
    },
  ]

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Header & Search */}
      <div className="flex w-full mb-8">
        <form onSubmit={handleSearchSubmit} className="flex w-full gap-3">
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้งาน... (กด Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shrink-0 shadow-sm"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* Table & Pagination Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.length > 0 ? (
            <>
              <DataTable
                rows={data}
                columns={columns}
                currentPage={page}
                pageSize={10}
              />

              {totalPages > 0 && (
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="pt-4"
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-500">ไม่พบข้อมูลผู้ใช้งาน</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
