"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"

export default function WaiterPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || user.role.name !== "admin") {
      router.push("/login")
    }
  }, [])

  return <div>Waiter Dashboard</div>
}