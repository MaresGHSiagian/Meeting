// Enhanced WebRTC implementation
import type { MediaStatus } from "./types"

export async function initializeWebRTC(mediaStatus: MediaStatus) {
  try {
    const constraints = {
      video: mediaStatus.video,
      audio: mediaStatus.audio,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    return stream
  } catch (error) {
    console.error("Error accessing media devices:", error)
    throw error
  }
}

export async function setupPeerConnection(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
  // Create RTCPeerConnection with STUN/TURN servers for NAT traversal
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  }

  const peerConnection = new RTCPeerConnection(configuration)

  // Add local stream to peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })

  // Set up event handlers for remote stream
  peerConnection.ontrack = (event) => {
    onRemoteStream(event.streams[0])
  }

  // ICE candidate handling
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // In a real app, send this to the signaling server
      console.log("New ICE candidate:", event.candidate)
    }
  }

  // Connection state monitoring
  peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState)
  }

  return peerConnection
}

export async function createOffer(peerConnection: RTCPeerConnection) {
  try {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  } catch (error) {
    console.error("Error creating offer:", error)
    throw error
  }
}

export async function createAnswer(peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  } catch (error) {
    console.error("Error creating answer:", error)
    throw error
  }
}

export async function startScreenSharing() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
      },
      audio: true,
    })
    return screenStream
  } catch (error) {
    console.error("Error starting screen sharing:", error)
    throw error
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
}
