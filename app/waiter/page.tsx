"use client"

import { useEffect, useState, useRef } from "react"

export default function WaiterPage() {
  const [menu, setMenu] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<
    { id: number; quantity: number }[]
  >([])
  const [readyOrders, setReadyOrders] = useState<any[]>([])
  const [pickedOrders, setPickedOrders] = useState<any[]>([])
  const [TableNumber, setTableNumber] = useState<number>(1)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const BASE_URL = "http://localhost:1337"

  /* ============================
     FETCH ORDERS
  ============================ */
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

  /* ============================
     FETCH MENU
  ============================ */
  useEffect(() => {
    fetch(`${BASE_URL}/api/menus`)
      .then(res => res.json())
      .then(data => setMenu(data.data))
  }, [])

  /* ============================
     TOGGLE ITEM
  ============================ */
  const toggleItem = (id: number) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === id)

      if (exists) {
        return prev.filter(i => i.id !== id)
      }

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

  /* ============================
     PLACE ORDER (NO SUBTOTAL SENT)
  ============================ */
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

  /* ============================
     MARK AS PICKED + CREATE PAYMENT
  ============================ */
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

  /* ============================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold">
          Waiter Dashboard
        </h1>

        {/* TABLE INPUT */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="text-sm text-zinc-400">
            Table Number
          </label>
          <input
            type="number"
            value={TableNumber}
            onChange={e =>
              setTableNumber(Number(e.target.value))
            }
            className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
          />
        </div>

        {/* MENU GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {menu.map(item => {
            const selected = selectedItems.find(
              i => i.id === item.id
            )

            return (
              <div
                key={item.id}
                className={`p-6 rounded-xl border transition ${
                  selected
                    ? "border-red-500 bg-red-500/10"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {item.Name}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {item.Category}
                    </p>
                  </div>
                  <span className="text-red-400 font-bold">
                    ₹{item.Price}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="px-4 py-2 bg-red-600 rounded-lg"
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
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* PLACE ORDER */}
        <button
          onClick={placeOrder}
          className="w-full bg-red-600 py-4 rounded-xl text-lg font-semibold"
        >
          Place Order
        </button>

        {/* READY ORDERS */}
        <div className="space-y-6">
          {readyOrders.map(order => (
            <div
              key={order.documentId}
              className="bg-green-900/20 border border-green-500 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">
                Table {order.TableNumber}
              </h3>

              {order.item?.map((i: any) => (
                <div
                  key={i.id}
                  className="flex justify-between mb-2"
                >
                  <span>
                    {i.menu?.Name} × {i.quantity}
                  </span>
                  <span>₹{i.subtotal}</span>
                </div>
              ))}

              <div className="border-t border-green-500 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>

              <button
                onClick={() => markPicked(order)}
                className="mt-4 w-full bg-green-600 py-3 rounded-lg"
              >
                Mark Picked
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}