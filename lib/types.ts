export interface TikwmAuthor {
  id: string
  unique_id: string
  nickname: string
  avatar: string
}

export interface TikwmMusicInfo {
  id: string
  title: string
  play: string
  author: string
  original: boolean
  duration: number
  album: string
}

export interface TikwmVideo {
  video_id: string
  region: string
  title: string
  cover: string
  duration: number
  play: string
  wmplay: string
  size: number
  wm_size: number
  music?: string
  music_info?: TikwmMusicInfo
  play_count: number
  digg_count: number
  comment_count: number
  share_count: number
  download_count: number
  collect_count: number
  create_time: number
  author: TikwmAuthor
  is_top: number
  id: string
}

export interface TikwmApiResponse {
  code: number
  msg: string
  processed_time?: number
  data: {
    videos: TikwmVideo[]
    cursor: string
    hasMore: boolean
  }
}

// Our internal Video type that we use in the app
export interface Video {
  id: string
  title: string
  cover: string
  videoUrl: string
  avatar?: string
  author?: {
    id: string
    unique_id: string
    nickname: string
    avatar: string
  }
  music_info?: {
    title: string
    author: string
  }
  digg_count: number
  comment_count: number
  share_count: number
}
