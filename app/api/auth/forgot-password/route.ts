import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (userResult.length === 0) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({
        success: true,
        message: "If account exists, reset link has been sent",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Save reset token to database
    await sql`
      UPDATE users 
      SET reset_token = ${resetTokenHash}, reset_token_expires = ${expiresAt}
      WHERE email = ${email}
    `

    // In production, send email with reset link
    // For now, we'll just log it or return it in development
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    console.log("[v0] Password reset link:", resetLink)

    return NextResponse.json({
      success: true,
      message: "Password reset link sent",
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
