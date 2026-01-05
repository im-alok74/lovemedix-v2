"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  id: number
  order_number: string
  customer_name: string
  order_status: string
  payment_status: string
  total_amount: string
  created_at: string
  delivery_address: string
}

export function PharmacyOrdersList({ pharmacyId }: { pharmacyId: number }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/pharmacy/orders?pharmacyId=${pharmacyId}&filter=${filter}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order status updated",
        })
        fetchOrders()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading orders...</div>
  }

  return (
    <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
      <TabsList>
        <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
        <TabsTrigger value="preparing">Preparing</TabsTrigger>
        <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
        <TabsTrigger value="delivered">Delivered</TabsTrigger>
      </TabsList>

      <TabsContent value={filter}>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No orders found in this status</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.order_status)}>
                          {order.order_status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {order.order_status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            className="text-xs"
                          >
                            Accept
                          </Button>
                        )}
                        {order.order_status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "preparing")}
                            className="text-xs"
                          >
                            Prepare
                          </Button>
                        )}
                        {order.order_status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                            className="text-xs"
                          >
                            Ship
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
