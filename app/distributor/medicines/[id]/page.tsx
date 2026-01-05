import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicineForm } from "@/components/admin/medicine-form"

export default async function EditMedicinePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  const medicines = await sql`
    SELECT * FROM medicines WHERE id = ${Number.parseInt(params.id)}
  `

  if (medicines.length === 0) {
    redirect("/distributor/medicines")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Edit Medicine</CardTitle>
                <CardDescription>Update medicine details and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <MedicineForm medicine={medicines[0]} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
