import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Hash the token to compare with database
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with valid reset token
    const userResult = await sql`
      SELECT id FROM users 
      WHERE reset_token = ${resetTokenHash} 
      AND reset_token_expires > NOW()
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          reset_token = NULL, 
          reset_token_expires = NULL
      WHERE id = ${userResult[0].id}
    `

    return NextResponse.json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
