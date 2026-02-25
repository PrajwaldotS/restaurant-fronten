"use client"

import { useEffect, useState, useRef } from "react"

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [paidPayments, setPaidPayments] = useState<any[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPayments = async () => {
    try {
      const res = await fetch(
        "http://localhost:1337/api/payments?populate=order&sort=createdAt:desc"
      )
      const data = await res.json()

      const pending = data.data.filter(
        (p: any) => p.payment_status === "pending"
      )

      const paid = data.data.filter(
        (p: any) => p.payment_status === "paid"
      )

      setPendingPayments(pending)
      setPaidPayments(paid)
    } catch (err) {
      console.error("Error fetching payments:", err)
    }
  }

  useEffect(() => {
    fetchPayments()

    pollingRef.current = setInterval(() => {
      fetchPayments()
    }, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const updateMethod = async (
    documentId: string,
    method: string
  ) => {
    await fetch(
      `http://localhost:1337/api/payments/${documentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { method }
        })
      }
    )

    fetchPayments()
  }

  const markPaid = async (documentId: string) => {
    await fetch(
      `http://localhost:1337/api/payments/${documentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { payment_status: "paid" }
        })
      }
    )

    fetchPayments()
  }

  const totalRevenue = paidPayments.reduce(
    (sum: number, p: any) => sum + Number(p.amount),
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Billing & Payments
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage restaurant billing and revenue
          </p>
        </div>

        {/* Revenue Overview */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-lg mb-12">
          <h2 className="text-xl font-semibold mb-4">
            Revenue Overview
          </h2>
          <p className="text-3xl font-bold text-green-400">
            ₹{totalRevenue}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            Total Paid Revenue
          </p>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">
              Pending Payments
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {pendingPayments.map(payment => {
                const tax = Number(payment.amount) * 0.05
                const grandTotal =
                  Number(payment.amount) + tax

                return (
                  <div
                    key={payment.documentId}
                    className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-md"
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        Table {payment.order?.TableNumber}
                      </h3>
                      <span className="text-yellow-400 text-sm">
                        PENDING
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{payment.amount}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Tax (5%)</span>
                        <span>
                          ₹{tax.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between font-bold text-green-400 border-t border-zinc-700 pt-2">
                        <span>Total</span>
                        <span>
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <select
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 mb-4"
                      value={payment.method}
                      onChange={(e) =>
                        updateMethod(
                          payment.documentId,
                          e.target.value
                        )
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>

                    <button
                      onClick={() =>
                        markPaid(payment.documentId)
                      }
                      className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition px-4 py-3 rounded-xl font-semibold"
                    >
                      Mark as Paid
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Paid Payments */}
        {paidPayments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-green-500 mb-6">
              Paid Bills
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {paidPayments.map(payment => (
                <div
                  key={payment.documentId}
                  className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 opacity-80"
                >
                  <div className="flex justify-between mb-2">
                    <span>
                      Table {payment.order?.TableNumber}
                    </span>
                    <span className="text-green-400 font-bold">
                      ₹{payment.amount}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm">
                    Method:{" "}
                    {payment.method.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}