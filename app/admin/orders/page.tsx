import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminOrdersPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  // Get orders by status
  const pendingOrders = await sql`
    SELECT 
      o.*,
      u.full_name,
      u.email,
      p.pharmacy_name,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN pharmacy_profiles p ON o.pharmacy_id = p.id
    WHERE o.order_status = 'pending'
    ORDER BY o.created_at DESC
    LIMIT 50
  `

  const processingOrders = await sql`
    SELECT 
      o.*,
      u.full_name,
      u.email,
      p.pharmacy_name,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN pharmacy_profiles p ON o.pharmacy_id = p.id
    WHERE o.order_status IN ('confirmed', 'preparing', 'out_for_delivery')
    ORDER BY o.created_at DESC
    LIMIT 50
  `

  const completedOrders = await sql`
    SELECT 
      o.*,
      u.full_name,
      u.email,
      p.pharmacy_name,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN pharmacy_profiles p ON o.pharmacy_id = p.id
    WHERE o.order_status = 'delivered'
    ORDER BY o.created_at DESC
    LIMIT 50
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage all platform orders</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingOrders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.full_name}</p>
                              <p className="text-xs text-muted-foreground">{order.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.pharmacy_name || "Pending"}</TableCell>
                          <TableCell>{order.item_count}</TableCell>
                          <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No pending orders</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="processing">
            {processingOrders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processingOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.full_name}</p>
                              <p className="text-xs text-muted-foreground">{order.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.pharmacy_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{order.order_status.replace(/_/g, " ")}</Badge>
                          </TableCell>
                          <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No processing orders</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedOrders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Delivered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.full_name}</TableCell>
                          <TableCell>{order.pharmacy_name}</TableCell>
                          <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">
                            {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString("en-IN") : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No completed orders</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
