import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardContent } from "@/components/admin/dashboard-content"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/")
  }

  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE user_type = 'customer') as total_customers,
      (SELECT COUNT(*) FROM pharmacy_profiles) as total_pharmacies,
      (SELECT COUNT(*) FROM distributor_profiles) as total_distributors,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM medicines) as total_medicines,
      (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
      (SELECT COUNT(*) FROM pharmacy_profiles WHERE verification_status = 'pending') as pending_pharmacies,
      (SELECT COUNT(*) FROM distributor_profiles WHERE verification_status = 'pending') as pending_distributors,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as todays_revenue,
      (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as todays_orders
  `

  const data = stats[0] as any

  const revenueTrend = await sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `

  const orderStatus = await sql`
    SELECT 
      order_status as status,
      COUNT(*) as count
    FROM orders
    GROUP BY order_status
  `

  return (
    <AdminLayout>
      <DashboardContent data={data} revenueTrend={revenueTrend as any} orderStatus={orderStatus as any} />
    </AdminLayout>
  )
}
