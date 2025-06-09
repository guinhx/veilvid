"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share2, Music, Play, Volume2, VolumeX, Download, PictureInPicture } from "lucide-react"
import type { Video } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useIsMobile } from "./ui/use-mobile"

interface VideoCardProps {
  video: Video
  isActive: boolean
  isMuted: boolean
  onMuteChange: (muted: boolean) => void
  currentTime?: number
  playbackRate?: number
  onPlaybackRateChange?: (rate: number) => void
  showControls?: boolean
}

export default function VideoCard({
  video,
  isActive,
  isMuted,
  onMuteChange,
  currentTime = 0,
  playbackRate = 1,
  onPlaybackRateChange,
  showControls = true
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playbackRateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
  
    if (isActive) {
      video.currentTime = currentTime
      video.playbackRate = playbackRate
      video.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    } else {
      video.pause()
      video.currentTime = currentTime
      setIsPlaying(false)
    }
  }, [isActive, currentTime])
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
  
    video.muted = isMuted
  }, [isMuted])
  
  useEffect(() => {
    if (videoRef.current && isActive) {
      const video = videoRef.current
      const currentTimeBefore = video.currentTime
      const isPlayingBefore = !video.paused

      if (playbackRateTimeoutRef.current) {
        clearTimeout(playbackRateTimeoutRef.current)
      }

      playbackRateTimeoutRef.current = setTimeout(() => {
        video.playbackRate = playbackRate
        if (Math.abs(video.currentTime - currentTimeBefore) > 0.1) {
          video.currentTime = currentTimeBefore
        }
        if (isPlayingBefore && video.paused) {
          video.play().catch(() => {
            setIsPlaying(false)
          })
        }
      }, 50)
    }

    return () => {
      if (playbackRateTimeoutRef.current) {
        clearTimeout(playbackRateTimeoutRef.current)
      }
    }
  }, [playbackRate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlayPause = () => {
    if (!videoRef.current || !isActive) return

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current && isActive) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      onMuteChange(newMutedState)
    }
  }

  const handleVideoLoaded = () => {
    setIsLoading(false)
  }

  const handleDownload = async () => {
    if (!video.videoUrl) return

    try {
      setIsDownloading(true)
      setDownloadProgress(0)

      const response = await fetch(video.videoUrl)

      if (!response.ok) throw new Error("Download failed")

      const contentLength = response.headers.get("content-length")
      const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Unable to read response")

      let receivedBytes = 0
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        chunks.push(value)
        receivedBytes += value.length

        if (totalBytes) {
          setDownloadProgress(Math.round((receivedBytes / totalBytes) * 100))
        }
      }

      const allChunks = new Uint8Array(receivedBytes)
      let position = 0

      for (const chunk of chunks) {
        allChunks.set(chunk, position)
        position += chunk.length
      }

      const blob = new Blob([allChunks], { type: "video/mp4" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${video.author?.nickname || "video"}-${video.id}.mp4`
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadProgress(100)
      setTimeout(() => {
        setIsDownloading(false)
        setDownloadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error downloading video:", error)
      setIsDownloading(false)
      setDownloadProgress(0)
      toast.error("Failed to download video. Please try again.", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: "14px",
          padding: "10px 20px",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 0, 0, 0.1)",
        },
      })
    }
  }

  const handlePlaybackRateChange = () => {
    if (!onPlaybackRateChange || !isActive) return

    const rates = [1, 1.5, 2, 0.5]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    onPlaybackRateChange(rates[nextIndex])
  }

  const enterPictureInPicture = async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await videoRef.current.requestPictureInPicture()
        }
      } else {
        toast.error("Picture-in-Picture is not supported in your browser", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: "14px",
            padding: "10px 20px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 0, 0, 0.1)",
          },
        })
      }
    } catch (error) {
      console.error("Error toggling picture-in-picture:", error)
      toast.error("Failed to enter picture-in-picture mode", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: "14px",
          padding: "10px 20px",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 0, 0, 0.1)",
        },
      })
    }
  }

  const handleShare = async () => {
    const currentUrl = new URL(window.location.href)
    const username = video.author?.unique_id || video.author?.nickname || "user"
  
    currentUrl.searchParams.set("q", username)
    currentUrl.searchParams.set("videoId", video.id)
  
    const shareLink = currentUrl.toString()
  
    const toastStyle = {
      background: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(8px)",
      color: "#fff",
      fontSize: "14px",
      padding: "10px 20px",
      borderRadius: "6px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }
  
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink)
        toast.success("Link copied to clipboard!", {
          duration: 2000,
          position: "top-center",
          style: {
            ...toastStyle,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          },
        })
      } else if (navigator.share) {
        await navigator.share({ title: document.title, url: shareLink })
      } else {
        throw new Error("Clipboard not supported in this browser")
      }
    } catch (err) {
      prompt("Your browser/device doesn't support automatic sharing.\n\nPlease copy the link below manually:", shareLink)
      toast.error("Could not automatically copy the link.", {
        duration: 2000,
        position: "top-center",
        style: {
          ...toastStyle,
          border: "1px solid rgba(255, 0, 0, 0.1)",
        },
      })
    }
  }

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      )}

      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.cover}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-full object-contain aspect-[9/16]"
        onClick={togglePlayPause}
        onLoadedData={handleVideoLoaded}
        onError={() => console.error("Video failed to load:", video.videoUrl)}
      />

      <div className={`absolute top-16 right-4 z-50 flex flex-col gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-900/50 text-white h-11 w-11"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          disabled={!isActive}
        >
          {isMuted ? <VolumeX className="h-5.5 w-5.5" /> : <Volume2 className="h-5.5 w-5.5" />}
        </Button>

        {onPlaybackRateChange && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-900/50 text-white h-11 w-11"
            onClick={handlePlaybackRateChange}
            aria-label={`Speed ${playbackRate}x`}
            disabled={!isActive}
          >
            <span className="text-sm font-bold">{playbackRate}x</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-900/50 text-white h-11 w-11"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download video"
        >
          {isDownloading ? (
            <div className="relative h-5.5 w-5.5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-gray-500"></div>
              <div
                className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(downloadProgress * 0.02 * Math.PI)}% ${50 - 50 * Math.cos(downloadProgress * 0.02 * Math.PI)}%, 50% 50%)`,
                  transform: `rotate(${downloadProgress * 3.6}deg)`,
                }}
              ></div>
              <span className="text-xs font-bold">{downloadProgress}%</span>
            </div>
          ) : (
            <Download className="h-5.5 w-5.5" />
          )}
        </Button>
        { !isMobile && (
          <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-900/50 text-white h-11 w-11"
          onClick={enterPictureInPicture}
          aria-label="Picture-in-Picture"
        >
          <PictureInPicture className="h-5.5 w-5.5" />
        </Button>
        )}
      </div>

      {!isPlaying && !isLoading && isActive && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-20 w-20 rounded-full bg-black/30 text-white"
          >
            <Play className="h-10 w-10" />
          </Button>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 p-4 text-white w-full transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start">
          <div className="flex-1 pr-16">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={video.avatar || "/placeholder.svg"} alt={video.author?.nickname || "User"} />
                <AvatarFallback>{(video.author?.nickname || "User").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-bold">@{video.author?.unique_id || video.author?.nickname || "user"}</span>
            </div>
            <p className="text-sm mb-2">{video.title || "No caption"}</p>
            <div className="flex items-center gap-2 text-sm">
              <Music className="h-4 w-4" />
              <span>{video.music_info?.title || "Original sound"}</span>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 flex flex-col gap-3 sm:gap-4 items-center">
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-900/50 text-white h-11 w-11">
                <Heart className="h-5.5 w-5.5" />
              </Button>
              <span className="text-xs mt-1">{video.digg_count || 0}</span>
            </div>

            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-900/50 text-white h-11 w-11">
                <MessageCircle className="h-5.5 w-5.5" />
              </Button>
              <span className="text-xs mt-1">{video.comment_count || 0}</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-900/50 text-white h-11 w-11"
                onClick={handleShare}
              >
                <Share2 className="h-5.5 w-5.5" />
              </Button>
              <span className="text-xs mt-1">{video.share_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}