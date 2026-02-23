"use client"

import { useEffect, useState } from "react"

interface Order {
  id: number
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
    setOrders(data.data)
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:1337/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { status_food: status }
      })
    })

    fetchOrders()
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chef Dashboard</h1>

      {orders.map(order => (
        <div key={order.id} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
          <h3>Table: {order.TableNumber}</h3>
          <p>Status: {order.status_food}</p>

          <p>Items:</p>
          <ul>
            {order.items?.map(item => (
              <li key={item.id}>
                {item.Name} - ₹{item.Price}
              </li>
            ))}
          </ul>

          <button className="bg-red-200 text-black m-2" onClick={() => updateStatus(order.id, "cooking")}>
            Start Cooking
          </button>

          <button className="bg-red-200 text-black m-2" onClick={() => updateStatus(order.id, "ready")}>
            Mark Ready
          </button>
        </div>
      ))}
    </div>
  )
}