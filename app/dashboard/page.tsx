"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateMeetingId } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Plus, Video, Users } from "lucide-react"
import type { User } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ScheduleMeetingDialog from "@/components/schedule-meeting-dialog"
import ContactsDialog from "@/components/contacts-dialog"

export default function Dashboard() {
  const router = useRouter()
  const [meetingCode, setMeetingCode] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [recentMeetings, setRecentMeetings] = useState<string[]>([])
  const [scheduledMeetings, setScheduledMeetings] = useState<{ id: string, title: string, date: string }[]>([])
  const [contacts, setContacts] = useState<{ name: string; email: string }[]>([])
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showContactsDialog, setShowContactsDialog] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // Fungsi untuk generate inisial dari nama/email
  function getInitials(nameOrEmail: string) {
    if (!nameOrEmail) return ""
    // Jika nama ada spasi, ambil huruf depan tiap kata
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

  // Load user data and recent meetings from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Selalu generate initials dari nama/email yang login
        parsedUser.initials = getInitials(parsedUser.name || parsedUser.email || "")
        setUser(parsedUser)
      } catch (error) {
        console.error("Error loading user data:", error)
        setUser(null)
      }
    } else {
      // Jika tidak ada user, redirect ke login
      window.location.href = "/login"
    }

    const storedMeetings = localStorage.getItem("recentMeetings")
    if (storedMeetings) {
      try {
        setRecentMeetings(JSON.parse(storedMeetings))
      } catch (error) {
        console.error("Error loading recent meetings:", error)
      }
    }

    const storedScheduled = localStorage.getItem("scheduledMeetings")
    if (storedScheduled) {
      try {
        setScheduledMeetings(JSON.parse(storedScheduled))
      } catch (error) {
        console.error("Error loading scheduled meetings:", error)
      }
    }

    const storedContacts = localStorage.getItem("contacts")
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts))
      } catch (error) {
        console.error("Error loading contacts:", error)
      }
    }
  }, [])

  const createNewMeeting = () => {
    const meetingId = generateMeetingId()

    // Save to recent meetings
    const updatedMeetings = [meetingId, ...recentMeetings.slice(0, 4)]
    setRecentMeetings(updatedMeetings)
    localStorage.setItem("recentMeetings", JSON.stringify(updatedMeetings))

    router.push(`/meeting/${meetingId}`)
  }

  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (meetingCode.trim()) {
      // Save to recent meetings
      const updatedMeetings = [meetingCode, ...recentMeetings.filter((m) => m !== meetingCode).slice(0, 4)]
      setRecentMeetings(updatedMeetings)
      localStorage.setItem("recentMeetings", JSON.stringify(updatedMeetings))

      router.push(`/meeting/${meetingCode}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    // Jika ingin hapus data lain, tambahkan di sini
    window.location.href = "/login"
  }

  const handleScheduleMeeting = (meeting: { id: string, title: string, date: string }) => {
    const updated = [meeting, ...scheduledMeetings].slice(0, 10)
    setScheduledMeetings(updated)
    localStorage.setItem("scheduledMeetings", JSON.stringify(updated))
  }

  const handleCopyMeetingLink = (id: string) => {
    const url = `${window.location.origin}/meeting/${id}`
    navigator.clipboard.writeText(url)
    setCopySuccess("Link berhasil dicopy!")
    setTimeout(() => setCopySuccess(null), 2000)
  }

  const handleDeleteRecentMeeting = (meetingId: string) => {
    const updated = recentMeetings.filter((id) => id !== meetingId)
    setRecentMeetings(updated)
    localStorage.setItem("recentMeetings", JSON.stringify(updated))
  }

  const handleAddContact = (contact: { name: string; email: string }) => {
    const updated = [contact, ...contacts].slice(0, 20)
    setContacts(updated)
    localStorage.setItem("contacts", JSON.stringify(updated))
  }

  const handleDeleteContact = (email: string) => {
    const updated = contacts.filter((c) => c.email !== email)
    setContacts(updated)
    localStorage.setItem("contacts", JSON.stringify(updated))
  }

  const handleDeleteScheduledMeeting = (meetingId: string) => {
    const updated = scheduledMeetings.filter((m) => m.id !== meetingId)
    setScheduledMeetings(updated)
    localStorage.setItem("scheduledMeetings", JSON.stringify(updated))
  }

  // Jangan render dashboard jika user belum ter-load
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600">
      <header className="p-4 flex justify-between items-center bg-white/10 backdrop-blur-md">
        <h1 className="text-xl font-bold text-white">Virtual Meeting</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white border-white/20 hover:bg-white/10 flex items-center gap-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-green-700 text-xs">{user.initials}</AvatarFallback>
                </Avatar>
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl text-white">
              <CardHeader>
                <CardTitle className="text-3xl">Start or join a meeting</CardTitle>
                <CardDescription className="text-white/80">
                  Connect with anyone, anywhere with high-quality video meetings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={createNewMeeting}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    size="lg"
                  >
                    <Video className="h-5 w-5" />
                    New Meeting
                  </Button>
                  <form onSubmit={joinMeeting} className="flex gap-2 flex-1">
                    <Input
                      type="text"
                      placeholder="Enter meeting code"
                      value={meetingCode}
                      onChange={(e) => setMeetingCode(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 flex-1"
                    />
                    <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white">
                      Join
                    </Button>
                  </form>
                </div>

                {recentMeetings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent meetings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentMeetings.map((meeting) => (
                        <div key={meeting} className="flex items-center">
                          <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start flex-1"
                            onClick={() => router.push(`/meeting/${meeting}`)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {meeting}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2"
                            title="Hapus"
                            onClick={() => handleDeleteRecentMeeting(meeting)}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                              <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Scheduled Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Pesan berhasil dicopy */}
                  {copySuccess && (
                    <div className="mb-2 text-green-200 text-sm font-medium">{copySuccess}</div>
                  )}
                  {scheduledMeetings.length === 0 ? (
                    <p className="text-white/80">No upcoming meetings</p>
                  ) : (
                    <ul className="space-y-2">
                      {scheduledMeetings.map((m) => (
                        <li key={m.id} className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <button
                            className="font-medium underline hover:text-green-200 transition"
                            onClick={() => router.push(`/meeting/${m.id}`)}
                            type="button"
                          >
                            {m.title}
                          </button>
                          <span className="text-xs text-white/60 ml-auto">{m.date}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2"
                            title="Delete Meeting"
                            onClick={() => handleDeleteScheduledMeeting(m.id)}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                              <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2"
                            title="Copy meeting link"
                            onClick={() => handleCopyMeetingLink(m.id)}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                              <rect x="5" y="5" width="8" height="8" rx="2" stroke="currentColor" />
                              <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" opacity="0.5" />
                            </svg>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule a Meeting
                  </Button>
                  <ScheduleMeetingDialog
                    open={showScheduleDialog}
                    onOpenChange={setShowScheduleDialog}
                    onSchedule={handleScheduleMeeting}
                    onDelete={handleDeleteScheduledMeeting}
                    scheduledMeetings={scheduledMeetings}
                  />
                </CardFooter>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.length === 0 ? (
                    <p className="text-white/80">Add contacts to quickly start meetings</p>
                  ) : (
                    <ul className="space-y-2">
                      {contacts.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 bg-white/10 rounded px-3 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-700 text-xs">
                              {c.name
                                .split(" ")
                                .map((n) => n[0]?.toUpperCase())
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-white/60">{c.email}</div>
                          </div>
                          <Button
                            size="sm"
                            className="ml-auto bg-green-600 hover:bg-green-700 text-xs"
                            onClick={() => router.push(`/meeting/${generateMeetingId()}`)}
                          >
                            Start Meeting
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2"
                            title="Delete Contact"
                            onClick={() => handleDeleteContact(c.email)}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                              <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                              <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setShowContactsDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contacts
                  </Button>
                  <ContactsDialog
                    open={showContactsDialog}
                    onOpenChange={setShowContactsDialog}
                    onAddContact={handleAddContact}
                  />
                </CardFooter>
              </Card>
            </div>
          </div>

          <div>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl text-white h-full">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-green-700 text-2xl">{user.initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-white/80">{user.email}</p>

                <div className="w-full mt-6 space-y-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <h3 className="font-medium mb-1">Personal Meeting ID</h3>
                    <p className="text-sm text-white/80">meet-{user.id}-personal</p>
                  </div>

                  <Link href="/profile">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Edit Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
