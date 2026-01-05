import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await sql`
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ${user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, deliveryAddress, phone, paymentMethod } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((total: number, item: any) => total + item.price * item.quantity, 0)
    const deliveryCharge = subtotal >= 500 ? 0 : 40
    const totalAmount = subtotal + deliveryCharge

    // Generate unique order number: LM + timestamp + random
    const orderNumber = `LM${Date.now()}${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Create order
    const order = await sql`
      INSERT INTO orders (
        order_number,
        customer_id,
        delivery_address_id,
        order_status,
        payment_status,
        payment_method,
        subtotal,
        delivery_charge,
        total_amount,
        created_at,
        updated_at
      )
      VALUES (
        ${orderNumber},
        ${user.id},
        ${deliveryAddress},
        'pending',
        'pending',
        ${paymentMethod || "cod"},
        ${subtotal},
        ${deliveryCharge},
        ${totalAmount},
        NOW(),
        NOW()
      )
      RETURNING id, order_number
    `

    const orderId = order[0].id

    // Add order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          medicine_id,
          quantity,
          unit_price,
          total_price,
          created_at
        )
        VALUES (
          ${orderId},
          ${item.medicine_id},
          ${item.quantity},
          ${item.price},
          ${item.price * item.quantity},
          NOW()
        )
      `
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${user.id}`

    return NextResponse.json(
      {
        success: true,
        orderId: orderId,
        orderNumber: orderNumber,
        totalAmount: totalAmount,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
