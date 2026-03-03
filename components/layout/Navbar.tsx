"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import { motion } from "framer-motion"

interface Props {
  role?: "admin" | "chef" | "waiter"
}

export default function Navbar({ role = "admin" }: Props) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const roleLabel =
    role === "admin"
      ? "Strategic Control"
      : role === "chef"
      ? "Kitchen Command"
      : "Floor Operations"

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative h-16 flex items-center justify-between px-8
                 backdrop-blur-2xl
                 bg-black/60
                 border-b border-white/10"
    >
      {/* Electric Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* LEFT */}
      <div className="flex items-center gap-5">
        <div className="text-lg font-semibold tracking-widest uppercase">
          Restaurant OS
        </div>

        <Separator orientation="vertical" className="h-6 bg-white/10" />

        <div className="text-xs uppercase tracking-wider text-blue-400">
          {roleLabel}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        <div className="hidden md:block text-right font-mono text-blue-400">
          <p className="text-[10px] opacity-60 uppercase">
            System Time
          </p>
          <p className="text-sm">{time}</p>
        </div>

        <Separator orientation="vertical" className="h-6 bg-white/10" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 transition"
            >
              <User className="h-5 w-5 text-white" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-black/80 backdrop-blur-xl border border-white/10 text-white"
          >
            <DropdownMenuItem className="hover:bg-white/10">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10 text-red-400">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </motion.div>
  )
}