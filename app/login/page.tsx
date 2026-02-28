"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(
        "http://localhost:1337/api/auth/local",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: email,
            password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || "Login failed")
        return
      }

      // Save token
      localStorage.setItem("jwt", data.jwt)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Role-based redirect
      const role = data.user.role.name

      if (role === "waiter") {
        router.push("/waiter")
      } else if (role === "chef") {
        router.push("/chef")
      } else if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }

    } catch (err) {
      setError("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-800 p-8 rounded-2xl shadow-xl w-96"
      >
        <h1 className="text-2xl font-bold mb-6">
          Restaurant Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-lg bg-zinc-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-lg bg-zinc-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-400 mb-4 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  )
}