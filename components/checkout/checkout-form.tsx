"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface CartItem {
  id: number
  quantity: number
  medicine_id: number
  name: string
  mrp: string
  image_url: string | null
}

export function CheckoutForm({ userId }: { userId: number }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phone, setPhone] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()

      if (response.ok) {
        setCartItems(data.cartItems)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + Number.parseFloat(item.mrp) * item.quantity, 0)
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address",
        variant: "destructive",
      })
      return
    }

    if (!phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return
    }

    setIsPlacingOrder(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress,
          phone,
          cartItems,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to thank you page with order number
        router.push(`/order-success?orderId=${data.orderNumber}`)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to place order",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const subtotal = calculateTotal()
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total = subtotal + deliveryFee

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="mb-4 text-muted-foreground">Your cart is empty</p>
          <Button onClick={() => router.push("/medicines")}>Browse Medicines</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete delivery address with landmark"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=64&width=64"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-primary">
                  ₹{(Number.parseFloat(item.mrp) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-foreground">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              {subtotal >= 500 && <p className="text-xs text-green-600">🎉 You saved ₹40 on delivery!</p>}
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="text-xl font-bold text-primary">₹{total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Cash on Delivery available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
