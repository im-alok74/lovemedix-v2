"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DistributorActionsProps {
  distributorId: number
}

export function DistributorActions({ distributorId }: DistributorActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleVerification = async (status: "verified" | "rejected") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: `Distributor ${status} successfully`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update distributor status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleVerification("verified")} disabled={loading}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Verify
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleVerification("rejected")} disabled={loading} className="text-red-600">
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`/admin/distributors/${distributorId}/inventory`}>View Inventory</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
