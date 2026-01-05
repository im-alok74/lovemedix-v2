import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default async function PharmacyPrescriptionsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "pharmacy") {
    redirect("/signin")
  }

  // Get verified prescriptions for orders
  const prescriptions = await sql`
    SELECT 
      p.*,
      u.full_name,
      u.email,
      u.phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    WHERE p.status = 'verified'
    ORDER BY p.created_at DESC
    LIMIT 100
  `

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Available Prescriptions</h1>
            <p className="text-muted-foreground">Access verified prescriptions for order fulfillment</p>
          </div>

          {prescriptions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription: any) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">{prescription.full_name}</TableCell>
                        <TableCell>{prescription.email}</TableCell>
                        <TableCell>{prescription.doctor_name || "-"}</TableCell>
                        <TableCell>{prescription.hospital_name || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(prescription.prescription_date).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/pharmacy/prescriptions/${prescription.id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No verified prescriptions available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
