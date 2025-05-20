"use client"

import { useState, useCallback, useEffect } from "react"
import type { Message } from "@/lib/types"

export function useChat(meetingId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false) // default: chat tertutup
  const [newMessage, setNewMessage] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  // Send a message
  const sendMessage = useCallback((text: string, sender: string) => {
    if (!text.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // In a real app, you would send this to a backend or through WebRTC data channel
    console.log("Message sent:", message)

    return message
  }, [])

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev)
    if (!isChatOpen) {
      setUnreadCount(0) // Reset unread count when opening chat
    }
  }, [isChatOpen])

  // Handle receiving a message
  const receiveMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message])

      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    },
    [isChatOpen],
  )

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${meetingId}`)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        console.error("Error loading chat history:", error)
      }
    }
  }, [meetingId])

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${meetingId}`, JSON.stringify(messages))
    }
  }, [messages, meetingId])

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isChatOpen,
    toggleChat,
    receiveMessage,
    unreadCount,
  }
}
