"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { getStressLevel } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function StressAssessmentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    stress_1: "", // มีปัญหาการนอน นอนไม่หลับหรือนอนมาก
    stress_2: "", // มีสมาธิน้อยลง
    stress_3: "", // หงุดหงิด / กระวนกระวาย / วิตกกังวล
    stress_4: "", // รู้สึกเบื่อ เซ็ง
    stress_5: "", // ไม่อยากพบปะผู้คน
  })
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchAssessment()
    }
  }, [user, loading, router])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`stress_data_${user.id}`, JSON.stringify(formData))
    }
  }, [formData, user])

  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, stress_data")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setAssessmentId(data.id)

      // If there's existing data in the database, use it
      if (data.stress_data) {
        try {
          const parsedData = JSON.parse(data.stress_data)
          setFormData(parsedData)
          // Also update localStorage with this data to keep them in sync
          localStorage.setItem(`stress_data_${user!.id}`, JSON.stringify(parsedData))
        } catch (e) {
          console.error("Error parsing stress data:", e)
        }
      }
    } catch (err: any) {
      setError("ไม่พบข้อมูลการประเมิน กรุณาเริ่มต้นใหม่")
    }
  }

  const handleRatingChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Check if the option is already selected, if so, deselect it
      const currentValue = prev[field as keyof typeof prev]
      const newValue = currentValue === value ? "" : value

      return {
        ...prev,
        [field]: newValue,
      }
    })
    setValidationError("")
  }

  const calculateStressScore = () => {
    let totalScore = 0
    Object.values(formData).forEach((value) => {
      if (value) {
        totalScore += Number.parseInt(value)
      }
    })
    return totalScore
  }

  const validateForm = () => {
    // Check if all questions are answered
    const allQuestionsAnswered = Object.values(formData).every((value) => value !== "")

    if (!allQuestionsAnswered) {
      setValidationError("กรุณาตอบคำถามให้ครบทุกข้อ")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setSaving(true)
    setError("")
    setValidationError("")

    try {
      if (!assessmentId) throw new Error("ไม่พบข้อมูลการประเมิน")

      const stressScore = calculateStressScore()
      const stressLevel = getStressLevel(stressScore)

      const { error } = await supabase
        .from("assessments")
        .update({
          stress_score: stressScore,
          stress_level: stressLevel,
          stress_data: JSON.stringify(formData),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      if (error) throw error

      router.push("/assessment/results")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
  }

  if (!user) {
    return null
  }

  const StressQuestionRow = ({ questionNumber, question }: { questionNumber: number; question: string }) => (
    <tr>
      <td className="border border-gray-300 p-3 text-center">{questionNumber}</td>
      <td className="border border-gray-300 p-3">{question}</td>
      {[0, 1, 2, 3].map((score) => (
        <td key={score} className="border border-gray-300 p-2 text-center w-1/12">
          <button
            type="button"
            onClick={() => handleRatingChange(`stress_${questionNumber}`, score.toString())}
            className={`w-8 h-8 rounded-full border-2 transition-colors ${
              formData[`stress_${questionNumber}` as keyof typeof formData] === score.toString()
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            {score}
          </button>
        </td>
      ))}
    </tr>
  )

  const totalScore = calculateStressScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ส่วนที่ 5 แบบประเมินความเครียด (ST-5)</h1>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>คำแนะนำ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-700">ประเมินอาการหรือความรู้สึกที่เกิดขึ้นในระยะ 2-4 สัปดาห์</p>
                <p className="text-sm text-gray-700">
                  ความเครียดเกิดขึ้นได้กับทุกคน สาเหตุที่ทำให้เกิดความเครียดมีหลายอย่าง เช่น รายได้ที่ไม่เพียงพอ หนี้สิน ภัยพิบัติต่างๆ
                  ที่ทำให้เกิดความสูญเสีย ความเจ็บป่วย เป็นต้น ความเครียดมีทั้งประโยชน์และโทษ ทำมาก
                  เก็บในจะเกิดผลเสียต่อร่างกายและจิตใจของท่านได้ท่านสามารถประเมินตนเองโดยให้คะแนนแต่ละ 0 – 3 ที่ตรง กับความรู้สึกของท่าน
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">คะแนน 0 หมายถึง เป็นน้อยมากหรือแทบไม่มี</p>
                  <p className="text-sm font-medium">คะแนน 1 หมายถึง เป็นบางครั้ง</p>
                  <p className="text-sm font-medium">คะแนน 2 หมายถึง เป็นบ่อยครั้ง</p>
                  <p className="text-sm font-medium">คะแนน 3 หมายถึง เป็นประจำ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {validationError && (
              <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>แบบประเมินความเครียด ST-5</span>
                  <span className="text-lg font-bold text-blue-600">คะแนนรวม: {totalScore}/15</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 w-1/12">ข้อที่</th>
                        <th className="border border-gray-300 p-3">อาการและความรู้สึกที่เกิดในระยะ 2-4 สัปดาห์</th>
                        <th className="border border-gray-300 p-3 w-1/12">
                          คะแนน
                          <br />0
                        </th>
                        <th className="border border-gray-300 p-3 w-1/12">1</th>
                        <th className="border border-gray-300 p-3 w-1/12">2</th>
                        <th className="border border-gray-300 p-3 w-1/12">3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <StressQuestionRow questionNumber={1} question="มีปัญหาการนอน นอนไม่หลับหรือนอนมาก" />
                      <StressQuestionRow questionNumber={2} question="มีสมาธิน้อยลง" />
                      <StressQuestionRow questionNumber={3} question="หงุดหงิด / กระวนกระวาย / วิตกกังวล" />
                      <StressQuestionRow questionNumber={4} question="รู้สึกเบื่อ เซ็ง" />
                      <StressQuestionRow questionNumber={5} question="ไม่อยากพบปะผู้คน" />
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-3 text-center font-bold" colSpan={2}>
                          คะแนนรวม
                        </td>
                        <td
                          className="border border-gray-300 p-3 text-center font-bold text-xl text-blue-600"
                          colSpan={4}
                        >
                          {totalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/assessment/nutrition-knowledge")}
                className="flex-1"
              >
                ย้อนกลับ
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "กำลังบันทึก..." : "ดูผลการประเมิน"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
