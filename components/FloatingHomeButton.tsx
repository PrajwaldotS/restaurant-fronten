"use client"

import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function FloatingHomeButton() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <button
        onClick={() => router.push("/")}
        className="
          group
          relative
          h-14 w-14
          rounded-full
          backdrop-blur-2xl
          bg-black/60
          border border-white/10
          shadow-[0_0_30px_rgba(0,150,255,0.25)]
          flex items-center justify-center
          transition
          hover:scale-110
        "
      >
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full border border-blue-500/30 group-hover:border-blue-400 transition" />

        <Home className="h-6 w-6 text-blue-400 group-hover:text-white transition" />
      </button>
    </motion.div>
  )
}