"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Message } from "@/lib/types"
import { X, Send } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ChatPanelProps {
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  sendMessage: (text: string, sender: string) => void
  username: string
  onClose: () => void
}

export function ChatPanel({ messages, newMessage, setNewMessage, sendMessage, username, onClose }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessage(newMessage, username)
    }
  }

  return (
    <div
      className={`flex flex-col h-full max-h-[550px] md:max-h-[500px] overflow-hidden bg-white rounded-lg`}
    >
      <div className="p-3 bg-gray-100 flex justify-between items-center border-b">
        <h3 className="font-medium">Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet...</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`mb-3 ${message.sender === username ? "text-right" : ""}`}>
              <div className="font-medium text-xs text-gray-600">
                {message.sender === username ? "You" : message.sender}
              </div>
              <div
                className={`inline-block p-2 rounded-lg shadow-sm max-w-[85%] break-words ${
                  message.sender === username ? "bg-green-100 text-left" : "bg-white"
                }`}
              >
                {message.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">{formatDate(message.timestamp)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t flex">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="ml-2 bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
