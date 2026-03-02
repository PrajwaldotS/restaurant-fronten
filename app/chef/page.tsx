"use client"

import { useEffect, useState } from "react"

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

  const BASE_URL = "http://localhost:1337"

  /* ============================
     FETCH ORDERS (Component Based)
  ============================ */
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

  /* ============================
     UPDATE STATUS
  ============================ */
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

  /* ============================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            Chef Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage incoming orders and update cooking status
          </p>
        </div>

        {/* Orders Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {orders.map(order => {
            const total =
              order.item?.reduce(
                (sum, i) => sum + Number(i.price_at_time) * Number(i.quantity),
                0
              ) || 0
              
              
            return (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition"
              >
                {/* Top Section */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Table {order.TableNumber}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status_food === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.status_food === "cooking"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
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
                      className="flex justify-between bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">
                          {orderItem.menu?.Name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Qty: {orderItem.quantity}
                        </p>
                      </div>

                      <span className="text-red-400 font-semibold">
                        ₹{Number(orderItem.price_at_time) * Number(orderItem.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-zinc-700 pt-4 mb-6 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-lg font-medium"
                  >
                    Start Cooking
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(order.documentId, "ready")
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-lg font-medium"
                  >
                    Mark Ready
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center text-zinc-500 mt-20 text-lg">
            No active orders
          </div>
        )}
      </div>
    </div>
  )
}