import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const medicine = await sql`
      SELECT * FROM medicines WHERE id = ${Number.parseInt(params.id)}
    `

    if (medicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(medicine[0])
  } catch (error) {
    console.error("[v0] Error fetching medicine:", error)
    return NextResponse.json({ error: "Failed to fetch medicine" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.user_type !== "admin" && user.user_type !== "distributor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      generic_name,
      manufacturer,
      category,
      form,
      strength,
      pack_size,
      description,
      requires_prescription,
      mrp,
      status,
    } = body

    const result = await sql`
      UPDATE medicines
      SET
        name = ${name},
        generic_name = ${generic_name || null},
        manufacturer = ${manufacturer},
        category = ${category},
        form = ${form || null},
        strength = ${strength || null},
        pack_size = ${pack_size || null},
        description = ${description || null},
        requires_prescription = ${requires_prescription || false},
        mrp = ${Number.parseFloat(mrp)},
        status = ${status || "active"},
        updated_at = NOW()
      WHERE id = ${Number.parseInt(params.id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating medicine:", error)
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      DELETE FROM medicines WHERE id = ${Number.parseInt(params.id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting medicine:", error)
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 })
  }
}
