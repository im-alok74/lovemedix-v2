import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PrescriptionActions } from "@/components/admin/prescription-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPrescriptionsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  // Get prescriptions by status
  const pendingPrescriptions = await sql`
    SELECT 
      p.*,
      u.email,
      u.full_name,
      u.phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC
  `

  const verifiedPrescriptions = await sql`
    SELECT 
      p.*,
      u.email,
      u.full_name,
      u.phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    WHERE p.status = 'verified'
    ORDER BY p.created_at DESC
    LIMIT 20
  `

  const rejectedPrescriptions = await sql`
    SELECT 
      p.*,
      u.email,
      u.full_name,
      u.phone
    FROM prescriptions p
    JOIN users u ON p.customer_id = u.id
    WHERE p.status = 'rejected'
    ORDER BY p.created_at DESC
    LIMIT 20
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground">Review and verify customer prescriptions</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingPrescriptions.length > 0 ? (
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPrescriptions.map((prescription: any) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.full_name}</TableCell>
                          <TableCell>{prescription.email}</TableCell>
                          <TableCell>{prescription.doctor_name || "-"}</TableCell>
                          <TableCell>{prescription.hospital_name || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {prescription.prescription_date
                              ? new Date(prescription.prescription_date).toLocaleDateString("en-IN")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <PrescriptionActions prescriptionId={prescription.id} status={prescription.status} />
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
                  <p className="text-muted-foreground">No pending prescriptions to review</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verified" className="space-y-6">
            {verifiedPrescriptions.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Verified Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifiedPrescriptions.map((prescription: any) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.full_name}</TableCell>
                          <TableCell>{prescription.email}</TableCell>
                          <TableCell>{prescription.doctor_name || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {prescription.verified_at
                              ? new Date(prescription.verified_at).toLocaleDateString("en-IN")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`/admin/prescriptions/${prescription.id}/view`}
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
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
                  <p className="text-muted-foreground">No verified prescriptions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            {rejectedPrescriptions.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedPrescriptions.map((prescription: any) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.full_name}</TableCell>
                          <TableCell>{prescription.email}</TableCell>
                          <TableCell className="text-sm">{prescription.notes || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {prescription.verified_at
                              ? new Date(prescription.verified_at).toLocaleDateString("en-IN")
                              : "-"}
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
                  <p className="text-muted-foreground">No rejected prescriptions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
