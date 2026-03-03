"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface OrderItem {
  id: number
  quantity: number
  price_at_time: number
  subtotal: number
  menu: {
    id: number
    Name: string
    category: string
  }
}

interface Order {
  id: number
  documentId: string
  TableNumber: number
  status_food: string
  item: OrderItem[]
}

export default function ChefPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [time, setTime] = useState<string>("")

  const BASE_URL = "http://localhost:1337"

  /* ================= TIME HUD ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(
        `${BASE_URL}/api/orders?populate[item][populate]=menu&sort=createdAt:desc`
      )
      const data = await res.json()

      const activeOrders = data.data.filter(
        (order: any) =>
          order.status_food === "pending" ||
          order.status_food === "cooking"
      )

      setOrders(activeOrders)
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (
    documentId: string,
    status: string
  ) => {
    await fetch(`${BASE_URL}/api/orders/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { status_food: status },
      }),
    })
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#1E90FF_1px,transparent_1px),linear-gradient(to_bottom,#1E90FF_1px,transparent_1px)] bg-[size:70px_70px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl tracking-widest uppercase font-semibold">
              Chef Command
            </h1>
            <p className="text-blue-400 text-sm mt-2 tracking-wider">
              ACTIVE COOKING OPERATIONS
            </p>
          </div>

          <div className="text-right font-mono text-blue-400">
            <p className="text-xs opacity-60">SYSTEM TIME</p>
            <p className="text-lg">{time}</p>
          </div>
        </motion.div>

        {/* Orders Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {orders.map(order => {
            const total =
              order.item?.reduce(
                (sum, i) =>
                  sum +
                  Number(i.price_at_time) *
                    Number(i.quantity),
                0
              ) || 0

            const statusColor =
              order.status_food === "pending"
                ? "border-yellow-400/40 shadow-[0_0_25px_rgba(255,200,0,0.25)]"
                : "border-blue-400/40 shadow-[0_0_25px_rgba(0,150,255,0.25)]"

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`backdrop-blur-xl bg-white/5 border rounded-2xl p-6 transition ${statusColor}`}
              >
                {/* Top */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold tracking-wide">
                    Table {order.TableNumber}
                  </h3>

                  <span
                    className={`px-4 py-1 rounded-full text-xs font-mono tracking-wider ${
                      order.status_food === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {order.status_food.toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {order.item?.map(orderItem => (
                    <div
                      key={orderItem.id}
                      className="flex justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="font-medium tracking-wide">
                          {orderItem.menu?.Name}
                        </p>
                        <p className="text-xs text-white/40">
                          Qty: {orderItem.quantity}
                        </p>
                      </div>

                      <span className="text-blue-400 font-mono">
                        ₹
                        {Number(
                          orderItem.price_at_time
                        ) * Number(orderItem.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-white/10 pt-4 mb-6 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-mono text-blue-400">
                    ₹{total}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      updateStatus(
                        order.documentId,
                        "cooking"
                      )
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(0,150,255,0.4)]"
                  >
                    Start Cooking
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.documentId,
                        "ready"
                      )
                    }
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 transition px-4 py-3 rounded-xl font-medium"
                  >
                    Mark Ready
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/40 mt-20 text-lg font-mono"
          >
            NO ACTIVE MISSIONS
          </motion.div>
        )}

      </div>
    </div>
  )
}