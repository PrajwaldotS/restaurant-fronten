"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const API_URL =
  "http://localhost:1337/api/resturant-setting?populate=logo"

interface RestaurantSettings {
  restaurant_name: string
  logo?: {
    url: string
  }
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Menu",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Restaurant Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [settings, setSettings] =
    useState<RestaurantSettings | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch(API_URL)
      const json = await res.json()
      setSettings(json.data)
    } catch (err) {
      console.error("Failed to load restaurant settings", err)
    }
  }

  return (
    <div className="flex h-screen  w-64 flex-col border-r bg-white dark:bg-zinc-900">
      {/* Top Branding Section */}
      <div className="flex flex-col items-center gap-3 border-b p-2">
        {settings?.logo?.url && (
          <img
            src={`http://localhost:1337${settings.logo.url}`}
            alt="logo"
            className="h-14 w-14 rounded-full object-cover border"
          />
        )}

        <h2 className="text-lg font-semibold text-center">
          {settings?.restaurant_name || "Restaurant Admin"}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 text-xs text-center text-zinc-400">
        Powered by Strapi + Next.js
      </div>
    </div>
  )
}