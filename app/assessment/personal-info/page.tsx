"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { calculateBMI } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Faculty and major data for University of Phayao
const facultyData = {
  agriculture: {
    name: "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
    majors: [
      "สาขาวิชาเกษตรศาสตร์",
      "สาขาวิชาเทคโนโลยีนวัตกรรมการประมง",
      "สาขาวิชาความปลอดภัยทางอาหาร",
      "สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร",
      "สาขาวิชาสัตวศาสตร์",
      "สาขาวิชาเทคโนโลยีการเกษตร",
    ],
  },
  dentistry: {
    name: "คณะทันตแพทยศาสตร์",
    majors: [],
  },
  ict: {
    name: "คณะเทคโนโลยีสารสนเทศและการสื่อสาร",
    majors: [
      "สาขาวิชาคอมพิวเตอร์กราฟิกและมัลติมีเดีย",
      "สาขาวิชาธุรกิจดิจิทัล",
      "สาขาวิชาภูมิสารสนเทศศาสตร์",
      "สาขาวิชาวิทยาการข้อมูลและการประยุกต์",
      "สาขาวิชาวิทยาการคอมพิวเตอร์",
      "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
      "สาขาวิชาวิศวกรรมซอฟต์แวร์",
    ],
  },
  law: {
    name: "คณะนิติศาสตร์",
    majors: [],
  },
  business: {
    name: "คณะบริหารธุรกิจและนิเทศศาสตร์",
    majors: [
      "สาขาวิชาการจัดการการสื่อสาร",
      "สาขาวิชาการสื่อสารสื่อใหม่",
      "สาขาวิชาการเงินและการลงทุน",
      "สาขาวิชาการจัดการธุรกิจ",
      "สาขาวิชาการตลาดดิจิทัล",
      "สาขาวิชาการท่องเที่ยวและการโรงแรม",
    ],
  },
  nursing: {
    name: "คณะพยาบาลศาสตร์",
    majors: [],
  },
  energy: {
    name: "คณะพลังงานและสิ่งแวดล้อม",
    majors: ["สาขาวิศวกรรมสิ่งแวดล้อม", "สาขาการจัดการพลังงานและสิ่งแวดล้อม"],
  },
  medicine: {
    name: "คณะแพทยศาสตร์",
    majors: ["สาขาวิชาปฎิบัติการฉุกเฉินการแพทย์"],
  },
  pharmacy: {
    name: "คณะเภสัชศาสตร์",
    majors: ["สาขาวิชาบริบาลทางเภสัชกรรม", "สาขาวิชาวิทยาศาสตร์เครื่องสำอาง"],
  },
  political: {
    name: "คณะรัฐศาสตร์และสังคมศาสตร์",
    majors: ["สาขาวิชาการนวัตกรรมสาธารณะ", "สาขาวิชาพัฒนาสังคม"],
  },
  science: {
    name: "คณะวิทยาศาสตร์",
    majors: [
      "สาขาวิชาเคมี",
      "สาขาวิชาคณิตศาสตร์",
      "สาขาวิชาชีววิทยา",
      "สาขาวิชาฟิสิกส์",
      "สาขาวิชาวิทยาศาสตร์การออกกำลังกายและการกีฬา",
      "สาขาวิชาสถิติประยุกต์และการจัดการข้อมูล",
    ],
  },
  engineering: {
    name: "คณะวิศวกรรมศาสตร์",
    majors: ["สาขาวิชาวิศวกรรมเครื่องกล", "สาขาวิชาวิศวกรรมโยธา", "สาขาวิชาวิศวกรรมไฟฟ้า", "สาขาวิชาวิศวกรรมอุตสาหการ"],
  },
  architecture: {
    name: "คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์",
    majors: ["สาขาวิชาดนตรีและนาฎศิลป์", "สาขาวิชาศิลปะและการออกแบบ", "สาขาวิชาสถาปัตยกรรม", "สาขาวิชาสถาปัตยกรรมภายใน"],
  },
  allied_health: {
    name: "คณะสหเวชศาสตร์",
    majors: ["สาขาวิชาเทคนิคการแพทย์"],
  },
  public_health: {
    name: "คณะสาธารณสุขศาสตร์",
    majors: ["สาขาวิชาการส่งเสริมสุขภาพ", "สาขาวิชาอนามัยสิ่งแวดล้อม", "สาขาวิชาอาชีวอนามัยและความปลอดภัย", "สาขาวิชาอนามัยชุมชน"],
  },
  medical_science: {
    name: "คณะวิทยาศาสตร์การแพทย์",
    majors: ["สาขาวิชาโภชนาการและการกำหนดอาหาร", "สาขาวิชาจุลชีววิทยา", "สาขาวิชาชีวเคมี"],
  },
  liberal_arts: {
    name: "คณะศิลปศาสตร์",
    majors: ["สาขาวิชาภาษาไทย", "สาขาวิชาภาษาจีน", "สาขาวิชาภาษาญี่ปุ่น", "สาขาวิชาภาษาฝรั่งเศส", "สาขาวิชาภาษาอังกฤษ"],
  },
  education: {
    name: "วิทยาลัยการศึกษา",
    majors: [],
  },
}

export default function PersonalInfoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    gender_other: "",
    year_of_study: "",
    height: "",
    weight: "",
    faculty: "",
    major: "",
    // Medical conditions
    medical_conditions: {
      none: false,
      diabetes: false,
      hypertension: false,
      heart_disease: false,
      cancer: false,
      std: false,
      respiratory: false,
      digestive: false,
      depression: false,
      others: false,
      others_text: "",
    },
    // Current medications
    current_medications: {
      none: false,
      insulin: false,
      lipid_lowering: false,
      antihypertensive: false,
      antihistamine: false,
      antidepressant: false,
      others: false,
      others_text: "",
    },
    // Surgery history
    surgery_history: {
      none: false,
      yes: false,
      details: "",
    },
  })
  const [bmi, setBmi] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (formData.height && formData.weight) {
      const height = Number.parseFloat(formData.height)
      const weight = Number.parseFloat(formData.weight)
      if (height > 0 && weight > 0) {
        const calculatedBMI = calculateBMI(height, weight)
        setBmi(calculatedBMI)
      }
    }
  }, [formData.height, formData.weight])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (section: string, field: string, checked: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const assessmentData = {
        user_id: user!.id,
        age: Number.parseInt(formData.age),
        gender: formData.gender === "other" ? "other" : formData.gender, // Always store 'other' for LGBTQ selections
        year_of_study: Number.parseInt(formData.year_of_study),
        height: Number.parseFloat(formData.height),
        weight: Number.parseFloat(formData.weight),
        bmi: bmi,
        faculty: formData.major || formData.faculty,
        medical_conditions: JSON.stringify({
          ...formData.medical_conditions,
          gender_other: formData.gender_other, // Store the specific LGBTQ choice here
        }),
        allergies: JSON.stringify(formData.current_medications),
        surgery_history: JSON.stringify(formData.surgery_history),
      }

      const { error } = await supabase.from("assessments").insert([assessmentData])

      if (error) throw error

      router.push("/assessment/consumption")
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

  const selectedFacultyData = formData.faculty ? facultyData[formData.faculty as keyof typeof facultyData] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ส่วนที่ 2 ข้อมูลทั่วไป</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>2.1 อายุ</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                      min="1"
                      max="100"
                      placeholder="ปี"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>2.2 เพศ</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="male"
                          checked={formData.gender === "male"}
                          onCheckedChange={(checked) => handleInputChange("gender", checked ? "male" : "")}
                        />
                        <label htmlFor="male" className="text-sm">
                          1. ชาย
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="female"
                          checked={formData.gender === "female"}
                          onCheckedChange={(checked) => handleInputChange("gender", checked ? "female" : "")}
                        />
                        <label htmlFor="female" className="text-sm">
                          2. หญิง
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other"
                          checked={formData.gender === "other"}
                          onCheckedChange={(checked) => handleInputChange("gender", checked ? "other" : "")}
                        />
                        <label htmlFor="other" className="text-sm">
                          3. อื่นๆ
                        </label>
                      </div>
                      {formData.gender === "other" && (
                        <Select
                          value={formData.gender_other}
                          onValueChange={(value) => handleInputChange("gender_other", value)}
                        >
                          <SelectTrigger className="ml-6">
                            <SelectValue placeholder="เลือก LGBTQ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lesbian">Lesbian</SelectItem>
                            <SelectItem value="gay">Gay</SelectItem>
                            <SelectItem value="bisexual">Bisexual</SelectItem>
                            <SelectItem value="transgender">Transgender</SelectItem>
                            <SelectItem value="queer">Queer</SelectItem>
                            <SelectItem value="questioning">Questioning</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>2.3 ชั้นปี</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`year-${year}`}
                          checked={formData.year_of_study === year.toString()}
                          onCheckedChange={(checked) =>
                            handleInputChange("year_of_study", checked ? year.toString() : "")
                          }
                        />
                        <label htmlFor={`year-${year}`} className="text-sm">
                          ปีที่ {year}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>2.4 ส่วนสูง (เซนติเมตร)</Label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      required
                      min="100"
                      max="250"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>2.5 น้ำหนัก (กิโลกรัม)</Label>
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      required
                      min="30"
                      max="200"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>2.6 BMI</Label>
                  {bmi && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-800">{bmi}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>2.7 โรคประจำตัว</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: "none", label: "ไม่มี" },
                    { key: "diabetes", label: "โรคเบาหวาน" },
                    { key: "hypertension", label: "โรคความดันโลหิตสูง" },
                    { key: "heart_disease", label: "โรคหัวใจและหลอดเลือด" },
                    { key: "cancer", label: "โรคมะเร็ง" },
                    { key: "std", label: "โรคติดเชื้อทางเพศสัมพันธ์" },
                    { key: "respiratory", label: "โรคติดเชื้อทางเดินหายใจ" },
                    { key: "digestive", label: "โรคเกี่ยวกับระบบทางเดินอาหาร" },
                    { key: "depression", label: "โรคซึมเศร้า" },
                  ].map((condition) => (
                    <div key={condition.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition.key}`}
                        checked={formData.medical_conditions[condition.key as keyof typeof formData.medical_conditions]}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("medical_conditions", condition.key, checked as boolean)
                        }
                      />
                      <label htmlFor={`condition-${condition.key}`} className="text-sm">
                        {condition.label}
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="condition-others"
                      checked={formData.medical_conditions.others}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("medical_conditions", "others", checked as boolean)
                      }
                    />
                    <label htmlFor="condition-others" className="text-sm">
                      อื่นๆ
                    </label>
                    <Input
                      placeholder="ระบุ..."
                      value={formData.medical_conditions.others_text}
                      onChange={(e) => handleCheckboxChange("medical_conditions", "others_text", e.target.value)}
                      className="ml-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle>2.8 ยาที่รับประทานเป็นประจำ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: "none", label: "ไม่มี" },
                    { key: "insulin", label: "อินซูลิน" },
                    { key: "lipid_lowering", label: "ลดไขมัน/คอเลสเตอรอล" },
                    { key: "antihypertensive", label: "ยาต้านความดันโลหิตสูง" },
                    { key: "antihistamine", label: "สารต้านฮิสตามีน" },
                    { key: "antidepressant", label: "ยาต้านอาการซึมเศร้า" },
                  ].map((med) => (
                    <div key={med.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`med-${med.key}`}
                        checked={formData.current_medications[med.key as keyof typeof formData.current_medications]}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("current_medications", med.key, checked as boolean)
                        }
                      />
                      <label htmlFor={`med-${med.key}`} className="text-sm">
                        {med.label}
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="med-others"
                      checked={formData.current_medications.others}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("current_medications", "others", checked as boolean)
                      }
                    />
                    <label htmlFor="med-others" className="text-sm">
                      อื่นๆ
                    </label>
                    <Input
                      placeholder="ระบุ..."
                      value={formData.current_medications.others_text}
                      onChange={(e) => handleCheckboxChange("current_medications", "others_text", e.target.value)}
                      className="ml-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Surgery History */}
            <Card>
              <CardHeader>
                <CardTitle>2.9 ประวัติการผ่าตัด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="surgery-none"
                        checked={formData.surgery_history.none}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("surgery_history", "none", checked as boolean)
                        }
                      />
                      <label htmlFor="surgery-none" className="text-sm">
                        ไม่มี
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="surgery-yes"
                        checked={formData.surgery_history.yes}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("surgery_history", "yes", checked as boolean)
                        }
                      />
                      <label htmlFor="surgery-yes" className="text-sm">
                        มี
                      </label>
                    </div>
                  </div>
                  {formData.surgery_history.yes && (
                    <div className="ml-6">
                      <Input
                        placeholder="ระบุรายละเอียดการผ่าตัด..."
                        value={formData.surgery_history.details}
                        onChange={(e) => handleCheckboxChange("surgery_history", "details", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Faculty and Major */}
            <Card>
              <CardHeader>
                <CardTitle>2.10 ขณะนี้กำลังศึกษาอยู่คณะใด/สาขาใด</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>คณะ</Label>
                  <Select
                    value={formData.faculty}
                    onValueChange={(value) => {
                      handleInputChange("faculty", value)
                      handleInputChange("major", "") // Reset major when faculty changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคณะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(facultyData).map(([key, faculty]) => (
                        <SelectItem key={key} value={key}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFacultyData && selectedFacultyData.majors.length > 0 && (
                  <div className="space-y-2">
                    <Label>สาขาวิชา</Label>
                    <Select value={formData.major} onValueChange={(value) => handleInputChange("major", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขาวิชา" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFacultyData.majors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/assessment")} className="flex-1">
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
