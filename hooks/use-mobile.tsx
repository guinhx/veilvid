"use client"

import { useEffect, useState } from "react"

// Utility to detect mobile devices based on user agent
function isMobileUserAgent() {
  if (typeof navigator === "undefined") return false // Handle server-side rendering
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return mobileRegex.test(navigator.userAgent)
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileUserAgent())
  }, [])

  return isMobile
}
