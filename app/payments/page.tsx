"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [paidPayments, setPaidPayments] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [time, setTime] = useState<string>("")

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const BASE_URL = "http://localhost:1337"

  /* ================= TIME HUD ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ================= FETCH SETTINGS ================= */
  const fetchSettings = async () => {
    const res = await fetch(
      `${BASE_URL}/api/resturant-setting?populate=logo`
    )
    const data = await res.json()
    setSettings(data.data)
  }

  /* ================= FETCH PAYMENTS ================= */
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
    fetchSettings()
    fetchPayments()
    pollingRef.current = setInterval(fetchPayments, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const calculateSubtotal = (payment: any) => {
    return (
      payment.order?.item?.reduce(
        (sum: number, i: any) =>
          sum +
          (Number(i.price_at_time) || 0) *
            (Number(i.quantity) || 0),
        0
      ) || Number(payment.number) || 0
    )
  }

  const printBill = (payment: any) => {
    if (!settings) return

    const subtotal = calculateSubtotal(payment)
    const taxRate = 0.05
    const tax = subtotal * taxRate
    const total = subtotal + tax

    const itemsHtml = payment.order?.item
      ?.map(
        (i: any) => `
        <tr>
          <td>${i.menu?.Name}</td>
          <td>${i.quantity}</td>
          <td>₹${(
            Number(i.price_at_time) *
            Number(i.quantity)
          ).toFixed(2)}</td>
        </tr>
      `
      )
      .join("")

    const printWindow = window.open("", "", "width=800,height=600")

    printWindow?.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; margin-bottom: 5px; }
            .center { text-align: center; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; margin-top: 10px; }
            img { display: block; margin: 0 auto 10px auto; height: 80px; }
          </style>
        </head>
        <body>

          ${
            settings.logo?.url
              ? `<img src="${BASE_URL}${settings.logo.url}" />`
              : ""
          }

          <h1>${settings.restaurant_name}</h1>
          <p class="center">${settings.restaurant_address}</p>
          <hr/>

          <p><strong>Table:</strong> ${
            payment.order?.TableNumber
          }</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <p class="total">Subtotal: ₹${subtotal.toFixed(2)}</p>
          <p class="total">Tax (5%): ₹${tax.toFixed(2)}</p>
          <p class="total">Grand Total: ₹${total.toFixed(2)}</p>

          <hr/>
          <p class="center">${
            settings.good_luck_quote ||
            "Thank you! Visit again."
          }</p>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>

        </body>
      </html>
    `)

    printWindow?.document.close()
  }

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

  const totalRevenue = paidPayments.reduce(
    (sum, p) => sum + calculateSubtotal(p) * 1.05,
    0
  )

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Platinum Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl tracking-widest uppercase font-semibold">
              Financial Control
            </h1>
            <p className="text-blue-400 text-sm mt-2 tracking-wider">
              BILLING & TRANSACTIONS
            </p>
          </div>

          <div className="text-right font-mono text-blue-400">
            <p className="text-xs opacity-60">SYSTEM TIME</p>
            <p className="text-lg">{time}</p>
            <p className="text-sm mt-2 text-white/60">
              Revenue: ₹{totalRevenue.toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* SPLIT VIEW */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* PENDING */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-yellow-400">
              Pending Payments
            </h2>

            {pendingPayments.map(payment => {
              const subtotal = calculateSubtotal(payment)
              const tax = subtotal * 0.05
              const total = subtotal + tax

              return (
                <motion.div
                  key={payment.documentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-yellow-400/30 rounded-2xl p-6"
                >
                  <div className="flex justify-between mb-4">
                    <h3>Table {payment.order?.TableNumber}</h3>
                    <span className="text-yellow-400 font-mono">
                      PENDING
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {payment.order?.item?.map((i: any) => (
                      <div
                        key={i.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {i.menu?.Name} × {i.quantity}
                        </span>
                        <span className="font-mono">
                          ₹
                          {(Number(i.price_at_time) *
                            Number(i.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-blue-400">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      markPaid(payment.documentId)
                    }
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl font-medium"
                  >
                    Mark as Paid
                  </button>

                  <button
                    onClick={() => printBill(payment)}
                    className="w-full mt-3 bg-white/10 hover:bg-white/20 border border-white/20 transition px-4 py-3 rounded-xl font-medium"
                  >
                    Print Bill
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* PAID HISTORY */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-400">
              Completed Transactions
            </h2>

            {paidPayments.map(payment => {
              const subtotal = calculateSubtotal(payment)
              const total = subtotal * 1.05

              return (
                <div
                  key={payment.documentId}
                  className="backdrop-blur-xl bg-white/5 border border-blue-400/20 rounded-2xl p-6"
                >
                  <div className="flex justify-between">
                    <span>
                      Table {payment.order?.TableNumber}
                    </span>
                    <span className="font-mono text-blue-400">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}