"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = "http://localhost:1337/api/resturant-setting?populate=logo"

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
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const res = await fetch(API_URL)
    const json = await res.json()
    setSettings(json.data)
  }

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    if (!settings) return

    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const handleSubmit = async () => {
    if (!settings) return

    setLoading(true)

    await fetch("http://localhost:1337/api/resturant-setting", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          restaurant_name: settings.restaurant_name,
          restaurant_address: settings.restaurant_address,
          phone_no: settings.phone_no,
          currency: settings.currency,
          tax_percentage: settings.tax_percentage,
          service_charge_percentage: settings.service_charge_percentage,
        },
      }),
    })

    setLoading(false)
    alert("Settings Updated Successfully ✅")
  }

  if (!settings) return <div>Loading...</div>

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label>Restaurant Name</Label>
            <Input
              value={settings.restaurant_name || ""}
              onChange={(e) =>
                handleChange("restaurant_name", e.target.value)
              }
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Restaurant Address</Label>
            <Textarea
              value={settings.restaurant_address || ""}
              onChange={(e) =>
                handleChange("restaurant_address", e.target.value)
              }
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="number"
              value={settings.phone_no || ""}
              onChange={(e) =>
                handleChange("phone_no", Number(e.target.value))
              }
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              className="w-full rounded-md border p-2"
              value={settings.currency || "INR"}
              onChange={(e) =>
                handleChange("currency", e.target.value)
              }
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <Label>Tax Percentage (%)</Label>
            <Input
              type="number"
              value={settings.tax_percentage || ""}
              onChange={(e) =>
                handleChange("tax_percentage", Number(e.target.value))
              }
            />
          </div>

          {/* Service Charge */}
          <div className="space-y-2">
            <Label>Service Charge Percentage (%)</Label>
            <Input
              type="number"
              value={settings.service_charge_percentage || ""}
              onChange={(e) =>
                handleChange(
                  "service_charge_percentage",
                  Number(e.target.value)
                )
              }
            />
          </div>

          {/* Logo Preview */}
          {settings.logo?.url && (
            <div className="space-y-2">
              <Label>Current Logo</Label>
              <img
                src={`http://localhost:1337${settings.logo.url}`}
                alt="logo"
                className="h-24 rounded-md border"
              />
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}