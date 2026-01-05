import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const distributorProfile = await sql`
      SELECT * FROM distributor_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `

    if (!distributorProfile || distributorProfile.length === 0) {
      return NextResponse.json({ error: "Distributor profile not found" }, { status: 404 })
    }

    const inventory = await sql`
      SELECT 
        di.*,
        m.name as medicine_name,
        m.form,
        m.strength
      FROM distributor_inventory di
      JOIN medicines m ON di.medicine_id = m.id
      WHERE di.distributor_id = ${distributorProfile[0].id}
      ORDER BY m.name
    `

    return NextResponse.json(inventory)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const distributorProfile = await sql`
      SELECT * FROM distributor_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `

    const data = await request.json()

    const result = await sql`
      INSERT INTO distributor_inventory (
        distributor_id,
        medicine_id,
        stock_quantity,
        cost_price,
        selling_price,
        batch_number,
        expiry_date
      )
      VALUES (
        ${distributorProfile[0].id},
        ${data.medicineId},
        ${data.stockQuantity},
        ${data.costPrice},
        ${data.sellingPrice},
        ${data.batchNumber || null},
        ${data.expiryDate || null}
      )
      ON CONFLICT (distributor_id, medicine_id, batch_number) DO UPDATE SET
        stock_quantity = stock_quantity + ${data.stockQuantity},
        selling_price = ${data.sellingPrice},
        last_updated = NOW()
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
