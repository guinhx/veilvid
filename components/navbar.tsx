"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SettingsDialog from "./settings-dialog"

interface NavbarProps {
  initialSearchQuery?: string
  onSearch?: (query: string) => void
  autoHideEnabled: boolean
  onAutoHideChange: (enabled: boolean) => void
  autoHideDelay: number
  onAutoHideDelayChange: (delay: number) => void
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
}

export default function Navbar({ 
  initialSearchQuery = "",
  onSearch,
  autoHideEnabled,
  onAutoHideChange,
  autoHideDelay,
  onAutoHideDelayChange,
  settingsOpen,
  onSettingsOpenChange
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      onSearch?.(searchQuery)
      router.push(`/?q=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Focus the input when clicking on the container
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/5 shadow-sm py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-10">
          {/* Logo/Name */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="VeilVid"
                  width={32}
                  height={32}
                  className="w-auto h-6"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-white font-bold drop-shadow-sm text-lg pointer-events-none select-none">VeilVid</span>
              )}
            </div>
          </div>

          {/* Search bar - Completely controlled by React state */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div
                className={cn(
                  "relative flex items-center rounded-md cursor-text",
                  "transition-all duration-200 ease-out",
                  isFocused
                    ? "bg-white/15 border border-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                    : isHovered
                      ? "bg-white/12 border border-white/25"
                      : "bg-white/10 border border-white/20",
                )}
                onClick={handleContainerClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Search
                  className={cn(
                    "absolute left-3 h-4 w-4 drop-shadow-sm z-10 pointer-events-none",
                    "transition-colors duration-200",
                    isFocused ? "text-white/90" : "text-white/70",
                  )}
                />

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by username (e.g. @username)"
                  className={cn(
                    // Base styles - completely transparent with no borders or outlines
                    "w-full pl-10 pr-12 py-2 rounded-md text-sm text-white h-8",
                    "bg-transparent border-0 outline-0 ring-0 placeholder:text-gray-400",
                    "transition-all duration-200 ease-out",

                    // Explicitly remove ALL focus styles
                    "focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0",
                    "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0",

                    // Disabled state
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  className={cn(
                    "absolute right-0 top-0 h-full px-3 text-white rounded-r-md",
                    "transition-colors duration-200",
                    "hover:bg-white/20 active:bg-white/25",
                    isFocused ? "text-white/90" : "text-white/70",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 drop-shadow-sm" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Settings button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-900/50 text-white h-10 w-10"
              onClick={() => onSettingsOpenChange(true)}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
        autoHideEnabled={autoHideEnabled}
        onAutoHideChange={onAutoHideChange}
        autoHideDelay={autoHideDelay}
        onAutoHideDelayChange={onAutoHideDelayChange}
      />
    </nav>
  )
}
