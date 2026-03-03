"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL =
  "http://localhost:1337/api/resturant-setting?populate=logo"

interface RestaurantSettings {
  id: number
  restaurant_name: string
  restaurant_address: string
  phone_no: number
  currency: string
  tax_percentage: number
  service_charge_percentage: number
  logo?: {
    id: number
    url: string
  }
}

export default function RestaurantSettingsPage() {
  const [settings, setSettings] =
    useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  /* ================= TIME HUD ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchSettings = async () => {
    const res = await fetch(API_URL)
    const json = await res.json()
    setSettings(json.data)
  }

  const handleChange = (
    field: keyof RestaurantSettings,
    value: any
  ) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleSubmit = async () => {
    if (!settings) return
    setLoading(true)

    await fetch(
      "http://localhost:1337/api/resturant-setting",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            restaurant_name: settings.restaurant_name,
            restaurant_address: settings.restaurant_address,
            phone_no: settings.phone_no,
            currency: settings.currency,
            tax_percentage: settings.tax_percentage,
            service_charge_percentage:
              settings.service_charge_percentage,
          },
        }),
      }
    )

    setLoading(false)
    alert("Settings Updated Successfully ✅")
  }

  if (!settings)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    )

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Platinum Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl tracking-widest uppercase font-semibold">
              System Configuration
            </h1>
            <p className="text-blue-400 text-sm mt-2 tracking-wider">
              RESTAURANT CORE SETTINGS
            </p>
          </div>

          <div className="text-right font-mono text-blue-400">
            <p className="text-xs opacity-60">SYSTEM TIME</p>
            <p className="text-lg">{time}</p>
          </div>
        </motion.div>

        {/* SPLIT LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* LEFT — BRANDING */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg tracking-wide text-blue-400">
                Identity & Branding
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              <div className="space-y-2">
                <Label className="text-white">Restaurant Name</Label>
                <Input
                  value={settings.restaurant_name || ""}
                  onChange={(e) =>
                    handleChange(
                      "restaurant_name",
                      e.target.value
                    )
                  }
                  className="bg-black/40 border-white/10 focus:border-blue-400 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Restaurant Address</Label>
                <Textarea
                  value={settings.restaurant_address || ""}
                  onChange={(e) =>
                    handleChange(
                      "restaurant_address",
                      e.target.value
                    )
                  }
                  className="bg-black/40 border-white/10 focus:border-blue-400 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Phone Number</Label>
                <Input
                  type="number"
                  value={settings.phone_no || ""}
                  onChange={(e) =>
                    handleChange(
                      "phone_no",
                      Number(e.target.value)
                    )
                  }
                  className="bg-black/40 border-white/10 focus:border-blue-400 text-white"
                />
              </div>

              {settings.logo?.url && (
                <div className="space-y-2">
                  <Label className="text-white">Current Logo</Label>
                  <img
                    src={`http://localhost:1337${settings.logo.url}`}
                    alt="logo"
                    className="h-24 rounded-xl border border-white/10"
                  />
                </div>
              )}

            </CardContent>
          </Card>

          {/* RIGHT — FINANCIAL */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg tracking-wide text-blue-400">
                Financial Parameters
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              <div className="space-y-2">
                <Label className="text-white">Currency</Label>
                <select
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-white focus:border-blue-400"
                  value={settings.currency || "INR"}
                  onChange={(e) =>
                    handleChange(
                      "currency",
                      e.target.value
                    )
                  }
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tax Percentage (%)</Label>
                <Input
                
                  type="number"
                  value={settings.tax_percentage || ""}
                  onChange={(e) =>
                    handleChange(
                      "tax_percentage",
                      Number(e.target.value)
                    )
                  }
                  className="bg-black/40 border-white/10 focus:border-blue-400 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  Service Charge Percentage (%)
                </Label>
                <Input
                  type="number"
                  value={
                    settings.service_charge_percentage || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "service_charge_percentage",
                      Number(e.target.value)
                    )
                  }
                  className="bg-black/40 border-white/10 focus:border-blue-400 text-white"
                />
              </div>

            </CardContent>
          </Card>
        </div>

        {/* SAVE STRIP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(0,150,255,0.4)]"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </motion.div>

      </div>
    </div>
  )
}