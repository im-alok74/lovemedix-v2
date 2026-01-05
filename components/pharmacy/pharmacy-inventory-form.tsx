"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface PharmacyInventoryFormProps {
  pharmacyId: number
  medicines: any[]
  initialData?: any
}

export function PharmacyInventoryForm({ pharmacyId, medicines, initialData }: PharmacyInventoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    medicineId: initialData?.medicine_id?.toString() || "",
    stockQuantity: initialData?.stock_quantity || "",
    sellingPrice: initialData?.selling_price || "",
    batchNumber: initialData?.batch_number || "",
    expiryDate: initialData?.expiry_date?.split("T")[0] || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      medicineId: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/pharmacy/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId,
          medicineId: Number.parseInt(formData.medicineId),
          stockQuantity: Number.parseInt(formData.stockQuantity),
          sellingPrice: Number.parseFloat(formData.sellingPrice),
          batchNumber: formData.batchNumber || null,
          expiryDate: formData.expiryDate || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: "Medicine added to inventory successfully!",
      })

      router.push("/pharmacy/inventory")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="medicineId">Select Medicine *</Label>
        <Select value={formData.medicineId} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a medicine..." />
          </SelectTrigger>
          <SelectContent>
            {medicines.map((medicine: any) => (
              <SelectItem key={medicine.id} value={medicine.id.toString()}>
                {medicine.name} {medicine.strength ? `(${medicine.strength})` : ""} - {medicine.form}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity *</Label>
          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="batchNumber">Batch Number</Label>
          <Input
            id="batchNumber"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            placeholder="e.g., BATCH123"
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add to Inventory"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
