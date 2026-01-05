import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "pharmacy") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prescriptions = await sql`
      SELECT 
        p.*,
        u.full_name,
        u.email,
        u.phone
      FROM prescriptions p
      JOIN users u ON p.customer_id = u.id
      WHERE p.status = 'verified'
      ORDER BY p.created_at DESC
    `

    return NextResponse.json(prescriptions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
