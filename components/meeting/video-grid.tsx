"use client"

import { useRef, useEffect } from "react"
import type { User } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  participants: User[]
  mediaStatus: { video: boolean; audio: boolean; screen: boolean }
  className?: string
}

export function VideoGrid({ localStream, remoteStreams, participants, mediaStatus, className }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map())

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote videos
  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoElement = remoteVideoRefs.current.get(userId)
      if (videoElement && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream
      }
    })
  }, [remoteStreams])

  // Calculate grid layout
  const totalParticipants = participants.length
  const gridClass = cn(
    "grid gap-4",
    totalParticipants === 1 && "grid-cols-1",
    totalParticipants === 2 && "grid-cols-2",
    totalParticipants > 2 && totalParticipants <= 4 && "grid-cols-2",
    totalParticipants > 4 && "grid-cols-3",
    className,
  )

  return (
    <div className={gridClass}>
      {/* Local participant */}
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
        {!mediaStatus.video ? (
          <div className="w-full h-full flex items-center justify-center">
            <UserAvatar
              name={participants[0]?.name || "You"}
              initials={participants[0]?.initials || "ME"}
              size="lg"
            />
          </div>
        ) : (
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
          You {!mediaStatus.audio && "(Muted)"}
        </div>
      </div>

      {/* Remote participants */}
      {Array.from(remoteStreams).map(([userId, _], index) => {
        const participant = participants.find((p) => p.id === userId) || {
          id: userId,
          name: `User ${index + 1}`,
          initials: "U",
          email: "",
        }

        return (
          <div key={userId} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={(el) => {
                remoteVideoRefs.current.set(userId, el)
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
              {participant.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
