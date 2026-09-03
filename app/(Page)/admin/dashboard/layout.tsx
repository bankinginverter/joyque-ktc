"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Users, UploadCloud, LogOut, Menu, X, ScanQrCode } from "lucide-react"
import { supabase } from "@/utils/supabase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin")
  }

  const navItems = [
    { name: "User Data", href: "/admin/dashboard/user-data", icon: Users },
    {
      name: "Upload CSV",
      href: "/admin/dashboard/import-csv",
      icon: UploadCloud,
    },
    {
      name: "Scanner Checkin",
      href: "/admin/scanner",
      icon: ScanQrCode,
    },
  ]

  return (
    <div className="min-h-[100dvh] bg-white flex font-sans overflow-hidden">
      {/* Mobile Header (Glassmorphism) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/50 z-30 flex items-center justify-between px-4">
        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-wider">
          ADMIN
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/50 rounded-xl shadow-sm text-slate-800 border border-slate-200/50"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-[100dvh] w-72 bg-white md:bg-transparent flex flex-col transition-transform duration-300 ease-out z-40 shadow-2xl md:shadow-none ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo / Header */}
        <div className="hidden md:flex p-8 items-center h-24 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 mr-3 shadow-lg shadow-indigo-200" />
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-widest">
            ADMIN
          </h1>
        </div>

        {/* Mobile menu logo area */}
        <div className="flex md:hidden p-6 border-b border-slate-100 items-center justify-between shrink-0">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-widest">
            MENU
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  setIsMobileMenuOpen(false) // ปิดเมนูบนมือถือเมื่อกดเลือก
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left group ${
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-purple-700"
                      : "text-slate-400 group-hover:text-indigo-600 transition-colors"
                  }
                />
                <span className="font-semibold">{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 mb-4 shrink-0 mx-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 text-left font-semibold group"
          >
            <LogOut
              size={20}
              className="text-rose-400 group-hover:text-rose-500 transition-colors"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay สำหรับคลิกเพื่อปิด Sidebar บนมือถือ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-[100dvh] overflow-auto relative bg-slate-50 md:rounded-l-[2.5rem] md:border-l border-slate-200/60 md:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
