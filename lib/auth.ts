import { supabase } from "./supabase"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// เก็บ OTP ชั่วคราวในหน่วยความจำ (ในระบบจริงควรใช้ Redis หรือฐานข้อมูล)
const otpStore: Record<string, { otp: string; expires: number }> = {}

export async function signUp(email: string, password: string, role: "user" | "admin" = "user") {
  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password_hash: hashedPassword, role }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error || !user) {
    throw new Error("ไม่พบผู้ใช้งาน")
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash)

  if (!isValidPassword) {
    throw new Error("รหัสผ่านไม่ถูกต้อง")
  }

  return user
}

export async function sendPasswordResetOTP(email: string) {
  // ตรวจสอบว่ามีผู้ใช้งานที่ใช้อีเมลนี้หรือไม่
  const { data: user, error } = await supabase.from("users").select("id").eq("email", email).single()

  if (error || !user) {
    throw new Error("ไม่พบผู้ใช้งานที่ใช้อีเมลนี้")
  }

  // สร้าง OTP แบบสุ่ม 6 หลัก
  const otp = crypto.randomInt(100000, 999999).toString()

  // เก็บ OTP ไว้ในหน่วยความจำพร้อมกำหนดเวลาหมดอายุ (10 นาที)
  otpStore[email] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 นาที
  }

  // ในระบบจริง ควรส่งอีเมลด้วย SMTP หรือบริการส่งอีเมล
  // แต่ในตัวอย่างนี้จะจำลองการส่งอีเมล
  console.log(`ส่ง OTP: ${otp} ไปยังอีเมล: ${email}`)

  // สำหรับการทดสอบ เราจะคืนค่า OTP (ในระบบจริงไม่ควรทำแบบนี้)
  return { success: true, message: "ส่ง OTP ไปยังอีเมลของคุณแล้ว" }
}

export async function verifyOTPAndResetPassword(email: string, otp: string, newPassword: string) {
  // ตรวจสอบว่ามี OTP สำหรับอีเมลนี้หรือไม่
  const storedOTPData = otpStore[email]

  if (!storedOTPData) {
    throw new Error("ไม่พบ OTP สำหรับอีเมลนี้ กรุณาขอ OTP ใหม่")
  }

  // ตรวจสอบว่า OTP หมดอายุหรือไม่
  if (Date.now() > storedOTPData.expires) {
    delete otpStore[email] // ลบ OTP ที่หมดอายุ
    throw new Error("OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่")
  }

  // ตรวจสอบว่า OTP ถูกต้องหรือไม่
  if (storedOTPData.otp !== otp) {
    throw new Error("OTP ไม่ถูกต้อง")
  }

  // OTP ถูกต้อง ทำการเปลี่ยนรหัสผ่าน
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const { error } = await supabase.from("users").update({ password_hash: hashedPassword }).eq("email", email)

  if (error) {
    throw new Error("ไม่สามารถเปลี่ยนรหัสผ่านได้")
  }

  // ลบ OTP หลังจากใช้งานแล้ว
  delete otpStore[email]

  return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" }
}

export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2))
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "น้ำหนักน้อย"
  if (bmi < 25) return "น้ำหนักปกติ"
  if (bmi < 30) return "น้ำหนักเกิน"
  return "อ้วน"
}

export function getStressLevel(score: number): string {
  if (score <= 5) return "ความเครียดต่ำ"
  if (score <= 10) return "ความเครียดปานกลาง"
  if (score <= 15) return "ความเครียดสูง"
  return "ความเครียดสูงมาก"
}

export function generateNutritionRecommendations(assessment: any): string {
  const recommendations = []

  // BMI recommendations
  if (assessment.bmi < 18.5) {
    recommendations.push("• เพิ่มปริมาณอาหารที่มีคุณค่าทางโภชนาการ เน้นโปรตีนและคาร์โบไฮเดรตเชิงซ้อน")
  } else if (assessment.bmi >= 25) {
    recommendations.push("• ควบคุมปริมาณอาหาร เน้นผักและผลไม้ ลดอาหารที่มีไขมันสูง")
  }

  // Stress recommendations
  if (assessment.stress_score > 10) {
    recommendations.push("• เพิ่มการบริโภคอาหารที่มีแมกนีเซียม เช่น ถั่วเขียว ผักใบเขียวเข้ม")
    recommendations.push("• หลีกเลี่ยงคาเฟอีนและแอลกอฮอล์ในช่วงเย็น")
  }

  // General recommendations
  recommendations.push("• ดื่มน้ำให้เพียงพอ อย่างน้อย 8 แก้วต่อวัน")
  recommendations.push("• รับประทานอาหารครบ 5 หมู่ในสัดส่วนที่เหมาะสม")
  recommendations.push("• ออกกำลังกายสม่ำเสมอ อย่างน้อยสัปดาห์ละ 3 ครั้ง")

  return recommendations.join("\n")
}
