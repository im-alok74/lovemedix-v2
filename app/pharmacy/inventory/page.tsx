import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"

export default async function PharmacyInventoryPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "pharmacy") {
    redirect("/signin")
  }

  const pharmacyProfile = await sql`
    SELECT * FROM pharmacy_profiles
    WHERE user_id = ${user.id}
    LIMIT 1
  `

  if (pharmacyProfile.length === 0) {
    redirect("/pharmacy/register")
  }

  const inventory = await sql`
    SELECT 
      pi.*,
      m.name as medicine_name,
      m.form,
      m.strength,
      m.mrp
    FROM pharmacy_inventory pi
    JOIN medicines m ON pi.medicine_id = m.id
    WHERE pi.pharmacy_id = ${pharmacyProfile[0].id}
    ORDER BY m.name
  `

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <Button asChild>
              <Link href="/pharmacy/inventory/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Link>
            </Button>
          </div>

          {inventory.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.medicine_name}</TableCell>
                        <TableCell>{item.form}</TableCell>
                        <TableCell>₹{item.mrp}</TableCell>
                        <TableCell>
                          <span className={item.stock_quantity < 10 ? "font-bold text-red-600" : ""}>
                            {item.stock_quantity}
                          </span>
                        </TableCell>
                        <TableCell>₹{Number(item.selling_price).toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{item.batch_number || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString("en-IN") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                <p className="mb-4 text-muted-foreground">No medicines in inventory yet</p>
                <Button asChild>
                  <Link href="/pharmacy/inventory/add">Add Your First Medicine</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
