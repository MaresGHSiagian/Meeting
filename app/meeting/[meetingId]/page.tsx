"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMediaDevices } from "@/hooks/use-media-devices"
import { useChat } from "@/hooks/use-chat"
import { VideoGrid } from "@/components/meeting/video-grid"
import { ChatPanel } from "@/components/meeting/chat-panel"
import { ControlBar } from "@/components/meeting/control-bar"
import type { User } from "@/lib/types"
import { formatTime } from "@/lib/utils"
import { Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { setupPeerConnection } from "@/lib/webrtc"

export default function MeetingRoom() {
  const params = useParams()
  const router = useRouter()
  const meetingId = (params?.meetingId ?? "") as string
  const [username, setUsername] = useState("User")
  const [isClient, setIsClient] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [participants, setParticipants] = useState<User[]>([{ id: "self", name: "You", email: "", initials: "YO" }])
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map())
  const [linkCopied, setLinkCopied] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)

  const { stream, mediaStatus, toggleAudio, toggleVideo, startScreenShare, stopScreenShare, error } = useMediaDevices()

  const { messages, newMessage, setNewMessage, sendMessage, isChatOpen, toggleChat, unreadCount } = useChat(meetingId)

  const wsRef = useRef<WebSocket | null>(null)

  // Initialize timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Media Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error])

  // Load user data
  useEffect(() => {
    setIsClient(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUsername(user.name)
        setParticipants((prev) => [{ ...prev[0], name: user.name, initials: user.initials }])
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
  }, [])

  // --- SIGNALING LOGIC START ---
  useEffect(() => {
    if (!stream) return
    // Ganti URL berikut dengan signaling server Anda
    const ws = new WebSocket("wss://your-signaling-server?room=" + meetingId)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", username }))
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      // Handle user join
      if (data.type === "joined" && data.id !== wsRef.current?.url) {
        const peerId = data.id
        if (peerConnections.has(peerId)) return
        const pc = await setupPeerConnection(
          stream,
          (remoteStream) => {
            setRemoteStreams((prev) => {
              const map = new Map(prev)
              map.set(peerId, remoteStream)
              return map
            })
          },
          (signal) => ws.send(JSON.stringify({ ...signal, to: peerId, from: wsRef.current?.url })),
          (cb) => {
            ws.addEventListener("message", (e) => {
              const msg = JSON.parse(e.data)
              if (msg.from === peerId) cb(msg)
            })
          }
        )
        setPeerConnections((prev) => {
          const map = new Map(prev)
          map.set(peerId, pc)
          return map
        })
        // Kirim offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ws.send(JSON.stringify({ type: "offer", offer, to: peerId, from: wsRef.current?.url }))
      }
      // Handle offer/answer/candidate
      if (data.type === "offer" && data.to === wsRef.current?.url) {
        const peerId = data.from
        if (peerConnections.has(peerId)) return
        const pc = await setupPeerConnection(
          stream,
          (remoteStream) => {
            setRemoteStreams((prev) => {
              const map = new Map(prev)
              map.set(peerId, remoteStream)
              return map
            })
          },
          (signal) => ws.send(JSON.stringify({ ...signal, to: peerId, from: wsRef.current?.url })),
          (cb) => {
            ws.addEventListener("message", (e) => {
              const msg = JSON.parse(e.data)
              if (msg.from === peerId) cb(msg)
            })
          }
        )
        setPeerConnections((prev) => {
          const map = new Map(prev)
          map.set(peerId, pc)
          return map
        })
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        ws.send(JSON.stringify({ type: "answer", answer, to: peerId, from: wsRef.current?.url }))
      }
      if (data.type === "answer" && data.to === wsRef.current?.url) {
        const peerId = data.from
        const pc = peerConnections.get(peerId)
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
        }
      }
      if (data.type === "candidate" && data.to === wsRef.current?.url) {
        const peerId = data.from
        const pc = peerConnections.get(peerId)
        if (pc && data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch (e) {
            console.error("Error adding ICE candidate", e)
          }
        }
      }
    }

    ws.onclose = () => {
      peerConnections.forEach((pc) => pc.close())
      setPeerConnections(new Map())
      setRemoteStreams(new Map())
    }

    return () => {
      ws.close()
      peerConnections.forEach((pc) => pc.close())
      setPeerConnections(new Map())
      setRemoteStreams(new Map())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, meetingId, username])
  // --- SIGNALING LOGIC END ---

  const toggleScreenShare = async () => {
    if (mediaStatus.screen) {
      await stopScreenShare()
    } else {
      await startScreenShare()
    }
  }

  const endCall = () => {
    setShowEndModal(true)
  }

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`
    navigator.clipboard.writeText(link)
    setLinkCopied(true)
    toast({
      title: "Link copied",
      description: "Meeting link copied to clipboard",
    })

    setTimeout(() => setLinkCopied(false), 3000)
  }

  const handleSendMessage = (text: string, sender: string) => {
    sendMessage(text, sender)
  }

  const handleLeave = () => {
    setShowEndModal(false)
    router.push("/dashboard")
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex flex-col">
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-white font-medium break-all">Meeting: {meetingId}</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={copyMeetingLink}
          >
            {linkCopied ? (
              <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            <span className="hidden sm:inline">Copy link</span>
          </Button>
        </div>
        <div className="bg-black/50 text-white px-3 py-1 rounded-md text-center mt-2 md:mt-0">
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <VideoGrid
            localStream={stream}
            remoteStreams={remoteStreams}
            participants={participants}
            mediaStatus={mediaStatus}
            className="flex-1 min-h-[200px]"
          />
        </div>

        {isChatOpen && (
          <div className="w-full md:w-[350px] max-w-full md:max-w-xs flex-shrink-0 h-[350px] md:h-auto">
            <div className="flex flex-col h-full bg-white/10 rounded-lg overflow-hidden">
              <ChatPanel
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={handleSendMessage}
                username={username}
                onClose={toggleChat}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-2 md:p-4">
        <ControlBar
          mediaStatus={mediaStatus}
          toggleMic={toggleAudio}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          toggleChat={toggleChat}
          endCall={endCall}
          unreadMessages={unreadCount}
        />
      </div>

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Meeting Ended</h2>
            <p className="mb-4 text-gray-600">
              <span className="font-semibold">Meeting Duration:</span>{" "}
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              onClick={handleLeave}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
