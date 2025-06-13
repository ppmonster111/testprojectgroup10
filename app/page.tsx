"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  HeartPulse,
  Brain,
  Salad,
  Lightbulb,
  Info,
  ClipboardList,
  Apple,
  BookOpen,
  Activity,
  CheckCircle,
  LogOut,
} from "lucide-react"

export default function HomePage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* User status and logout button */}
        {user && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">แบบประเมินผลกระทบของโภชนาการต่อสุขภาวะทางกายและจิตใจ</h1>
          <p className="text-xl text-gray-600 mb-8">ประเมินสุขภาวะทางกายและจิตใจของคุณผ่านแบบประเมินที่ครอบคลุม</p>

          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="px-8">
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="px-8">
                  สมัครสมาชิก
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="px-8">
                  เริ่มทำแบบประเมิน
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="overflow-hidden border border-red-100 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-red-50 to-red-100 pt-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <HeartPulse className="h-12 w-12 text-red-500" />
                </div>
              </div>
            </div>
            <CardHeader className="text-center py-3">
              <CardTitle>สุขภาวะทางกาย</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">ประเมิน BMI และสุขภาพร่างกายโดยรวม</CardDescription>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-purple-100 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 pt-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <Brain className="h-12 w-12 text-purple-500" />
                </div>
              </div>
            </div>
            <CardHeader className="text-center py-3">
              <CardTitle>สุขภาวะทางจิต</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">วัดระดับความเครียดและสุขภาพจิต</CardDescription>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-green-100 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-green-50 to-green-100 pt-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <Salad className="h-12 w-12 text-green-500" />
                </div>
              </div>
            </div>
            <CardHeader className="text-center py-3">
              <CardTitle>พฤติกรรมการบริโภค</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">วิเคราะห์นิสัยการกินและการดื่ม</CardDescription>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-blue-100 hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 pt-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <Lightbulb className="h-12 w-12 text-blue-500" />
                </div>
              </div>
            </div>
            <CardHeader className="text-center py-3">
              <CardTitle>คำแนะนำส่วนบุคคล</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">รับคำแนะนำเฉพาะตัวจากผลการประเมิน</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto border-t-4 border-amber-400 shadow-lg bg-gradient-to-b from-white to-amber-50">
          <CardHeader className="text-center py-4 border-b border-amber-100">
            <div className="flex items-center justify-center mb-1">
              <Info className="h-6 w-6 text-amber-500 mr-2" />
              <CardTitle className="text-xl text-amber-700">เกี่ยวกับระบบประเมิน</CardTitle>
            </div>
            <CardDescription className="text-amber-600">ขั้นตอนการประเมินสุขภาวะทางกายและจิตใจ</CardDescription>
          </CardHeader>
          <CardContent className="py-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-2">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">กรอกข้อมูลส่วนตัว</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-2">
                  <Apple className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">ประเมินการบริโภค</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">ประเมินความรู้</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-2">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">ประเมินความเครียด</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-2">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">รับคำแนะนำ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
