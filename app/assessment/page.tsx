"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FileText, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AssessmentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [consentChecked, setConsentChecked] = useState(false)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      checkForCompletedAssessment()
    }
  }, [user, loading, router])

  const checkForCompletedAssessment = async () => {
    try {
      const { data } = await supabase
        .from("assessments")
        .select("completed_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data && data.completed_at) {
        setHasCompletedAssessment(true)
      }
    } catch (error) {
      // No completed assessment found, or first-time user
      console.log("No completed assessment found")
    }
  }

  const handleStartAssessment = () => {
    if (consentChecked) {
      // If user has a completed assessment, create a new one
      if (hasCompletedAssessment) {
        createNewAssessment()
      } else {
        router.push("/assessment/personal-info")
      }
    }
  }

  const createNewAssessment = async () => {
    try {
      // Create a new assessment record
      const { data, error } = await supabase
        .from("assessments")
        .insert([{ user_id: user!.id }])
        .select()

      if (error) throw error

      // Clear all localStorage data for this user to start fresh
      localStorage.removeItem(`consumption_data_${user!.id}`)
      localStorage.removeItem(`nutrition_knowledge_data_${user!.id}`)
      localStorage.removeItem(`stress_data_${user!.id}`)

      router.push("/assessment/personal-info")
    } catch (error) {
      console.error("Error creating new assessment:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Record Form</h1>
            <p className="text-base text-gray-700">
              แบบสอบถามข้อมูลการบริโภคและสุขภาพร่างกายและสุขภาพจิตของบุคคลทั่วไปและนักศึกษามหาวิทยาลัยพะเยา ปีที่ 1-6
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ส่วนที่ 1 Consent Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  แบบฟอร์มยินยอมเข้าร่วมการศึกษา โดยจะขอเก็บข้อมูลที่ไป่ ข้อมูลพฤติกรรมการบริโภค ข้อมูลด้านความรู้ด้านโภชนาการ
                  การประเมินความเครียดและสุขภาพจิต ข้อมูลที่ท่านมอบที่ท่าน ให้จะถูกเก็บไว้เป็นความลับ และไม่สามารถระบุถึงตัวตนของท่านได้
                  ข้อมูลที่เก็บจะถูกนำไปใช้ เพื่อการศึกษาและวิจัยเท่านั้น และจะไม่มีการเผยแพร่ข้อมูลในรูปแบบที่สามารถระบุตัวตนของ ท่านได้
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox id="consent" checked={consentChecked} onCheckedChange={setConsentChecked} />
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ยินยอม
                  </label>
                </div>
              </div>

              {!consentChecked && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">กรุณายินยอมเพื่อดำเนินการต่อ</span>
                </div>
              )}

              {hasCompletedAssessment && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">คุณเคยทำแบบประเมินแล้ว การเริ่มใหม่จะสร้างแบบประเมินใหม่และไม่มีผลต่อแบบประเมินเดิม</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={handleStartAssessment} size="lg" className="px-12" disabled={!consentChecked}>
              {hasCompletedAssessment ? "เริ่มทำแบบประเมินใหม่" : "เริ่มทำแบบประเมิน"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
