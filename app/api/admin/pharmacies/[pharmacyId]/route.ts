import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { pharmacyId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { verificationStatus } = await request.json()
    const pharmacyId = params.pharmacyId

    await sql`
      UPDATE pharmacy_profiles
      SET verification_status = ${verificationStatus}
      WHERE id = ${pharmacyId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update pharmacy status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
