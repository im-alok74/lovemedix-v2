import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminLayout } from "@/components/admin/admin-layout"
import { MedicineForm } from "@/components/admin/medicine-form"

export default async function AddMedicinePage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "admin") {
    redirect("/signin")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Medicine</h1>
          <p className="text-muted-foreground">Add a new medicine to the catalog</p>
        </div>
        <MedicineForm />
      </div>
    </AdminLayout>
  )
}
