"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendPasswordResetOTP } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await sendPasswordResetOTP(email)
      setSuccess("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบอีเมลของคุณ")

      // รอสักครู่แล้วนำผู้ใช้ไปยังหน้ารีเซ็ตรหัสผ่าน
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
          <CardDescription>กรุณาใส่อีเมลของคุณเพื่อรับรหัส OTP สำหรับรีเซ็ตรหัสผ่าน</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="กรุณาใส่อีเมลที่ใช้ลงทะเบียน"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังส่งรหัส OTP..." : "ส่งรหัส OTP"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-gray-600 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" /> กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
