import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const result = await sql`
      INSERT INTO medicines (
        name, generic_name, manufacturer, category, form, strength,
        pack_size, description, side_effects, precautions,
        requires_prescription, mrp, status, image_url
      )
      VALUES (
        ${data.name}, ${data.generic_name || null}, ${data.manufacturer || null},
        ${data.category || null}, ${data.form}, ${data.strength || null},
        ${data.pack_size || null}, ${data.description || null},
        ${data.side_effects || null}, ${data.precautions || null},
        ${data.requires_prescription || false}, ${data.mrp}, ${data.status},
        ${data.image_url || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    const result = await sql`
      UPDATE medicines
      SET
        name = ${data.name},
        generic_name = ${data.generic_name || null},
        manufacturer = ${data.manufacturer || null},
        category = ${data.category || null},
        form = ${data.form},
        strength = ${data.strength || null},
        pack_size = ${data.pack_size || null},
        description = ${data.description || null},
        side_effects = ${data.side_effects || null},
        precautions = ${data.precautions || null},
        requires_prescription = ${data.requires_prescription || false},
        mrp = ${data.mrp},
        status = ${data.status},
        image_url = ${data.image_url || null},
        updated_at = NOW()
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
