import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, CheckCircle, Clock } from "lucide-react"

export default async function PharmacyDashboardPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "pharmacy") {
    redirect("/signin")
  }

  // Get pharmacy profile
  const pharmacyProfile = await sql`
    SELECT * FROM pharmacy_profiles
    WHERE user_id = ${user.id}
    LIMIT 1
  `

  if (pharmacyProfile.length === 0) {
    redirect("/pharmacy/register")
  }

  const profile = pharmacyProfile[0] as any

  // Get order statistics
  const orderStats = await sql`
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
      COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmed_orders,
      COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
      COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_revenue
    FROM orders
    WHERE pharmacy_id = ${profile.id}
  `

  const stats = orderStats[0] as any

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{profile.pharmacy_name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-muted-foreground">
                {profile.city}, {profile.state}
              </p>
              <Badge variant={profile.verification_status === "verified" ? "default" : "secondary"}>
                {profile.verification_status}
              </Badge>
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total_orders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.pending_orders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.delivered_orders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{Number.parseFloat(stats.total_revenue).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {profile.verification_status === "pending" && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-foreground">Verification Pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your pharmacy registration is under review. You will be notified once verified by our team.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
