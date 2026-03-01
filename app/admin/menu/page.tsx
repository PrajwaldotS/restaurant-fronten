"use client"

import { useState, useEffect } from "react"

export default function AdminMenuPage() {
  const [Name, setName] = useState("")
  const [Price, setPrice] = useState("")
  const [Category, setCategory] = useState("starter")
  const [menus, setMenus] = useState<any[]>([])
  const [error, setError] = useState("")


  // Fetch existing menus
  const fetchMenus = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/menus")
      const data = await res.json()
      setMenus(data.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])
  // Create Menu
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(
        "http://localhost:1337/api/menus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              Name,
              Price: parseFloat(Price),
              Category,
            },
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || "Failed to create")
        return
      }

      setName("")
      setPrice("")
      setCategory("starter")

      fetchMenus()

    } catch (err) {
      setError("Server error")
    }
  }

  return (
    <div className="p-8 bg-zinc-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">
        Admin Menu Management
      </h1>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="bg-zinc-800 p-6 rounded-xl mb-8"
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Item Name"
            className="w-full p-3 rounded bg-zinc-700"
            value={Name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="Price"
            className="w-full p-3 rounded bg-zinc-700"
            value={Price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <select
            className="w-full p-3 rounded bg-zinc-700"
            value={Category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="starter">Starter</option>
            <option value="main_course">Main Course</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}

        <button
          type="submit"
          className="bg-green-600 px-6 py-3 rounded hover:bg-green-700"
        >
          Add Menu Item
        </button>
      </form>

      {/* Existing Items */}
      <div className="grid grid-cols-3 gap-4">
        {menus.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-800 p-4 rounded-lg"
          >
            <h2 className="text-lg font-semibold">
              {item.Name}
            </h2>
            <p>₹ {item.Price}</p>
            <p className="text-sm text-gray-400">
              {item.Category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}