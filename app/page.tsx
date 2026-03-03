"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function RoleGateway() {
  const router = useRouter()
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">

      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 text-center space-y-14">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl tracking-widest uppercase font-semibold">
            Restaurant OS
          </h1>
          <p className="text-blue-400 tracking-wide mt-4 text-sm">
            SELECT OPERATION MODE
          </p>
        </motion.div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* ADMIN */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 cursor-pointer transition hover:border-blue-400/40"
            onClick={() => setShowAdminMenu(true)}
          >
            <h2 className="text-2xl font-semibold tracking-wide">
              Admin
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Strategic Control
            </p>
          </motion.div>

          {/* CHEF */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 cursor-pointer transition hover:border-blue-400/40"
            onClick={() => router.push("/chef")}
          >
            <h2 className="text-2xl font-semibold tracking-wide">
              Chef
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Kitchen Command
            </p>
          </motion.div>

          {/* WAITER */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 cursor-pointer transition hover:border-blue-400/40"
            onClick={() => router.push("/waiter")}
          >
            <h2 className="text-2xl font-semibold tracking-wide">
              Waiter
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Floor Operations
            </p>
          </motion.div>

        </div>
      </div>

      {/* ADMIN POPUP */}
      <AnimatePresence>
        {showAdminMenu && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 space-y-8 w-[400px]"
            >
              <h3 className="text-xl tracking-widest uppercase text-blue-400">
                Admin Access
              </h3>

              <div className="space-y-4">

                <button
                  onClick={() => router.push("/admin")}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => router.push("/admin/menu")}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
                >
                  Menu Management
                </button>

                <button
                  onClick={() => router.push("/admin/settings")}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
                >
                  Settings
                </button>

              </div>

              <button
                onClick={() => setShowAdminMenu(false)}
                className="w-full text-sm text-white/40 hover:text-white transition"
              >
                Cancel
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}