import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await sql`
      SELECT 
        o.*,
        u.full_name as customer_name,
        a.street_address || ', ' || a.city as delivery_address
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN addresses a ON o.delivery_address_id = a.id
      WHERE o.id = ${Number.parseInt(params.orderId)}
      LIMIT 1
    `

    if (order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const items = await sql`
      SELECT 
        oi.*,
        m.name as medicine_name
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      WHERE oi.order_id = ${Number.parseInt(params.orderId)}
    `

    return NextResponse.json({
      ...order[0],
      items: items,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { order_status } = await request.json()

    const result = await sql`
      UPDATE orders
      SET order_status = ${order_status}, updated_at = NOW()
      WHERE id = ${Number.parseInt(params.orderId)}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
