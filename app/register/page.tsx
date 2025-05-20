"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        initials: getInitials(name),
      }),
    })
    if (res.status === 201) {
      // Simpan user ke localStorage agar bisa diakses di dashboard
      localStorage.setItem("user", JSON.stringify({
        name,
        email,
        initials: getInitials(name),
      }))
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      })
      router.push("/dashboard")
    } else {
      const data = await res.json()
      setErrors({ email: data.error || "Registration failed" })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen relative bg-white overflow-hidden">
      {/* Background illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/Asset/Login.svg"
          alt="Virtual meeting illustration"
          fill
          className="object-cover w-full h-full opacity-40"
          priority
        />
      </div>
    
      {/* Back to landing link */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-green-800 font-bold bg-white/90 px-3 py-1.5 rounded-full shadow border border-green-200 hover:bg-green-50 hover:text-green-900 transition-all duration-150 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Landing Page
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 flex justify-center relative z-10">
        <Card className="w-full max-w-md bg-white/95 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Join our virtual meeting platform</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

// Tidak ada kode dinamis di render, hanya di handleSubmit
