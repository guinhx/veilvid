"use client"

import { useState, useRef, useEffect } from "react"
import VideoCard from "./video-card"
import UrlParamsHandler from "./url-params-handler"
import SettingsDialog from "./settings-dialog"
import type { Video } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { triggerDonationAlert } from "@/lib/events"
import { Loader2 } from "lucide-react"

interface VideoFeedProps {
  videos: Video[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  onSearch?: (query: string) => void
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
}

export default function VideoFeed({ 
  videos, 
  hasMore, 
  isLoadingMore, 
  onLoadMore, 
  onSearch,
  settingsOpen,
  onSettingsOpenChange
}: VideoFeedProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [videoPositions, setVideoPositions] = useState<number[]>(new Array(videos.length).fill(0))
  const [playbackRate, setPlaybackRate] = useState(1)
  const [autoHideEnabled, setAutoHideEnabled] = useState(false)
  const [autoHideDelay, setAutoHideDelay] = useState(3)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const touchEndY = useRef<number | null>(null)
  const isSwipeInProgress = useRef(false)
  const swipeCooldown = useRef(false)
  const swipeCount = useRef(0)
  const preloadedVideos = useRef<Set<number>>(new Set())
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls functionality
  const resetHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    if (autoHideEnabled) {
      setShowControls(true)
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, autoHideDelay * 1000)
    }
  }

  useEffect(() => {
    if (autoHideEnabled) {
      resetHideTimeout()
    } else {
      setShowControls(true)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [autoHideEnabled, autoHideDelay])

  const handleVideoSelect = (videoId: string) => {
    const index = videos.findIndex(v => v.id === videoId)
    if (index !== -1) {
      setActiveVideoIndex(index)
    }
  }

  useEffect(() => {
    if (hasMore && !isLoadingMore && activeVideoIndex >= videos.length - 2) {
      onLoadMore()
    }
  }, [activeVideoIndex, videos.length, hasMore, isLoadingMore, onLoadMore])

  // Preload adjacent videos (only cover images, not video playback)
  const preloadAdjacentVideos = (currentIndex: number) => {
    const indicesToPreload = [
      currentIndex - 1,
      currentIndex + 1,
      currentIndex - 2,
      currentIndex + 2
    ].filter(index => index >= 0 && index < videos.length)

    indicesToPreload.forEach(index => {
      if (!preloadedVideos.current.has(index)) {
        const image = new Image()
        image.src = videos[index].cover
        preloadedVideos.current.add(index)
      }
    })
  }

  useEffect(() => {
    preloadAdjacentVideos(activeVideoIndex)
  }, [videos, activeVideoIndex])

  const handleSwipe = (direction: "up" | "down") => {
    if (swipeCooldown.current) return

    swipeCooldown.current = true
    setTimeout(() => {
      swipeCooldown.current = false
    }, 300)

    swipeCount.current++
    if (swipeCount.current % 10 === 0) {
      triggerDonationAlert()
    }

    if (direction === "up" && activeVideoIndex < videos.length - 1) {
      setVideoPositions(prev => {
        const newPositions = [...prev]
        newPositions[activeVideoIndex] = 0
        return newPositions
      })
      setActiveVideoIndex(prev => prev + 1)
      preloadAdjacentVideos(activeVideoIndex + 1)
    } else if (direction === "down" && activeVideoIndex > 0) {
      setVideoPositions(prev => {
        const newPositions = [...prev]
        newPositions[activeVideoIndex] = 0
        return newPositions
      })
      setActiveVideoIndex(prev => prev - 1)
      preloadAdjacentVideos(activeVideoIndex - 1)
    }
  }

  useEffect(() => {
    setVideoPositions(new Array(videos.length).fill(0))
  }, [videos])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      isSwipeInProgress.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeInProgress.current) return
      e.preventDefault()
      touchEndY.current = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      if (!touchStartY.current || !touchEndY.current || !isSwipeInProgress.current) return

      const deltaY = touchEndY.current - touchStartY.current
      const minSwipeDistance = 50

      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          handleSwipe("down")
        } else {
          handleSwipe("up")
        }
      }

      touchStartY.current = null
      touchEndY.current = null
      isSwipeInProgress.current = false
    }

    const handleMouseDown = (e: MouseEvent) => {
      touchStartY.current = e.clientY
      isSwipeInProgress.current = true

      const handleMouseMove = (e: MouseEvent) => {
        if (!isSwipeInProgress.current) return
        e.preventDefault()
        touchEndY.current = e.clientY
      }

      const handleMouseUp = () => {
        handleTouchEnd()
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handleSwipe("down")
      } else if (e.key === "ArrowDown") {
        handleSwipe("up")
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [videos.length, activeVideoIndex])

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative overflow-hidden touch-none"
      onMouseMove={resetHideTimeout}
      onTouchStart={resetHideTimeout}
    >
      <UrlParamsHandler
        videos={videos}
        onVideoSelect={handleVideoSelect}
        onSearch={onSearch || (() => {})}
      />

      {videos.map((video, index) => {
        const shouldRender =
          index === activeVideoIndex ||
          index === activeVideoIndex - 1 ||
          index === activeVideoIndex + 1 ||
          preloadedVideos.current.has(index)

        if (!shouldRender) return null

        const transform = `translateY(${(index - activeVideoIndex) * 100}%)`

        return (
          <div
            key={video.id}
            className="fixed inset-0 w-full h-full transition-transform duration-300 ease-out"
            style={{
              transform,
              zIndex: index === activeVideoIndex ? 10 : 0,
            }}
          >
            <VideoCard
              video={video}
              isActive={index === activeVideoIndex}
              isMuted={isMuted}
              onMuteChange={setIsMuted}
              currentTime={videoPositions[index]}
              playbackRate={playbackRate}
              onPlaybackRateChange={setPlaybackRate}
              showControls={showControls}
            />
          </div>
        )
      })}

      {/* Loading more indicator */}
      {isLoadingMore && activeVideoIndex >= videos.length - 2 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 rounded-full px-4 py-2 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2 text-white" />
          <span className="text-white text-sm">Loading more videos...</span>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
        autoHideEnabled={autoHideEnabled}
        onAutoHideChange={setAutoHideEnabled}
        autoHideDelay={autoHideDelay}
        onAutoHideDelayChange={setAutoHideDelay}
      />

      {/* Navigation buttons - positioned on the right side, vertically centered */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 sm:gap-2 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {activeVideoIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-900/50 text-white h-8 w-8 sm:h-10 sm:w-10 pointer-events-auto"
            onClick={() => handleSwipe("down")}
            aria-label="Previous video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-up"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </Button>
        )}
        {activeVideoIndex < videos.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-900/50 text-white h-8 w-8 sm:h-10 sm:w-10 pointer-events-auto"
            onClick={() => handleSwipe("up")}
            aria-label="Next video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  )
}