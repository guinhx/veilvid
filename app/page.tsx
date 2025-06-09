"use client"

import type React from "react"
import { useState, useEffect } from "react"
import VideoFeed from "@/components/video-feed"
import { fetchUserVideos, loadMoreVideos } from "@/lib/api"
import type { Video } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"

export default function TikTokClone() {
  const searchParams = useSearchParams()
  const [username, setUsername] = useState(searchParams.get("q") || "")
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [autoHideEnabled, setAutoHideEnabled] = useState(false)
  const [autoHideDelay, setAutoHideDelay] = useState(3)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Load videos when URL has a search query
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      handleSearchWithQuery(query)
    }
  }, [searchParams])

  const handleSearchWithQuery = async (query: string) => {
    if (!query.trim()) return

    // Format username (remove @ if present)
    const formattedUsername = query.startsWith("@") ? query : `@${query}`

    setUsername(formattedUsername)
    setIsLoading(true)
    setError(null)
    setCursor(null)
    setHasMore(false)

    try {
      const result = await fetchUserVideos(formattedUsername)
      if (result.videos && result.videos.length > 0) {
        setVideos(result.videos)
        setCursor(result.cursor)
        setHasMore(result.hasMore)
      } else {
        setError("No videos found for this username")
        setVideos([])
      }
    } catch (err) {
      console.error("Error fetching videos:", err)
      setError("Failed to load videos. Please try again.")
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLoadMore = async () => {
    if (!username || !cursor || !hasMore || isLoadingMore) return

    setIsLoadingMore(true)

    try {
      const result = await loadMoreVideos(cursor, "")
      if (result.videos && result.videos.length > 0) {
        setVideos((prevVideos) => [...prevVideos, ...result.videos])
        setCursor(result.cursor)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("Error loading more videos:", err)
      // Don't show error for loading more, just stop trying
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const loadVideos = async (query: string) => {
    try {
      const response = await fetchUserVideos(query)
      setVideos(response.videos)
      setHasMore(response.hasMore)
      setCursor(response.cursor)
    } catch (error) {
      console.error("Error loading videos:", error)
    }
  }

  const handleSearch = async (query: string) => {
    await loadVideos(query)
  }

  // Prevent body scrolling
  useEffect(() => {
    // Save original overflow styles
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Disable scrolling
    document.body.style.overflow = "hidden"

    // Re-enable scrolling on cleanup
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <Navbar 
        initialSearchQuery={searchParams.get("q") || ""}
        onSearch={handleSearch}
        autoHideEnabled={autoHideEnabled}
        onAutoHideChange={setAutoHideEnabled}
        autoHideDelay={autoHideDelay}
        onAutoHideDelayChange={setAutoHideDelay}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
      />

      {/* Content area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading videos...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-gray-400">Try searching for another username</p>
            </div>
          </div>
        ) : videos.length > 0 ? (
          <VideoFeed videos={videos} hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={handleLoadMore} onSearch={handleSearch} settingsOpen={settingsOpen} onSettingsOpenChange={setSettingsOpen} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center p-4">
              <p className="text-xl mb-2">Search for TikTok videos</p>
              <p className="text-gray-400">Enter a username to see their videos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
