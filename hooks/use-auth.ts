"use client"

import { useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  full_name: string
  user_type: "customer" | "pharmacy" | "distributor" | "admin"
  status?: string
  phone?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from session/auth check
    const checkAuth = async () => {
      try {
        // This would normally fetch from an auth endpoint
        // For now, we'll check localStorage or session
        const sessionUser = sessionStorage.getItem("user")
        if (sessionUser) {
          setUser(JSON.parse(sessionUser))
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { user, loading }
}
