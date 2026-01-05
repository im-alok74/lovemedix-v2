import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MedicineActions } from "@/components/admin/medicine-actions"

export default async function AdminMedicinesPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const medicines = await sql`
    SELECT * FROM medicines
    ORDER BY created_at DESC
    LIMIT 1000
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medicines</h1>
            <p className="text-muted-foreground">Manage medicine catalog - {medicines.length} medicines</p>
          </div>
          <Link href="/admin/medicines/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {medicines.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((medicine: any) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.generic_name || "-"}</TableCell>
                      <TableCell>{medicine.manufacturer || "-"}</TableCell>
                      <TableCell>{medicine.category || "-"}</TableCell>
                      <TableCell>₹{medicine.mrp}</TableCell>
                      <TableCell>
                        <Badge variant={medicine.status === "active" ? "default" : "secondary"}>
                          {medicine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <MedicineActions medicineId={medicine.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No medicines found. Start by adding one.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
