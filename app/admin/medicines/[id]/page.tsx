import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminLayout } from "@/components/admin/admin-layout"
import { MedicineForm } from "@/components/admin/medicine-form"

export default async function EditMedicinePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  const { id } = await params
  const medicine = await sql`SELECT * FROM medicines WHERE id = ${Number.parseInt(id)} LIMIT 1`

  if (!medicine || medicine.length === 0) {
    redirect("/admin/medicines")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Medicine</h1>
          <p className="text-muted-foreground">Update medicine information</p>
        </div>
        <MedicineForm initialData={medicine[0]} />
      </div>
    </AdminLayout>
  )
}
