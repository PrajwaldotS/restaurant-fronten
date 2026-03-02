"use client"

import { useEffect, useState, useRef } from "react"

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [paidPayments, setPaidPayments] = useState<any[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const BASE_URL = "http://localhost:1337"

  /* ============================
     FETCH PAYMENTS (Deep Populate)
  ============================ */
  const fetchPayments = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/payments?populate[order][populate][item][populate]=menu&sort=createdAt:desc`
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

    pollingRef.current = setInterval(fetchPayments, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  /* ============================
     UPDATE METHOD
  ============================ */
  const updateMethod = async (
    documentId: string,
    method: string
  ) => {
    await fetch(`${BASE_URL}/api/payments/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { method },
      }),
    })

    fetchPayments()
  }

  /* ============================
     MARK AS PAID
  ============================ */
  const markPaid = async (documentId: string) => {
    await fetch(`${BASE_URL}/api/payments/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { payment_status: "paid" },
      }),
    })

    fetchPayments()
  }

  /* ============================
     SAFE SUBTOTAL CALCULATION
  ============================ */
  const calculateSubtotal = (payment: any) => {
    const subtotal =
      payment.order?.item?.reduce(
        (sum: number, i: any) =>
          sum +
          (Number(i.price_at_time) || 0) *
            (Number(i.quantity) || 0),
        0
      ) || Number(payment.number) || 0

    return subtotal
  }

  /* ============================
     TOTAL REVENUE
  ============================ */
  const totalRevenue = paidPayments.reduce(
    (sum: number, payment: any) =>
      sum + calculateSubtotal(payment),
    0
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            Billing & Payments
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage restaurant billing and revenue
          </p>
        </div>

        {/* Revenue Overview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Revenue Overview
          </h2>
          <p className="text-3xl font-bold text-green-400">
            ₹{totalRevenue.toFixed(2)}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            Total Paid Revenue
          </p>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">
              Pending Payments
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {pendingPayments.map(payment => {
                const subtotal =
                  calculateSubtotal(payment)

                const tax = subtotal * 0.05
                const grandTotal = subtotal + tax

                return (
                  <div
                    key={payment.documentId}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                  >
                    <div className="flex justify-between mb-6">
                      <h3 className="font-semibold text-lg">
                        Table {payment.order?.TableNumber}
                      </h3>
                      <span className="text-yellow-400 text-sm">
                        PENDING
                      </span>
                    </div>

                    {/* Item Breakdown */}
                    {payment.order?.item?.map((i: any) => (
                      <div
                        key={i.id}
                        className="flex justify-between text-sm text-zinc-300 mb-2"
                      >
                        <span>
                          {i.menu?.Name} × {i.quantity}
                        </span>
                        <span>
                          ₹
                          {(Number(i.price_at_time) *
                            Number(i.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-zinc-800 my-4" />

                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax (5%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-green-400 border-t border-zinc-800 pt-3 mt-3">
                      <span>Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <select
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 mt-6 mb-4"
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
                      className="w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-lg font-semibold"
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

            <div className="grid md:grid-cols-2 gap-8">
              {paidPayments.map(payment => {
                const subtotal =
                  calculateSubtotal(payment)

                return (
                  <div
                    key={payment.documentId}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 opacity-80"
                  >
                    <div className="flex justify-between mb-2">
                      <span>
                        Table {payment.order?.TableNumber}
                      </span>
                      <span className="text-green-400 font-bold">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-sm">
                      Method:{" "}
                      {payment.method?.toUpperCase()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}