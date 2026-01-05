import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function DistributorMedicinesPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  const medicines = await sql`
    SELECT * FROM medicines
    ORDER BY created_at DESC
    LIMIT 500
  `

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Medicine Management</h1>
                <p className="text-muted-foreground">Manage and distribute medicines</p>
              </div>
              <Link href="/distributor/medicines/add">
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
                          <TableCell className="flex gap-2">
                            <Link href={`/distributor/medicines/${medicine.id}`}>
                              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </Button>
                            </Link>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}
