import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pharmacyId, medicineId, stockQuantity, sellingPrice, batchNumber, expiryDate } = await request.json()

    const result = await sql`
      INSERT INTO pharmacy_inventory (
        pharmacy_id,
        medicine_id,
        stock_quantity,
        selling_price,
        batch_number,
        expiry_date
      )
      VALUES (
        ${pharmacyId},
        ${medicineId},
        ${stockQuantity},
        ${sellingPrice},
        ${batchNumber || null},
        ${expiryDate || null}
      )
      ON CONFLICT (pharmacy_id, medicine_id, batch_number) DO UPDATE SET
        stock_quantity = stock_quantity + ${stockQuantity},
        selling_price = ${sellingPrice},
        last_updated = NOW()
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Pharmacy inventory error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
