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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PrescriptionActionsProps {
  prescriptionId: number
  status: string
}

export function PrescriptionActions({ prescriptionId, status }: PrescriptionActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleVerification = async (newStatus: "verified" | "rejected", notes?: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/prescriptions/${prescriptionId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: `Prescription ${newStatus} successfully`,
      })
      router.refresh()
      setShowRejectDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prescription",
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
        <DropdownMenuItem asChild>
          <a href={`/admin/prescriptions/${prescriptionId}/view`} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-2 h-4 w-4" />
            View Document
          </a>
        </DropdownMenuItem>

        {status === "pending" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleVerification("verified")} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approve
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <button className="w-full text-left">
                    <XCircle className="mr-2 inline h-4 w-4 text-red-600" />
                    Reject
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Prescription</DialogTitle>
                    <DialogDescription>Provide reason for rejection (optional)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Rejection Notes</Label>
                      <Textarea
                        id="notes"
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder="Explain why you're rejecting this prescription..."
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={() => handleVerification("rejected", rejectionNotes)}
                      disabled={loading}
                      className="w-full"
                      variant="destructive"
                    >
                      {loading ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
