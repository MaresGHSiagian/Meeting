"use client"

import { useState, useEffect, useCallback } from "react"
import type { MediaStatus } from "@/lib/types"
import { stopMediaStream } from "@/lib/webrtc"

export function useMediaDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>({
    video: false, // sebelumnya true
    audio: false, // sebelumnya true
    screen: false,
  })
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("")
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("")
  const [error, setError] = useState<Error | null>(null)

  // Tambahkan state untuk menyimpan status sebelum screen share
  const [prevMediaStatus, setPrevMediaStatus] = useState<MediaStatus | null>(null)

  // Get available media devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setDevices(devices)

      // Set default devices if not already set
      const audioInputs = devices.filter((device) => device.kind === "audioinput")
      const videoInputs = devices.filter((device) => device.kind === "videoinput")

      if (audioInputs.length > 0 && !selectedAudioInput) {
        setSelectedAudioInput(audioInputs[0].deviceId)
      }

      if (videoInputs.length > 0 && !selectedVideoInput) {
        setSelectedVideoInput(videoInputs[0].deviceId)
      }
    } catch (err) {
      console.error("Error getting media devices:", err)
      setError(err instanceof Error ? err : new Error("Failed to get media devices"))
    }
  }, [selectedAudioInput, selectedVideoInput])

  // Initialize media stream
  const initializeStream = useCallback(async () => {
    try {
      if (stream) {
        stopMediaStream(stream)
      }

      const constraints: MediaStreamConstraints = {
        audio: mediaStatus.audio ? { deviceId: selectedAudioInput || undefined } : false,
        video: mediaStatus.video
          ? {
              deviceId: selectedVideoInput || undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
      }

      // Cegah error jika audio dan video keduanya false
      if (
        (!mediaStatus.audio && !mediaStatus.video) ||
        (constraints.audio === false && constraints.video === false)
      ) {
        setStream(null)
        setError(null)
        return null
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      setError(null)
      return newStream
    } catch (err) {
      console.error("Error initializing media stream:", err)
      setError(err instanceof Error ? err : new Error("Failed to initialize media stream"))
      return null
    }
  // Hapus 'stream' dari dependency agar tidak loop
  }, [mediaStatus.audio, mediaStatus.video, selectedAudioInput, selectedVideoInput])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setMediaStatus((prev) => ({ ...prev, audio: !prev.audio }))
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !mediaStatus.audio
      })
    }
  }, [stream, mediaStatus.audio])

  // Toggle video
  const toggleVideo = useCallback(() => {
    setMediaStatus((prev) => ({ ...prev, video: !prev.video }))
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !mediaStatus.video
      })
    }
  }, [stream, mediaStatus.video])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      // Simpan status media sebelum screen share ke variabel lokal
      const currentStatus = { ...mediaStatus }
      setPrevMediaStatus(currentStatus)

      // Hanya stop video tracks, biarkan audio tetap berjalan jika ON
      if (stream) {
        stream.getVideoTracks().forEach((track) => track.stop())
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      let finalStream = screenStream
      if (currentStatus.audio) {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        micStream.getAudioTracks().forEach((track) => {
          finalStream.addTrack(track)
        })
      }

      setStream(finalStream)
      setMediaStatus((prev) => ({ ...prev, screen: true }))
      setError(null)
      return finalStream
    } catch (err) {
      console.error("Error starting screen share:", err)
      setError(err instanceof Error ? err : new Error("Failed to start screen sharing"))
      if (!mediaStatus.screen) {
        initializeStream()
      }
      return null
    }
  }, [stream, mediaStatus, initializeStream])

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (stream && mediaStatus.screen) {
      stopMediaStream(stream)
      // Ambil status sebelum screen share dari prevMediaStatus
      const restoreStatus = prevMediaStatus
        ? { ...prevMediaStatus, screen: false }
        : { ...mediaStatus, screen: false }
      setMediaStatus(restoreStatus)
      // Tunggu status terupdate sebelum inisialisasi ulang stream
      setTimeout(() => {
        initializeStream()
      }, 0)
      return null
    }
    return null
  }, [stream, mediaStatus, prevMediaStatus, initializeStream])

  // Cleanup on unmount
  useEffect(() => {
    getDevices()
    return () => {
      if (stream) {
        stopMediaStream(stream)
      }
    }
  // Hapus 'stream' dari dependency agar tidak loop
  }, [getDevices])

  // Initialize stream when media status or device selection changes (kecuali screen)
  useEffect(() => {
    if (!mediaStatus.screen) {
      initializeStream()
    }
  }, [
    mediaStatus.audio,
    mediaStatus.video,
    selectedAudioInput,
    selectedVideoInput,
    initializeStream,
    mediaStatus.screen,
  ])

  return {
    stream,
    mediaStatus,
    devices,
    selectedAudioInput,
    selectedVideoInput,
    setSelectedAudioInput,
    setSelectedVideoInput,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    error,
  }
}
