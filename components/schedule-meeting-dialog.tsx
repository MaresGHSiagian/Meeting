import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateMeetingId } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (meeting: { id: string, title: string, date: string }) => void
  onDelete?: (meetingId: string) => void
  scheduledMeetings?: { id: string, title: string, date: string }[]
}

export default function ScheduleMeetingDialog({ open, onOpenChange, onSchedule, onDelete, scheduledMeetings }: Props) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return
    onSchedule({ id: generateMeetingId(), title, date })
    setTitle("")
    setDate("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Meeting Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
        {/* Tampilkan daftar meeting terjadwal dan tombol hapus jika ada prop onDelete */}
        {onDelete && scheduledMeetings && scheduledMeetings.length > 0 && (
          <div className="mt-6">
            <div className="font-semibold mb-2">Scheduled Meetings</div>
            <ul className="space-y-2 max-h-40 overflow-auto">
              {scheduledMeetings.map((m) => (
                <li key={m.id} className="flex items-center gap-2 bg-white/10 rounded px-3 py-2">
                  <span className="flex-1">{m.title} <span className="text-xs text-gray-400 ml-2">{m.date}</span></span>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Delete"
                    onClick={() => onDelete(m.id)}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
