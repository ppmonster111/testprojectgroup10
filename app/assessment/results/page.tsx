"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { getBMICategory, generateNutritionRecommendations } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Heart, Brain, Apple, FileText } from "lucide-react"

interface AssessmentResult {
  id: string
  age: number
  gender: string
  bmi: number
  stress_score: number
  stress_level: string
  consumption_score: number
  nutrition_knowledge_score: number
  nutrition_skills_score: number
  nutrition_perception_score: number
  recommendations: string
  completed_at: string
}

export default function ResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState("")
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchResults()
    }
  }, [user, loading, router])

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user!.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      // Generate recommendations if not already generated
      let recommendations = data.recommendations
      if (!recommendations) {
        recommendations = generateNutritionRecommendations(data)

        // Update the assessment with recommendations
        await supabase.from("assessments").update({ recommendations }).eq("id", data.id)
      }

      setAssessment({ ...data, recommendations })
    } catch (err: any) {
      setError("ไม่พบผลการประเมิน กรุณาทำแบบประเมินให้เสร็จสิ้น")
    } finally {
      setLoadingResults(false)
    }
  }

  if (loading || loadingResults) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลดผลการประเมิน...</div>
  }

  if (!user) {
    return null
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/assessment")} className="mt-4">
              กลับไปทำแบบประเมิน
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ผลการประเมินสุขภาวะ</h1>
            <p className="text-lg text-gray-600">ผลการประเมินและคำแนะนำส่วนบุคคลของคุณ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลทั่วไป
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">อายุ:</span>
                  <span className="font-medium">{assessment.age} ปี</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เพศ:</span>
                  <span className="font-medium">
                    {assessment.gender === "male" ? "ชาย" : assessment.gender === "female" ? "หญิง" : "อื่นๆ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่ประเมิน:</span>
                  <span className="font-medium">{new Date(assessment.completed_at).toLocaleDateString("th-TH")}</span>
                </div>
              </CardContent>
            </Card>

            {/* BMI Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  ดัชนีมวลกาย (BMI)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{assessment.bmi}</div>
                  <div
                    className={`text-lg font-medium ${
                      assessment.bmi < 18.5
                        ? "text-yellow-600"
                        : assessment.bmi < 25
                          ? "text-green-600"
                          : assessment.bmi < 30
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {getBMICategory(assessment.bmi)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Stress Assessment Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  ผลประเมินความเครียด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{assessment.stress_score}/15 คะแนน</div>
                  <div
                    className={`text-lg font-medium ${
                      assessment.stress_score <= 5
                        ? "text-green-600"
                        : assessment.stress_score <= 10
                          ? "text-yellow-600"
                          : assessment.stress_score <= 15
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {assessment.stress_level}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-500" />
                  คะแนนด้านโภชนาการ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">พฤติกรรมการบริโภค:</span>
                  <span className="font-medium">{assessment.consumption_score || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ความรู้ด้านโภชนาการ:</span>
                  <span className="font-medium">{assessment.nutrition_knowledge_score || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ทักษะด้านโภชนาการ:</span>
                  <span className="font-medium">{assessment.nutrition_skills_score || 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                คำแนะนำด้านโภชนาการและการจัดการความเครียด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">{assessment.recommendations}</div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/")} variant="outline">
              กลับหน้าหลัก
            </Button>
            <Button onClick={() => router.push("/assessment")} variant="outline">
              ทำแบบประเมินใหม่
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
