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
    <div style={{ padding: "20px" }}>
      <h1>Waiter Dashboard</h1>

      <div>
        <label>Table Number: </label>
        <input
          type="number"
          value={TableNumber}
          onChange={(e) => setTableNumber(Number(e.target.value))}
        />
      </div>

      <h2>Menu</h2>

      {menu.map(item => (
        <div key={item.id}>
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => toggleItem(item.id)}
          />
          {item.Name} - ₹{item.Price}
        </div>
      ))}

      <button className="bg-red-200 text-black m-2" onClick={placeOrder} style={{ marginTop: "10px" }}>
        Place Order
      </button>
    </div>
  )
}