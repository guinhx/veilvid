"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Video } from "@/lib/types"

interface UrlParamsHandlerProps {
  videos: Video[]
  onVideoSelect: (videoId: string) => void
  onSearch: (query: string) => void
}

export default function UrlParamsHandler({ videos, onVideoSelect, onSearch }: UrlParamsHandlerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.get('q')
    const videoId = searchParams.get('videoId')

    if (query) {
      onSearch(query)
    }

    if (videoId) {
      const videoIndex = videos.findIndex(v => v.id === videoId)
      if (videoIndex !== -1) {
        onVideoSelect(videoId)
      }
    }
  }, [searchParams, videos, onVideoSelect, onSearch])

  return null
} 