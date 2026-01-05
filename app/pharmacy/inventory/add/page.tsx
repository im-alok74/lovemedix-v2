import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { PharmacyInventoryForm } from "@/components/pharmacy/pharmacy-inventory-form"

export default async function AddInventoryPage() {
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

  const medicines = await sql`
    SELECT id, name, generic_name, form, strength
    FROM medicines
    WHERE status = 'active'
    ORDER BY name
  `

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Add Medicine to Inventory</h1>
            <p className="mb-8 text-muted-foreground">Add medicines to your pharmacy's inventory</p>

            <Card>
              <CardContent className="p-6">
                <PharmacyInventoryForm pharmacyId={pharmacyProfile[0].id} medicines={medicines} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
