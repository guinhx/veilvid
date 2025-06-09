import type { TikwmApiResponse, Video } from "./types"

// Base URL for the TikWm API
const TIKWM_BASE_URL = "https://tikwm.com"

// Function to fetch user videos from TikWm API
export async function fetchUserVideos(
  username: string,
): Promise<{ videos: Video[]; cursor: string; hasMore: boolean }> {
  try {
    // Remove @ if it exists at the beginning
    const formattedUsername = username.startsWith("@") ? username : `@${username}`

    const response = await fetch("/api/tiktok-videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formattedUsername,
        cursor: "0",
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: TikwmApiResponse = await response.json()

    if (data.code !== 0) {
      throw new Error(data.msg || "Failed to fetch videos")
    }

    const processedVideos = data.data.videos.map((video) => ({
      id: video.id || video.video_id,
      title: video.title || "",
      cover: video.cover.startsWith("/") ? `${TIKWM_BASE_URL}${video.cover}` : video.cover,
      videoUrl: video.play.startsWith("/") ? `${TIKWM_BASE_URL}${video.play}` : video.play,
      avatar: video.author?.avatar?.startsWith("/")
        ? `${TIKWM_BASE_URL}${video.author.avatar}`
        : video.author?.avatar || "",
      author: video.author,
      music_info: video.music_info,
      digg_count: video.digg_count || 0,
      comment_count: video.comment_count || 0,
      share_count: video.share_count || 0,
    }))

    return {
      videos: processedVideos,
      cursor: data.data.cursor,
      hasMore: data.data.hasMore,
    }
  } catch (error) {
    console.error("Error fetching TikTok videos:", error)
    throw error
  }
}

export async function loadMoreVideos(
  username: string,
  cursor: string,
): Promise<{ videos: Video[]; cursor: string; hasMore: boolean }> {
  try {
    // Remove @ if it exists at the beginning
    const formattedUsername = username.startsWith("@") ? username : `@${username}`

    const response = await fetch("/api/tiktok-videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formattedUsername,
        cursor: cursor, // Use the cursor from previous response
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: TikwmApiResponse = await response.json()

    if (data.code !== 0) {
      throw new Error(data.msg || "Failed to fetch more videos")
    }

    // Process videos to ensure they have the required fields and convert to our internal format
    const processedVideos = data.data.videos.map((video) => ({
      id: video.id || video.video_id,
      title: video.title || "",
      cover: video.cover.startsWith("/") ? `${TIKWM_BASE_URL}${video.cover}` : video.cover,
      videoUrl: video.play.startsWith("/") ? `${TIKWM_BASE_URL}${video.play}` : video.play,
      avatar: video.author?.avatar?.startsWith("/")
        ? `${TIKWM_BASE_URL}${video.author.avatar}`
        : video.author?.avatar || "",
      author: video.author,
      music_info: video.music_info,
      digg_count: video.digg_count || 0,
      comment_count: video.comment_count || 0,
      share_count: video.share_count || 0,
    }))

    return {
      videos: processedVideos,
      cursor: data.data.cursor,
      hasMore: data.data.hasMore,
    }
  } catch (error) {
    console.error("Error loading more TikTok videos:", error)
    throw error
  }
}
