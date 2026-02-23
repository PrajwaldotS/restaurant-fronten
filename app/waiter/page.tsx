"use client"

import { useEffect, useState } from "react"
import { MenuItem } from "../types/types"

export default function WaiterPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [TableNumber, setTableNumber] = useState<number>(1)

  useEffect(() => {
    fetch("http://localhost:1337/api/menus")
      .then(res => res.json())
      .then(data => setMenu(data.data))
  }, [])

  const toggleItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const placeOrder = async () => {
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

    alert("Order placed!")
    setSelectedItems([])
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          🍽 Waiter Dashboard
        </h1>
        <p className="text-zinc-400 mt-2">
          Take customer orders and send them to the kitchen
        </p>
      </div>

      {/* Table Number Card */}
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

      {/* Menu Section */}
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

      {/* Order Summary + Button */}
      <div className="mt-8 flex items-center justify-between bg-zinc-800/60 backdrop-blur-md border border-zinc-700 rounded-2xl p-6 shadow-xl">
        <div>
          <p className="text-sm text-zinc-400">Items Selected</p>
          <p className="text-2xl font-bold text-red-400">
            {selectedItems.length}
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 px-8 py-3 rounded-xl font-semibold text-lg shadow-lg"
        >
           Place Order
        </button>
      </div>

    </div>
  </div>
)
}