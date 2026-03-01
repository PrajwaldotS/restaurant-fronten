"use client"
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Item {
  id: number;
  Name: string;
  Price: number;
  Category: string;
}

interface Order {
  id: number;
  TableNumber: number;
  status_food: string;
  items: Item[];
}
interface Props{
    data : {
        data: Order[];
    }
}

export default function AdminDashboard({data}:Props){
   const orders = data?.data || [];
    const analytics  = useMemo(()=>{
    let totalRevenue = 0;
    const itemCount: Record<string, number> = {};
    const categoryCount: Record<string, Record<string, number>> = {
    starter: {},
    main_course: {},
    dessert: {},
    };

    orders.forEach((Order) => {
    Order.items?.forEach((item) => {
        totalRevenue += item.Price;

        const name = item.Name;
        const category = item.Category.trim().toLowerCase() || "";

      // Count overall
        itemCount[name] = (itemCount[name] || 0) + 1;

      // Count per category
        if (categoryCount[category]) {
        categoryCount[category][name] =
            (categoryCount[category][name] || 0) + 1;
        }
    });
    });
    const getTopItem = (category: string) => {
    const entries = Object.entries(categoryCount[category] || {});
    if (!entries.length) return "N/A";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
    };
    const topStarter = getTopItem("starter");
    const topMain = getTopItem("main_course");
    const topDessert = getTopItem("dessert");
    const chartData = Object.entries(itemCount).map(([name, count]) => ({
    name,
    count,
  }));
  const totalOrders = orders.length;
  return {totalOrders,topDessert,topMain,topStarter, chartData,itemCount, categoryCount,totalRevenue}
    },[orders])

    

  

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Admin Analytics
          </h1>
          <p className="text-slate-500 mt-2">
            Real-time performance overview of your restaurant
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Total Revenue
            </p>
            <p className="mt-4 text-4xl font-bold text-emerald-600">
              ₹ {analytics.totalRevenue}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Total Orders
            </p>
            <p className="mt-4 text-4xl font-bold text-blue-600">
              {analytics.totalOrders}
            </p>
          </div>
        </div>

        {/* Top Sellers */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Top Performing Dishes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <p className="text-sm text-slate-500 uppercase">
                Top Starter
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-800">
                {analytics.topStarter}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <p className="text-sm text-slate-500 uppercase">
                Top Main Course
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-800">
                {analytics.topMain}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <p className="text-sm text-slate-500 uppercase">
                Top Dessert
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-800">
                {analytics.topDessert}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Most Ordered Items
          </h2>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
    )
}