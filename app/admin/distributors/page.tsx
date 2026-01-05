import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DistributorActions } from "@/components/admin/distributor-actions"

export default async function AdminDistributorsPage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const distributors = await sql`
    SELECT 
      d.*,
      u.email,
      u.full_name,
      u.phone,
      COALESCE(d.parent_distributor_id, NULL) as parent_distributor_id,
      COALESCE(d.hierarchy_level, 1) as hierarchy_level,
      (SELECT COUNT(*) FROM distributor_inventory WHERE distributor_id = d.id) as total_stock_lines,
      (SELECT COALESCE(SUM(stock_quantity), 0) FROM distributor_inventory WHERE distributor_id = d.id) as total_stock_units
    FROM distributor_profiles d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Distributors</h1>
          <p className="text-muted-foreground">Manage distributor network and multi-level hierarchy</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {distributors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Stock Units</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributors.map((distributor: any) => (
                    <TableRow key={distributor.id}>
                      <TableCell className="font-medium">{distributor.company_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{distributor.full_name}</p>
                          <p className="text-xs text-muted-foreground">{distributor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{distributor.license_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {distributor.hierarchy_level}</Badge>
                      </TableCell>
                      <TableCell>{Number(distributor.total_stock_units) || 0} units</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            distributor.verification_status === "verified"
                              ? "default"
                              : distributor.verification_status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {distributor.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DistributorActions distributorId={distributor.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No distributors found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
