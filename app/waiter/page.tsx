"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export default function WaiterPage() {
  const [menu, setMenu] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<
    { id: number; quantity: number }[]
  >([])
  const [readyOrders, setReadyOrders] = useState<any[]>([])
  const [pickedOrders, setPickedOrders] = useState<any[]>([])
  const [TableNumber, setTableNumber] = useState<number>(1)
  const [time, setTime] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("Starter")

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const BASE_URL = "http://localhost:1337"

  /* ================= TIME HUD ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders?populate[item][populate]=menu&sort=createdAt:desc`
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

  useEffect(() => {
    fetchOrders()
    pollingRef.current = setInterval(fetchOrders, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  /* ================= FETCH MENU ================= */
  useEffect(() => {
    fetch(`${BASE_URL}/api/menus`)
      .then(res => res.json())
      .then(data => setMenu(data.data))
  }, [])

  /* ================= TOGGLE ITEM ================= */
  const toggleItem = (id: number) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === id)
      if (exists) return prev.filter(i => i.id !== id)
      return [...prev, { id, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    if (!TableNumber || TableNumber <= 0) {
      alert("Please enter a valid table number")
      return
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item")
      return
    }

    const componentItems = selectedItems.map(sel => {
      const menuItem = menu.find(m => m.id === sel.id)
      return {
        menu: sel.id,
        quantity: sel.quantity,
        price_at_time: Number(menuItem?.Price || 0),
      }
    })

    await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          TableNumber,
          status_food: "pending",
          item: componentItems,
        },
      }),
    })

    setSelectedItems([])
    fetchOrders()
  }

  /* ================= MARK PICKED ================= */
  const markPicked = async (order: any) => {
    const total = Number(order.total_amount) || 0

    await fetch(`${BASE_URL}/api/orders/${order.documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { status_food: "picked" },
      }),
    })

    await fetch(`${BASE_URL}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          number: total,
          method: "cash",
          payment_status: "pending",
          order: order.documentId,
        },
      }),
    })

    fetchOrders()
  }

  /* ================= FILTERED MENU ================= */
  const filteredMenu = menu.filter(
    item => item.Category === activeCategory
  )

  const categories = ["Starter ", "main_course", "dessert"]

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#00BFFF_1px,transparent_1px),linear-gradient(to_bottom,#00BFFF_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl tracking-widest uppercase font-semibold">
              Waiter Mode
            </h1>
            <p className="text-cyan-400 text-sm mt-2 tracking-wider">
              LIVE FLOOR OPERATIONS
            </p>
          </div>

          <div className="text-right font-mono text-cyan-400">
            <p className="text-xs opacity-60">SYSTEM TIME</p>
            <p className="text-lg">{time}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* LEFT */}
          <div className="space-y-8">

            {/* Table */}
            <div className="backdrop-blur-xl bg-white/5 border border-cyan-500/20 rounded-2xl p-6">
              <label className="text-sm text-cyan-300">
                Table Number
              </label>
              <input
                type="number"
                value={TableNumber}
                onChange={e =>
                  setTableNumber(Number(e.target.value))
                }
                className="w-full mt-3 bg-black/40 border border-cyan-500/30 rounded-xl px-4 py-3"
              />
            </div>

            {/* Category Selector */}
            <div className="flex gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-xl border transition ${
                    activeCategory === cat
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,191,255,0.5)]"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filtered Menu */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMenu.map(item => {
                const selected = selectedItems.find(i => i.id === item.id)

                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-2xl border backdrop-blur-xl transition ${
                      selected
                        ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(0,191,255,0.3)]"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.Name}
                        </h3>
                      </div>
                      <span className="text-cyan-400 font-mono">
                        ₹{item.Price}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition"
                      >
                        {selected ? "Remove" : "Add"}
                      </button>

                      {selected && (
                        <input
                          type="number"
                          min={1}
                          value={selected.quantity}
                          onChange={e =>
                            updateQuantity(
                              item.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-2"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={placeOrder}
              className="w-full bg-cyan-500 hover:bg-cyan-400 py-4 rounded-2xl text-lg font-semibold shadow-[0_0_30px_rgba(0,191,255,0.4)]"
            >
              Deploy Order
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-cyan-400">
              Ready Orders ({readyOrders.length})
            </h2>

            {readyOrders.map(order => (
              <div
                key={order.documentId}
                className="backdrop-blur-xl bg-white/5 border border-cyan-400/30 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Table {order.TableNumber}
                </h3>

                {order.item?.map((i: any) => (
                  <div
                    key={i.id}
                    className="flex justify-between mb-2 text-sm"
                  >
                    <span>
                      {i.menu?.Name} × {i.quantity}
                    </span>
                    <span className="font-mono">
                      ₹{i.subtotal}
                    </span>
                  </div>
                ))}

                <div className="border-t border-cyan-500/30 mt-4 pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-mono">
                    ₹{order.total_amount}
                  </span>
                </div>

                <button
                  onClick={() => markPicked(order)}
                  className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 py-3 rounded-xl"
                >
                  Mark Picked
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}