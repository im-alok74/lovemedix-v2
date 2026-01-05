"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface MedicineFormProps {
  initialData?: any
}

export function MedicineForm({ initialData }: MedicineFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    generic_name: initialData?.generic_name || "",
    manufacturer: initialData?.manufacturer || "",
    category: initialData?.category || "",
    form: initialData?.form || "tablet",
    strength: initialData?.strength !== null ? String(initialData?.strength || "") : "",
    pack_size: initialData?.pack_size !== null ? String(initialData?.pack_size || "") : "",
    description: initialData?.description || "",
    side_effects: initialData?.side_effects || "",
    precautions: initialData?.precautions || "",
    requires_prescription: initialData?.requires_prescription || false,
    mrp: initialData?.mrp !== null ? String(initialData?.mrp || "") : "",
    status: initialData?.status || "active",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.mrp || Number(formData.mrp) <= 0) {
        toast({
          title: "Error",
          description: "MRP must be greater than 0",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Convert numeric strings to numbers, or null if empty
      const submitData = {
        ...formData,
        strength: formData.strength ? Number(formData.strength) : null,
        pack_size: formData.pack_size ? Number(formData.pack_size) : null,
        mrp: Number(formData.mrp),
      }

      let imageUrl = initialData?.image_url || null
      if (imageFile) {
        setUploadingImage(true)
        const formDataObj = new FormData()
        formDataObj.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload/medicine-image", {
          method: "POST",
          body: formDataObj,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || "Failed to upload image")
        }

        const uploadedData = await uploadResponse.json()
        imageUrl = uploadedData.url
        setUploadingImage(false)
      }

      const method = initialData ? "PUT" : "POST"
      const url = initialData ? `/api/admin/medicines/${initialData.id}` : "/api/admin/medicines"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submitData,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: `Medicine ${initialData ? "updated" : "added"} successfully!`,
      })

      router.push("/admin/medicines")
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
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Medicine" : "Add New Medicine"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-dashed border-border p-6">
            <Label htmlFor="image" className="block text-base font-semibold mb-4">
              Medicine Image
            </Label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-40 w-40 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    ✕
                  </button>
                </div>
              )}
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
              />
              <p className="text-sm text-muted-foreground">PNG, JPG, or GIF up to 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Medicine Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="generic_name">Generic Name</Label>
              <Input id="generic_name" name="generic_name" value={formData.generic_name} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="form">Form *</Label>
              <Select value={formData.form} onValueChange={(value) => handleSelectChange("form", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="capsule">Capsule</SelectItem>
                  <SelectItem value="syrup">Syrup</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="cream">Cream</SelectItem>
                  <SelectItem value="drops">Drops</SelectItem>
                  <SelectItem value="inhaler">Inhaler</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strength">Strength</Label>
              <Input
                id="strength"
                name="strength"
                type="number"
                step="0.01"
                value={formData.strength}
                onChange={handleChange}
                placeholder="e.g., 500"
              />
            </div>
            <div>
              <Label htmlFor="pack_size">Pack Size</Label>
              <Input
                id="pack_size"
                name="pack_size"
                type="number"
                step="1"
                value={formData.pack_size}
                onChange={handleChange}
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="side_effects">Side Effects</Label>
              <Textarea
                id="side_effects"
                name="side_effects"
                value={formData.side_effects}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="precautions">Precautions</Label>
              <Textarea
                id="precautions"
                name="precautions"
                value={formData.precautions}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="mrp">MRP (₹) *</Label>
              <Input
                id="mrp"
                name="mrp"
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={handleChange}
                placeholder="e.g., 500.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requires_prescription"
              name="requires_prescription"
              checked={formData.requires_prescription}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <Label htmlFor="requires_prescription">Requires Prescription</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading
                ? "Saving..."
                : uploadingImage
                  ? "Uploading Image..."
                  : initialData
                    ? "Update Medicine"
                    : "Add Medicine"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
