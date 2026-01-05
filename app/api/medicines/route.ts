import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const limit = searchParams.get("limit") || "1000"

    let medicines

    if (search) {
      medicines = await sql`
        SELECT * FROM medicines
        WHERE (name ILIKE ${"%" + search + "%"} OR generic_name ILIKE ${"%" + search + "%"})
        ORDER BY name
        LIMIT ${Number.parseInt(limit)}
      `
    } else if (category) {
      medicines = await sql`
        SELECT * FROM medicines
        WHERE category = ${category}
        ORDER BY name
        LIMIT ${Number.parseInt(limit)}
      `
    } else {
      medicines = await sql`
        SELECT * FROM medicines
        ORDER BY name
        LIMIT ${Number.parseInt(limit)}
      `
    }

    return NextResponse.json({ medicines })
  } catch (error) {
    console.error("[v0] Error fetching medicines:", error)
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
      image_url,
    } = body

    // Validate required fields
    if (!name || !manufacturer || !category || !mrp) {
      return NextResponse.json({ error: "Missing required fields: name, manufacturer, category, mrp" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO medicines (
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
        image_url,
        status,
        created_at
      ) VALUES (
        ${name},
        ${generic_name || null},
        ${manufacturer},
        ${category},
        ${form || null},
        ${strength || null},
        ${pack_size || null},
        ${description || null},
        ${requires_prescription || false},
        ${Number.parseFloat(mrp)},
        ${image_url || "/placeholder.svg?height=100&width=100"},
        'active',
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating medicine:", error)
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 })
  }
}
