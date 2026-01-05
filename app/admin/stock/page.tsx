import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default async function AdminStockPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  // Get pharmacy stock levels
  const pharmacyStock = await sql`
    SELECT 
      pi.*,
      m.name as medicine_name,
      m.mrp,
      p.pharmacy_name,
      u.email
    FROM pharmacy_inventory pi
    JOIN medicines m ON pi.medicine_id = m.id
    JOIN pharmacy_profiles p ON pi.pharmacy_id = p.id
    JOIN users u ON p.user_id = u.id
    ORDER BY pi.stock_quantity ASC
    LIMIT 50
  `

  // Get low stock alerts (less than 10 units)
  const lowStockCount = await sql`
    SELECT COUNT(*) as count FROM pharmacy_inventory WHERE stock_quantity < 10
  `

  // Get expiring stock (expiring within 30 days)
  const expiringStockCount = await sql`
    SELECT COUNT(*) as count FROM pharmacy_inventory
    WHERE expiry_date IS NOT NULL
    AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date > CURRENT_DATE
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground">Monitor medicine stock across all pharmacies</p>
        </div>

        {/* Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          {Number(lowStockCount[0]?.count) > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>{Number(lowStockCount[0]?.count)} items</strong> have low stock (less than 10 units)
              </AlertDescription>
            </Alert>
          )}

          {Number(expiringStockCount[0]?.count) > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{Number(expiringStockCount[0]?.count)} items</strong> are expiring within 30 days
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Stock Levels</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pharmacyStock.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacyStock.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicine_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.pharmacy_name}</p>
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={Number(item.stock_quantity) < 10 ? "font-bold text-red-600" : "text-foreground"}
                        >
                          {item.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>₹{item.selling_price}</TableCell>
                      <TableCell className="text-sm">{item.batch_number || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString("en-IN") : "-"}
                      </TableCell>
                      <TableCell>
                        {Number(item.stock_quantity) < 10 && <Badge variant="destructive">Low Stock</Badge>}
                        {item.expiry_date &&
                          new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                          new Date(item.expiry_date) > new Date() && (
                            <Badge variant="outline" className="border-orange-400 text-orange-700">
                              Expiring Soon
                            </Badge>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No stock data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
