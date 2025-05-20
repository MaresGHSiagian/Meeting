"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaStatus } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ControlBarProps {
  mediaStatus: MediaStatus
  toggleMic: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  toggleChat: () => void
  endCall: () => void
  unreadMessages: number
  className?: string
}

export function ControlBar({
  mediaStatus,
  toggleMic,
  toggleVideo,
  toggleScreenShare,
  toggleChat,
  endCall,
  unreadMessages,
  className,
}: ControlBarProps) {
  return (
    <TooltipProvider>
      <div className={cn("flex justify-center", className)}>
        <div className="flex space-x-2 md:space-x-4 bg-black/50 p-2 rounded-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMic}
                className={cn(
                  "rounded-full",
                  mediaStatus.audio
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700 opacity-70"
                )}
                aria-label={mediaStatus.audio ? "Mute microphone" : "Unmute microphone"}
              >
                {mediaStatus.audio ? (
                  <Mic className="h-5 w-5 text-white" />
                ) : (
                  <MicOff className="h-5 w-5 text-white" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{mediaStatus.audio ? "Mute microphone" : "Unmute microphone"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className={cn(
                  "rounded-full",
                  mediaStatus.video
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700 opacity-70"
                )}
                aria-label={mediaStatus.video ? "Turn off camera" : "Turn on camera"}
              >
                {mediaStatus.video ? (
                  <Video className="h-5 w-5 text-white" />
                ) : (
                  <VideoOff className="h-5 w-5 text-white" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{mediaStatus.video ? "Turn off camera" : "Turn on camera"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleScreenShare}
                className={cn(
                  "rounded-full",
                  mediaStatus.screen ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600",
                )}
              >
                <Monitor className="h-5 w-5 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{mediaStatus.screen ? "Stop sharing screen" : "Share screen"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="rounded-full bg-gray-700 hover:bg-gray-600 relative"
              >
                <MessageSquare className="h-5 w-5 text-white" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open chat</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={endCall}
                className="rounded-full bg-red-600 hover:bg-red-700"
              >
                <Phone className="h-5 w-5 text-white transform rotate-135" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End call</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Tidak ada logic kamera di ControlBar, namun masalah kamera gelap/kedip biasanya disebabkan oleh:
// 1. Stream video di-stop dan di-restart berulang (misal, useEffect atau state yang menyebabkan getUserMedia dipanggil terus-menerus).
// 2. Constraints getUserMedia salah atau berubah-ubah terlalu sering.
// 3. Komponen video (<video>) tidak konsisten menerima stream (srcObject sering null/set ulang).
// 4. Track video pada MediaStream di-disable atau di-stop secara tidak sengaja.

// **Langkah troubleshooting di luar file ini:**
// - Pastikan hook useMediaDevices TIDAK memanggil getUserMedia/stopMediaStream berulang tanpa alasan (cek dependency array useEffect).
// - Pastikan toggleVideo hanya meng-enable/disable track, BUKAN memulai/stop stream baru setiap klik.
// - Di komponen VideoStream, pastikan srcObject hanya di-set saat stream berubah, dan di-clear saat stream null.

// Contoh toggleVideo yang benar di use-media-devices.ts:
// setMediaStatus((prev) => ({ ...prev, video: !prev.video }));
// if (stream) {
//   stream.getVideoTracks().forEach((track) => {
//     track.enabled = !mediaStatus.video;
//   });
// }

// Jangan panggil getUserMedia ulang setiap kali toggleVideo, cukup enable/disable track saja.

// Jika masih gelap/kedip, cek error di console browser dan pastikan permission kamera diberikan.

// Tidak perlu perubahan pada file ini.

// Untuk komponen ini, pastikan dependencies berikut sudah terinstall:
// 1. lucide-react (untuk ikon)
//    npm install lucide-react
// 2. shadcn/ui atau @radix-ui/react-tooltip (untuk Tooltip, TooltipProvider, dst)
//    npm install @radix-ui/react-tooltip
//    (atau gunakan shadcn/ui sesuai dokumentasi shadcn)
// 3. tailwindcss (untuk utility class seperti bg-green-600, rounded-full, dll)
//    npm install tailwindcss

// Pastikan juga semua komponen custom (Button, Tooltip, TooltipProvider, TooltipTrigger, TooltipContent) sudah ada di folder components/ui.

// Tidak perlu perubahan kode pada file ini jika semua di atas sudah tersedia.
