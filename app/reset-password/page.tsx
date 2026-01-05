"use client"

import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"

function ResetPasswordPageContent() {
  return <ResetPasswordForm />
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
