"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(
        "http://localhost:1337/api/auth/local",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: email,
            password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || "Invalid credentials")
        setLoading(false)
        return
      }

      // ✅ Now role comes directly from login response
      const jwt = data.jwt
      const user = data.user
      const role = data.user.username  
      
      console.log(role)
      if (!role) {
        setError("User role not found")
        setLoading(false)
        return
      }

      // Save auth data
      localStorage.setItem("jwt", jwt)
      localStorage.setItem("user", JSON.stringify(user))

      // Redirect based on role
      switch (role) {
        case "waiter":
          router.push("/waiter")
          break
        case "chef":
          router.push("/chef")
          break
        case "admin":
          router.push("/admin")
          break
        default:
          router.push("/")
      }

    } catch (err) {
      console.error("Login error:", err)
      setError("Server error. Try again.")
    } finally {
      setLoading(false)
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
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}