"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { getInitials } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    id: "user1",
    name: "Guest User",
    email: "guest@example.com",
    initials: "GU",
  })
  const [bio, setBio] = useState("Virtual meeting enthusiast")
  const [notifications, setNotifications] = useState({
    email: true,
    reminders: true,
    chat: false,
  })

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    const storedBio = localStorage.getItem("userBio")
    if (storedBio) {
      setBio(storedBio)
    }

    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications))
      } catch (error) {
        console.error("Error loading notification settings:", error)
      }
    }
  }, [])

  // Simpan user ke localStorage setiap kali user berubah
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user))
  }, [user])

  const updateProfile = (e: React.FormEvent) => {
    e.preventDefault()

    // Tidak perlu update initials di sini, sudah otomatis lewat onChange dan useEffect
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("userBio", bio)

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    })
  }

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Password updated",
      description: "Your password has been updated successfully",
    })
  }

  const updateNotifications = (e: React.FormEvent) => {
    e.preventDefault()

    // Save to localStorage
    localStorage.setItem("notifications", JSON.stringify(notifications))

    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated",
    })
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-green-600">
            Virtual Meeting
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/meeting/new">
              <Button className="bg-green-600 hover:bg-green-700">New Meeting</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4 bg-green-600">
                    <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="h-2 bg-gray-200 rounded-full w-full">
                    <div className="h-2 bg-green-600 rounded-full w-1/3"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full">
                    <div className="h-2 bg-green-600 rounded-full w-3/4"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full">
                    <div className="h-2 bg-green-600 rounded-full w-1/2"></div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 relative">
              <div className="absolute -right-20 -top-20 w-[500px] h-[500px] opacity-10 md:opacity-100 pointer-events-none">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EFfqeESL4yZDVjEkfvH7h6SuvdGKIk.png"
                  alt="Profile illustration"
                  width={600}
                  height={600}
                  className="w-full h-full"
                />
              </div>

              <Tabs defaultValue="general" className="relative z-10">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Card>
                    <CardContent className="pt-6">
                      <form className="space-y-6" onSubmit={updateProfile}>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={user.name}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                name: e.target.value,
                                initials: getInitials(e.target.value), // update initials setiap nama berubah
                              })
                            }
                            className="max-w-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="max-w-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full max-w-md rounded-md border border-gray-300 p-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avatar">Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 bg-green-600">
                              <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm">
                              Change
                            </Button>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardContent className="pt-6">
                      <form className="space-y-6" onSubmit={updatePassword}>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" className="max-w-md" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" className="max-w-md" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" className="max-w-md" />
                        </div>

                        <div className="pt-4">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardContent className="pt-6">
                      <form className="space-y-6" onSubmit={updateNotifications}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Email Notifications</h3>
                              <p className="text-sm text-gray-500">Receive email about meeting invitations</p>
                            </div>
                            <Switch checked={notifications.email} onCheckedChange={() => toggleNotification("email")} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Meeting Reminders</h3>
                              <p className="text-sm text-gray-500">Get notified before scheduled meetings</p>
                            </div>
                            <Switch
                              checked={notifications.reminders}
                              onCheckedChange={() => toggleNotification("reminders")}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Chat Notifications</h3>
                              <p className="text-sm text-gray-500">Receive notifications for new chat messages</p>
                            </div>
                            <Switch checked={notifications.chat} onCheckedChange={() => toggleNotification("chat")} />
                          </div>

                          <div className="pt-4">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Save Preferences
                            </Button>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
