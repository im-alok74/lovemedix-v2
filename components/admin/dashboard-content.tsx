// components/admin/dashboard-content.tsx

import React from "react"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl font-bold mt-2">—</p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold mt-2">—</p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-3xl font-bold mt-2">—</p>
        </div>
      </div>
    </div>
  )
}

