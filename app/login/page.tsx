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

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Fungsi untuk generate inisial dari nama/email
  function getInitials(nameOrEmail: string) {
    if (!nameOrEmail) return ""
    // Jika nama, ambil huruf depan tiap kata
    if (nameOrEmail.includes(" ")) {
      return nameOrEmail
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    }
    // Jika email, ambil dua huruf pertama sebelum @
    return nameOrEmail[0]?.toUpperCase() + (nameOrEmail[1]?.toUpperCase() || "")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // In a real app, you would authenticate with a backend
    // For demo purposes, we'll just check localStorage and redirect
    setTimeout(() => {
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        const user = JSON.parse(storedUser)

        if (user.email === email) {
          // Update initials dari email jika nama tidak ada
          user.initials = getInitials(user.name || user.email || "")
          // Simpan kembali ke localStorage agar dashboard membaca data terbaru
          localStorage.setItem("user", JSON.stringify(user))

          toast({
            title: "Login successful",
            description: "Welcome back!",
          })
          router.push("/dashboard")
        } else {
          setErrors({ email: "Invalid email or password" })
        }
      } else {
        // If no user exists, create a demo user
        const user = {
          id: `user_${Date.now()}`,
          name: email.split("@")[0], // gunakan nama dari email
          email,
          initials: getInitials(email.split("@")[0] || email),
        }

        localStorage.setItem("user", JSON.stringify(user))

        toast({
          title: "Login successful",
          description: "Welcome to Virtual Meeting!",
        })

        router.push("/dashboard")
      }

      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen relative bg-white overflow-hidden">
      {/* Background illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/Asset/Login.svg"
          alt="Virtual meeting illustration"
          fill
          className="object-cover w-full h-full opacity-60"
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

      <div className="min-h-screen flex items-center justify-center p-3 relative z-10">
        <Card className="w-full max-w-md bg-white/95 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded border-gray-300" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <p className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-green-600 font-bold hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
