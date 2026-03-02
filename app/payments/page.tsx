"use client"

import { useEffect, useState, useRef } from "react"

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [paidPayments, setPaidPayments] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const BASE_URL = "http://localhost:1337"

  /* ============================
     FETCH RESTAURANT SETTINGS
  ============================ */
  const fetchSettings = async () => {
    const res = await fetch(
      `${BASE_URL}/api/resturant-setting?populate=logo`
    )
    const data = await res.json()
    setSettings(data.data)
  }

  /* ============================
     FETCH PAYMENTS
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
    fetchSettings()
    fetchPayments()

    pollingRef.current = setInterval(fetchPayments, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  /* ============================
     CALCULATE SUBTOTAL
  ============================ */
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

  /* ============================
     PRINT BILL
  ============================ */
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

          <p class="total">Subtotal: ₹${subtotal.toFixed(
            2
          )}</p>
          <p class="total">Tax (5%): ₹${tax.toFixed(2)}</p>
          <p class="total">Grand Total: ₹${total.toFixed(
            2
          )}</p>

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

  /* ============================
     MARK PAID
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold">
          Billing & Payments
        </h1>

        {pendingPayments.map(payment => {
          const subtotal = calculateSubtotal(payment)
          const tax = subtotal * 0.05
          const total = subtotal + tax

          return (
            <div
              key={payment.documentId}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex justify-between mb-4">
                <h3>Table {payment.order?.TableNumber}</h3>
                <span className="text-yellow-400">
                  PENDING
                </span>
              </div>

              <div className="mb-4">
                {payment.order?.item?.map((i: any) => (
                  <div
                    key={i.id}
                    className="flex justify-between"
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
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-400">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  markPaid(payment.documentId)
                }
                className="w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-lg font-semibold mt-4"
              >
                Mark as Paid
              </button>

              <button
                onClick={() => printBill(payment)}
                className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-lg font-semibold mt-3"
              >
                Print Bill
              </button>
            </div>
          )
        })}

      </div>
    </div>
  )
}