"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  autoHideEnabled: boolean
  onAutoHideChange: (enabled: boolean) => void
  autoHideDelay: number
  onAutoHideDelayChange: (delay: number) => void
}

export default function SettingsDialog({
  open,
  onOpenChange,
  autoHideEnabled,
  onAutoHideChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/95 backdrop-blur-sm border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors duration-200">
            <div className="space-y-1">
              <Label className="text-white text-base font-medium">Auto-hide Controls</Label>
              <p className="text-sm text-gray-400 max-w-[280px]">
                Automatically hide video controls after 3 seconds of inactivity for a cleaner viewing experience
              </p>
            </div>
            <Switch
              checked={autoHideEnabled}
              onCheckedChange={onAutoHideChange}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 