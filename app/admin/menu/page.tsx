"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AdminMenuPage() {
  const [Name, setName] = useState("")
  const [Price, setPrice] = useState("")
  const [Category, setCategory] = useState("starter")
  const [menus, setMenus] = useState<any[]>([])
  const [error, setError] = useState("")
  const [time, setTime] = useState("")

  const BASE_URL = "http://localhost:1337"

  /* ================= TIME HUD ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ================= FETCH MENUS ================= */
  const fetchMenus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/menus`)
      const data = await res.json()
      setMenus(data.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  /* ================= CREATE MENU ================= */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${BASE_URL}/api/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            Name,
            Price: parseFloat(Price),
            Category,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || "Failed to create")
        return
      }

      setName("")
      setPrice("")
      setCategory("starter")
      fetchMenus()
    } catch (err) {
      setError("Server error")
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Platinum Tactical Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl tracking-widest uppercase font-semibold">
              Menu Configuration
            </h1>
            <p className="text-blue-400 text-sm mt-2 tracking-wider">
              ADMINISTRATIVE CONTROL PANEL
            </p>
          </div>

          <div className="text-right font-mono text-blue-400">
            <p className="text-xs opacity-60">SYSTEM TIME</p>
            <p className="text-lg">{time}</p>
            <p className="text-sm text-white/50 mt-2">
              Total Items: {menus.length}
            </p>
          </div>
        </motion.div>

        {/* SPLIT LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* LEFT - CREATE PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <h2 className="text-xl font-semibold tracking-wide">
              Create Menu Asset
            </h2>

            <form onSubmit={handleCreate} className="space-y-5">

              <input
                type="text"
                placeholder="Item Name"
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-blue-400 outline-none transition"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Price"
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-blue-400 outline-none transition"
                value={Price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <select
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-blue-400 outline-none transition"
                value={Category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="starter">Starter</option>
                <option value="main_course">Main Course</option>
                <option value="dessert">Dessert</option>
              </select>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 transition px-6 py-4 rounded-xl font-semibold shadow-[0_0_25px_rgba(0,150,255,0.4)]"
              >
                Deploy Menu Item
              </button>
            </form>
          </motion.div>

          {/* RIGHT - INVENTORY */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold tracking-wide text-blue-400">
              Current Menu Inventory
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {menus.map((item) => (
                <div
                  key={item.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-400/40 transition"
                >
                  <h3 className="text-lg font-semibold tracking-wide">
                    {item.Name}
                  </h3>

                  <p className="text-blue-400 font-mono mt-2">
                    ₹ {item.Price}
                  </p>

                  <p className="text-sm text-white/50 mt-1 uppercase tracking-wide">
                    {item.Category}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}