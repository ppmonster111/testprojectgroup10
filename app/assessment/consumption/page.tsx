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

export default function ConsumptionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Section 3.1 - Sweet consumption habits
    section_3_1: {
      water: "",
      soft_drinks: "",
      fruit_juice: "",
      desserts: "",
      sugar_addition: "",
    },
    // Section 3.2 - Fat consumption habits
    section_3_2: {
      lean_meat: "",
      fried_food: "",
      high_fat_dishes: "",
      sweet_drinks: "",
      soup_gravy: "",
    },
    // Section 3.3 - Sodium consumption habits
    section_3_3: {
      taste_before_season: "",
      herbs_spices: "",
      processed_meat: "",
      instant_food: "",
      pickled_food: "",
    },
  })
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [saving, setSaving] = useState(false)

  // Update the useEffect to prioritize database data over localStorage
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
      localStorage.setItem(`consumption_data_${user.id}`, JSON.stringify(formData))
    }
  }, [formData, user])

  const loadSavedFormData = () => {
    if (user) {
      const savedData = localStorage.getItem(`consumption_data_${user.id}`)
      if (savedData) {
        setFormData(JSON.parse(savedData))
      }
    }
  }

  // Update the fetchAssessment function to properly load existing data
  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, consumption_data")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setAssessmentId(data.id)

      // If there's existing data in the database, use it
      if (data.consumption_data) {
        try {
          const parsedData = JSON.parse(data.consumption_data)
          setFormData(parsedData)
          // Also update localStorage with this data to keep them in sync
          localStorage.setItem(`consumption_data_${user!.id}`, JSON.stringify(parsedData))
        } catch (e) {
          console.error("Error parsing consumption data:", e)
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

  const validateForm = () => {
    // Check if all questions are answered
    let isValid = true
    const unansweredSections = []

    // Check section 3.1
    const section3_1Complete = Object.values(formData.section_3_1).every((value) => value !== "")
    if (!section3_1Complete) {
      isValid = false
      unansweredSections.push("3.1 ประเมินนิสัยการบริโภคหวาน")
    }

    // Check section 3.2
    const section3_2Complete = Object.values(formData.section_3_2).every((value) => value !== "")
    if (!section3_2Complete) {
      isValid = false
      unansweredSections.push("3.2 ประเมินนิสัยการบริโภคไขมัน")
    }

    // Check section 3.3
    const section3_3Complete = Object.values(formData.section_3_3).every((value) => value !== "")
    if (!section3_3Complete) {
      isValid = false
      unansweredSections.push("3.3 ประเมินนิสัยการบริโภคโซเดียม")
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

      const consumptionScore = calculateConsumptionScore()

      const { error } = await supabase
        .from("assessments")
        .update({
          consumption_score: consumptionScore,
          consumption_data: JSON.stringify(formData),
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      if (error) throw error

      router.push("/assessment/nutrition-knowledge")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const calculateConsumptionScore = () => {
    let score = 0
    let totalQuestions = 0

    Object.values(formData).forEach((section) => {
      Object.values(section).forEach((value) => {
        totalQuestions++
        if (value === "ทุกวัน/เกือบทุกวัน") score += 3
        else if (value === "3-4 ครั้ง/สัปดาห์") score += 2
        else if (value === "แทบไม่ทำ/ไม่ทำเลย") score += 1
      })
    })

    return totalQuestions > 0 ? Math.round((score / (totalQuestions * 3)) * 100) : 0
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
  }

  if (!user) {
    return null
  }

  const FoodItemRow = ({
    section,
    field,
    label,
  }: {
    section: string
    field: string
    label: string
  }) => (
    <tr>
      <td className="border border-gray-300 p-3 text-left">{label}</td>
      {["ทุกวัน/เกือบทุกวัน", "3-4 ครั้ง/สัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"].map((option) => (
        <td key={option} className="border border-gray-300 p-3 text-center w-1/5">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ส่วนที่ 3: พฤติกรรมการบริโภค</h1>
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

            {/* Section 3.1 - Sweet consumption habits */}
            <Card>
              <CardHeader>
                <CardTitle>3.1 ประเมินนิสัยการบริโภคหวาน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left w-2/5">รายการ</th>
                        <th className="border border-gray-300 p-3 w-1/5">ทุกวัน/เกือบทุกวัน</th>
                        <th className="border border-gray-300 p-3 w-1/5">3-4 ครั้ง/สัปดาห์</th>
                        <th className="border border-gray-300 p-3 w-1/5">แทบไม่ทำ/ไม่ทำเลย</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FoodItemRow section="section_3_1" field="water" label="ดื่มน้ำเปล่า" />
                      <FoodItemRow section="section_3_1" field="soft_drinks" label="ดื่มน้ำอัดลม กาแฟ ชา น้ำหวาน นมเปรี้ยว" />
                      <FoodItemRow section="section_3_1" field="fruit_juice" label="ดื่มน้ำผักผลไม้ไม้สำเร็จรูป" />
                      <FoodItemRow section="section_3_1" field="desserts" label="กินไอศกรีม เบเกอรี่ หรือ ขนมหวานไทย" />
                      <FoodItemRow section="section_3_1" field="sugar_addition" label="เติมน้ำตาลเพิ่มลงในอาหาร" />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Section 3.2 - Fat consumption habits */}
            <Card>
              <CardHeader>
                <CardTitle>3.2 ประเมินนิสัยการบริโภคไขมัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left w-2/5">รายการ</th>
                        <th className="border border-gray-300 p-3 w-1/5">ทุกวัน/เกือบทุกวัน</th>
                        <th className="border border-gray-300 p-3 w-1/5">3-4 ครั้ง/สัปดาห์</th>
                        <th className="border border-gray-300 p-3 w-1/5">แทบไม่ทำ/ไม่ทำเลย</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FoodItemRow section="section_3_2" field="lean_meat" label="เลือกกินเนื้อสัตว์ไม่ติดมัน ไม่ติดหนัง" />
                      <FoodItemRow
                        section="section_3_2"
                        field="fried_food"
                        label="กินอาหารทอด อาหารฟาสต์ฟู้ด อาหารผัดน้ำมัน"
                      />
                      <FoodItemRow
                        section="section_3_2"
                        field="high_fat_dishes"
                        label="กินอาหารจานเดียวไขมันสูง หรือ อาหารประเภทแกงกะทิ"
                      />
                      <FoodItemRow
                        section="section_3_2"
                        field="sweet_drinks"
                        label="ดื่มเครื่องดื่มที่ชงผสมนมข้นหวาน ครีมเทียม วิปปิ้งครีม"
                      />
                      <FoodItemRow
                        section="section_3_2"
                        field="soup_gravy"
                        label="ซดน้ำผัด/น้ำแกง หรือ ราดน้ำมัน/น้ำแกง ลงในข้าว"
                      />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Section 3.3 - Sodium consumption habits */}
            <Card>
              <CardHeader>
                <CardTitle>3.3 ประเมินนิสัยการบริโภคโซเดียม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left w-2/5">รายการ</th>
                        <th className="border border-gray-300 p-3 w-1/5">ทุกวัน/เกือบทุกวัน</th>
                        <th className="border border-gray-300 p-3 w-1/5">3-4 ครั้ง/สัปดาห์</th>
                        <th className="border border-gray-300 p-3 w-1/5">แทบไม่ทำ/ไม่ทำเลย</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FoodItemRow
                        section="section_3_3"
                        field="taste_before_season"
                        label="ชิมอาหารก่อนปรุงน้ำปลา ซีอิ้ว ซอส"
                      />
                      <FoodItemRow
                        section="section_3_3"
                        field="herbs_spices"
                        label="กินอาหารที่มีสมุนไพร หรือ เครื่องเทศ เป็นส่วนประกอบ"
                      />
                      <FoodItemRow
                        section="section_3_3"
                        field="processed_meat"
                        label="กินเนื้อสัตว์แปรรูป ไส้กรอก หมูยอ แฮม ปลาเค็ม กุ้งแห้ง ปลาร้า"
                      />
                      <FoodItemRow
                        section="section_3_3"
                        field="instant_food"
                        label="กินบะหมี่กึ่งสำเร็จรูป โจ๊กกึ่งสำเร็จรูป หรือ อาหารกล่องแช่แข็ง"
                      />
                      <FoodItemRow section="section_3_3" field="pickled_food" label="กินผักผลไม้ดอง หรือ ผลไม้แช่อิ่ม" />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/assessment/personal-info")}
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
