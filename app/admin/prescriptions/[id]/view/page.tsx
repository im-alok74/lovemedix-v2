import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function ViewPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const { id } = await params
  const prescription = await sql`
    SELECT 
      p.*,
      u.email,
      u.full_name,
      u.phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    WHERE p.id = ${Number.parseInt(id)}
    LIMIT 1
  `

  if (!prescription || prescription.length === 0) {
    redirect("/admin/prescriptions")
  }

  const p = prescription[0] as any

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/prescriptions">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prescription Details</h1>
            <p className="text-muted-foreground">ID: {p.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Information</CardTitle>
              <Badge
                variant={p.status === "verified" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}
              >
                {p.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{p.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{p.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-lg">{p.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                <p className="text-lg">{new Date(p.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor Name</p>
                <p className="text-lg">{p.doctor_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hospital Name</p>
                <p className="text-lg">{p.hospital_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prescription Date</p>
                <p className="text-lg">
                  {p.prescription_date ? new Date(p.prescription_date).toLocaleDateString("en-IN") : "Not provided"}
                </p>
              </div>
            </div>

            {p.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-foreground">{p.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {p.prescription_image && (
          <Card>
            <CardHeader>
              <CardTitle>Prescription Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={p.prescription_image || "/placeholder.svg"}
                alt="Prescription"
                className="max-h-96 w-full rounded-lg border border-border object-contain"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
