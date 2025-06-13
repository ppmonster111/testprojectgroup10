"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NutritionKnowledgePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Section 4.1 - Nutritional Knowledge Assessment
    section_4_1: {
      knowledge_1: "", // ไม่ทานอาหารขณะดูทีวี
      knowledge_2: "", // อ่านฉลากอาหาร
      knowledge_3: "", // ทานอาหารเสริม
      knowledge_4: "", // ติดตามการกินของตนเองทั้งปริมาณอาหารและอาหารที่กิน
      knowledge_5: "", // ชั่งน้ำหนักและติดตามเป็นประจำ
      knowledge_6: "", // กินตลอดทั้งวัน
    },
    // Section 4.2 - Water consumption habits
    section_4_2: {
      water_intake: "", // น้ำหนักเกิน, น้ำหนักปกติ, น้ำหนักน้อยกว่าปกติ
    },
    // Section 4.3 - Food selection behavior
    section_4_3: {
      food_selection: "", // เหนื่อยง่าย, ปกติ, กระตือรือร้นผิดปกติ, ไม่แน่ใจ
    },
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
      localStorage.setItem(`nutrition_knowledge_data_${user.id}`, JSON.stringify(formData))
    }
  }, [formData, user])

  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, nutrition_data")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setAssessmentId(data.id)

      // If there's existing data in the database, use it
      if (data.nutrition_data) {
        try {
          const parsedData = JSON.parse(data.nutrition_data)
          setFormData(parsedData)
          // Also update localStorage with this data to keep them in sync
          localStorage.setItem(`nutrition_knowledge_data_${user!.id}`, JSON.stringify(parsedData))
        } catch (e) {
          console.error("Error parsing nutrition data:", e)
        }
      }
    } catch (err: any) {
      setError("ไม่พบข้อมูลการประเมิน กรุณาเริ่มต้นใหม่")
    }
  }

  const handleRatingChange = (section: string, field: string, value: string) => {
    setFormData((prev) => {
      // Check if the option is already selected, if so, deselect it
      const currentValue = prev[section as keyof typeof prev][field as keyof any]
      const newValue = currentValue === value ? "" : value

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newValue,
        },
      }
    })
    setValidationError("")
  }

  const handleOptionChange = (section: string, field: string, value: string) => {
    setFormData((prev) => {
      // Check if the option is already selected, if so, deselect it
      const currentValue = prev[section as keyof typeof prev][field]
      const newValue = currentValue === value ? "" : value

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: newValue,
        },
      }
    })
    setValidationError("")
  }

  const validateForm = () => {
    // Check if all questions are answered
    let isValid = true
    const unansweredSections = []

    // Check section 4.1
    const section4_1Complete = Object.values(formData.section_4_1).every((value) => value !== "")
    if (!section4_1Complete) {
      isValid = false
      unansweredSections.push("4.1 ตัวเลือกในจะรักษาน้ำหนักอย่างมีสุขภาพดี")
    }

    // Check section 4.2
    if (!formData.section_4_2.water_intake) {
      isValid = false
      unansweredSections.push("4.2 โดยรวมแล้วคุณดื่มน้ำสุขภาพของคุณเป็นอย่างไร")
    }

    // Check section 4.3
    if (!formData.section_4_3.food_selection) {
      isValid = false
      unansweredSections.push("4.3 คุณคิดว่าช่วงนี้คุณสามารถใช้ชีวิตประจำวันได้ตามปกติหรือไม่")
    }

    if (!isValid) {
      setValidationError(`กรุณาตอบคำถามให้ครบทุกข้อในส่วนที่: ${unansweredSections.join(", ")}`)
    }

    return isValid
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

      const knowledgeScore = calculateKnowledgeScore()
      const skillsScore = calculateSkillsScore()
      const perceptionScore = calculatePerceptionScore()

      const { error } = await supabase
        .from("assessments")
        .update({
          nutrition_knowledge_score: knowledgeScore,
          nutrition_skills_score: skillsScore,
          nutrition_perception_score: perceptionScore,
          nutrition_data: JSON.stringify(formData),
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      if (error) throw error

      router.push("/assessment/stress")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const calculateKnowledgeScore = () => {
    let score = 0
    Object.values(formData.section_4_1).forEach((value) => {
      if (value === "ใช่") score += 1
    })
    return Math.round((score / 6) * 100)
  }

  const calculateSkillsScore = () => {
    // Simple scoring for water intake
    return formData.section_4_2.water_intake ? 50 : 0
  }

  const calculatePerceptionScore = () => {
    // Simple scoring for food selection
    return formData.section_4_3.food_selection ? 50 : 0
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
  }

  if (!user) {
    return null
  }

  const RatingRow = ({ question, section, field }: { question: string; section: string; field: string }) => (
    <tr>
      <td className="border border-gray-300 p-3">{question}</td>
      {["ใช่", "ไม่ใช่", "ไม่แน่ใจ"].map((option) => (
        <td key={option} className="border border-gray-300 p-2 text-center w-1/6">
          <button
            type="button"
            onClick={() => handleRatingChange(section, field, option)}
            className={`w-5 h-5 rounded-full border ${
              formData[section as keyof typeof formData][field as keyof any] === option
                ? "bg-blue-500 border-blue-500"
                : "border-gray-400"
            }`}
            aria-label={option}
          />
        </td>
      ))}
    </tr>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ส่วนที่ 4 ทักษะและการรับรู้ความรู้ด้านโภชนาการ</h1>
          </div>

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

            {/* Section 4.1 - Nutritional Knowledge Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>4.1 ตัวเลือกในจะรักษาน้ำหนักอย่างมีสุขภาพดี</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left w-1/2">ตัวเลือกในจะรักษาน้ำหนักอย่างมีสุขภาพดี</th>
                        <th className="border border-gray-300 p-3 w-1/6">ใช่</th>
                        <th className="border border-gray-300 p-3 w-1/6">ไม่ใช่</th>
                        <th className="border border-gray-300 p-3 w-1/6">ไม่แน่ใจ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <RatingRow question="ไม่ทานอาหารขณะดูทีวี" section="section_4_1" field="knowledge_1" />
                      <RatingRow question="อ่านฉลากอาหาร" section="section_4_1" field="knowledge_2" />
                      <RatingRow question="ทานอาหารเสริม" section="section_4_1" field="knowledge_3" />
                      <RatingRow
                        question="ติดตามการกินของตนเองทั้งปริมาณอาหารและอาหารที่กิน"
                        section="section_4_1"
                        field="knowledge_4"
                      />
                      <RatingRow question="ชั่งน้ำหนักและติดตามเป็นประจำ" section="section_4_1" field="knowledge_5" />
                      <RatingRow question="กินตลอดทั้งวัน" section="section_4_1" field="knowledge_6" />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Section 4.2 - Water consumption habits */}
            <Card>
              <CardHeader>
                <CardTitle>4.2 โดยรวมแล้วคุณดื่มน้ำสุขภาพของคุณเป็นอย่างไร</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: "much", label: "น้ำหนักเกิน" },
                    { key: "normal", label: "น้ำหนักปกติ" },
                    { key: "less", label: "น้ำหนักน้อยกว่าปกติ" },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOptionChange("section_4_2", "water_intake", option.key)}
                        className={`w-5 h-5 rounded-full border ${
                          formData.section_4_2.water_intake === option.key
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-400"
                        }`}
                        aria-label={option.label}
                      />
                      <label className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 4.3 - Food selection behavior */}
            <Card>
              <CardHeader>
                <CardTitle>4.3 คุณคิดว่าช่วงนี้คุณสามารถใช้ชีวิตประจำวันได้ตามปกติหรือไม่</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: "tired", label: "เหนื่อยง่าย" },
                    { key: "normal", label: "ปกติ" },
                    { key: "energetic", label: "กระตือรือร้นผิดปกติ" },
                    { key: "unsure", label: "ไม่แน่ใจ" },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOptionChange("section_4_3", "food_selection", option.key)}
                        className={`w-5 h-5 rounded-full border ${
                          formData.section_4_3.food_selection === option.key
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-400"
                        }`}
                        aria-label={option.label}
                      />
                      <label className="text-sm">{option.label}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/assessment/consumption")}
                className="flex-1"
              >
                ย้อนกลับ
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "กำลังบันทึก..." : "ถัดไป"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
