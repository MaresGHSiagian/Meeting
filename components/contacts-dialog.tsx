import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddContact: (contact: { name: string; email: string }) => void
}

export default function ContactsDialog({ open, onOpenChange, onAddContact }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid")
      return
    }
    onAddContact({ name, email })
    setName("")
    setEmail("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type="email"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
