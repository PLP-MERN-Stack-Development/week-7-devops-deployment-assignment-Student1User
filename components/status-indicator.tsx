"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Activity, Wifi } from "lucide-react"

interface StatusIndicatorProps {
  status: "healthy" | "unhealthy" | "checking" | "offline"
  label: string
  responseTime?: number
  uptime?: number
  animated?: boolean
}

export function StatusIndicator({ status, label, responseTime, uptime, animated = true }: StatusIndicatorProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0.5)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setPulseIntensity((prev) => (prev === 0.5 ? 1 : 0.5))
    }, 1000)

    return () => clearInterval(interval)
  }, [animated])

  const getStatusConfig = () => {
    switch (status) {
      case "healthy":
        return {
          color: "from-emerald-400 to-emerald-600",
          bgColor: "bg-emerald-500/20",
          textColor: "text-emerald-300",
          icon: CheckCircle,
          pulse: true,
        }
      case "unhealthy":
        return {
          color: "from-red-400 to-red-600",
          bgColor: "bg-red-500/20",
          textColor: "text-red-300",
          icon: AlertCircle,
          pulse: true,
        }
      case "checking":
        return {
          color: "from-amber-400 to-amber-600",
          bgColor: "bg-amber-500/20",
          textColor: "text-amber-300",
          icon: Activity,
          pulse: false,
        }
      case "offline":
        return {
          color: "from-slate-400 to-slate-600",
          bgColor: "bg-slate-500/20",
          textColor: "text-slate-300",
          icon: Wifi,
          pulse: false,
        }
      default:
        return {
          color: "from-slate-400 to-slate-600",
          bgColor: "bg-slate-500/20",
          textColor: "text-slate-300",
          icon: Activity,
          pulse: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <div className="relative">
        <div
          className={`w-4 h-4 rounded-full bg-gradient-to-r ${config.color} ${config.pulse ? "animate-pulse" : ""}`}
          style={{ opacity: animated ? pulseIntensity : 1 }}
        />
        {config.pulse && (
          <div
            className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-r ${config.color} animate-ping opacity-30`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium truncate">{label}</span>
          <Icon className={`h-4 w-4 ${config.textColor} ${status === "checking" ? "animate-spin" : ""}`} />
        </div>

        {(responseTime || uptime) && (
          <div className="flex gap-4 mt-1 text-xs text-purple-300">
            {responseTime && <span>Response: {responseTime}ms</span>}
            {uptime && <span>Uptime: {uptime}%</span>}
          </div>
        )}
      </div>
    </div>
  )
}
