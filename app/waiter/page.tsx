"use client"

import { useEffect, useState, useRef } from "react"
import { MenuItem } from "../types/types"

export default function WaiterPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [readyOrders, setReadyOrders] = useState<any[]>([])
  const [pickedOrders, setPickedOrders] = useState<any[]>([])
  const [TableNumber, setTableNumber] = useState<number>(1)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Centralized Fetch Orders (Stable + Sorted)
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:1337/api/orders?populate=items&sort=createdAt:desc"
      )
      const data = await res.json()

      const ready = data.data.filter(
        (order: any) => order.status_food === "ready"
      )

      const picked = data.data.filter(
        (order: any) => order.status_food === "picked"
      )

      setReadyOrders(ready)
      setPickedOrders(picked)
    } catch (err) {
      console.error("Error fetching orders:", err)
    }
  }

  // ✅ Start Polling (Safe)
  useEffect(() => {
    fetchOrders()

    pollingRef.current = setInterval(() => {
      fetchOrders()
    }, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // ✅ Fetch Menu Once
  useEffect(() => {
    fetch("http://localhost:1337/api/menus")
      .then(res => res.json())
      .then(data => setMenu(data.data))
  }, [])

  const toggleItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const placeOrder = async () => {
    if (!TableNumber || TableNumber <= 0) {
      alert("Please enter a valid table number")
      return
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item")
      return
    }

    await fetch("http://localhost:1337/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          TableNumber,
          status_food: "pending",
          items: selectedItems
        }
      })
    })

    setSelectedItems([])
    fetchOrders() // immediate refresh
  }

const markPicked = async (order: any) => {
  const total =
    order.items?.reduce(
      (sum: number, item: any) => sum + Number(item.Price),
      0
    ) || 0

  // Update order status
  await fetch(
    `http://localhost:1337/api/orders/${order.documentId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { status_food: "picked" }
      })
    }
  )

  // Create payment
  await fetch("http://localhost:1337/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        number: total,
        method: "cash",
        payment_status: "pending",
        order: order.id  
      }
    })
  })
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Waiter Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">
            Take customer orders and send them to the kitchen
          </p>
        </div>

        {/* Table Number */}
        <div className="bg-zinc-800/60 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-xl mb-8">
          <label className="block text-sm text-zinc-400 mb-2">
            Table Number
          </label>
          <input
            type="number"
            value={TableNumber}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>

        {/* Menu */}
        <div className="bg-zinc-800/60 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Menu</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {menu.map(item => (
              <label
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedItems.includes(item.id)
                    ? "bg-red-600/20 border-red-500"
                    : "bg-zinc-900 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <div>
                  <p className="font-medium text-lg">{item.Name}</p>
                  <p className="text-zinc-400 text-sm">{item.Category}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-red-400">
                    ₹{item.Price}
                  </span>

                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 accent-red-500"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order Button */}
        <div className="mt-8 flex items-center justify-between bg-zinc-800/60 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-xl">
          <div>
            <p className="text-sm text-zinc-400">Items Selected</p>
            <p className="text-2xl font-bold text-red-400">
              {selectedItems.length}
            </p>
          </div>

          <button
            onClick={placeOrder}
            disabled={!TableNumber || selectedItems.length === 0}
            className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition ${
              !TableNumber || selectedItems.length === 0
                ? "bg-zinc-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 active:scale-95"
            }`}
          >
            Place Order
          </button>
        </div>

      </div>

      {/* READY SECTION */}
      {readyOrders.map(order => {
        const total =
          order.items?.reduce(
            (sum: number, item: any) => sum + Number(item.Price),
            0
          ) || 0

        return (
          <div
            key={order.documentId}
            className="bg-gradient-to-br from-green-900/40 to-zinc-900 border border-green-500/40 rounded-2xl p-6 shadow-lg mt-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Table {order.TableNumber}
              </h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/40">
                READY
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2"
                >
                  <span>{item.Name}</span>
                  <span className="text-red-400 font-medium">
                    ₹{item.Price}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-zinc-700 pt-4 mb-4">
              <span className="text-lg font-medium text-zinc-300">
                Total
              </span>
              <span className="text-2xl font-bold text-green-400">
                ₹{total}
              </span>
            </div>

            <button
              onClick={() => markPicked(order)}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-200 px-4 py-3 rounded-xl font-semibold"
            >
              Mark as Picked
            </button>
          </div>
        )
      })}

      {/* HISTORY */}
      {pickedOrders.length > 0 && (
        <div className="mt-20 px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-400">
              Order History
            </h2>

            <span className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm font-medium">
              {pickedOrders.length} Completed
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pickedOrders.map(order => (
              <div
                key={order.documentId}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-md opacity-80 hover:opacity-100 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Table {order.TableNumber}
                  </h3>
                  <span className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm">
                    PICKED
                  </span>
                </div>

                <div className="h-px bg-zinc-700 mb-4" />

                <div className="space-y-2 mb-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2"
                    >
                      <span>{item.Name}</span>
                      <span className="text-red-400 font-medium">
                        ₹{item.Price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}