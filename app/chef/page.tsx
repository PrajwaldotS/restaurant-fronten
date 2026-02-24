"use client"

import { useEffect, useState } from "react"

interface Order {
  id: number
  documentId: string
  TableNumber: number
  status_food: string
  items: {
    id: number
    Name: string
    Price: number
  }[]
}

export default function ChefPage() {
  const [orders, setOrders] = useState<Order[]>([])

 const fetchOrders = async () => {
  const res = await fetch("http://localhost:1337/api/orders?populate=*")
  const data = await res.json()

  const filtered = data.data.filter((order: any) =>
    order.status_food !== "ready"
  )

  setOrders(filtered)
}
  

  const updateStatus = async (documentId: string, status: string) => {
    await fetch(`http://localhost:1337/api/orders/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { status_food: status }
      })
    })

    fetchOrders()
  }
  useEffect(() => {
  fetchOrders()
  const interval = setInterval(fetchOrders, 3000)
  return () => clearInterval(interval)
}, [])

 return (
  <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
           Chef Dashboard
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage incoming orders and update cooking status
        </p>
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {orders.map(order => (
          <div
            key={order.id}
            className="bg-zinc-800/60 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-xl hover:border-zinc-500 transition-all duration-200"
          >
            {/* Top Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                 Table {order.TableNumber}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status_food === "pending"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                    : order.status_food === "cooking"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                    : order.status_food === "ready"
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-zinc-700 text-zinc-300"
                }`}
              >
                {order.status_food.toUpperCase()}
              </span>
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <p className="text-sm text-zinc-400 mb-2">Items</p>
              <ul className="space-y-2">
                {order.items?.map(item => (
                  <li
                    key={item.id}
                    className="flex justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2"
                  >
                    <span>{item.Name}</span>
                    <span className="text-red-400 font-medium">
                      ₹{item.Price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(order.documentId, "cooking")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 px-4 py-2 rounded-xl font-medium shadow-md"
              >
               Start Cooking
              </button>

              <button
                onClick={() => updateStatus(order.documentId, "ready")}
                className="flex-1 bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-200 px-4 py-2 rounded-xl font-medium shadow-md"
              >
                ✅ Mark Ready
              </button>
            </div>
          </div>
        ))}

      </div>

      {orders.length === 0 && (
        <div className="text-center text-zinc-500 mt-16 text-lg">
          No orders yet...
        </div>
      )}

    </div>
  </div>
)
}