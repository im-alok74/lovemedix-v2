import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicineForm } from "@/components/admin/medicine-form"

export default async function AddMedicinePage() {
  const user = await getCurrentUser()

  if (!user || user.user_type !== "distributor") {
    redirect("/signin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Add New Medicine</CardTitle>
                <CardDescription>Add a new medicine to your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <MedicineForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
