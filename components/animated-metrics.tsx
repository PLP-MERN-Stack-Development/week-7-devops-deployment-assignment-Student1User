"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Users, Zap, Database } from "lucide-react"

interface AnimatedMetricProps {
  title: string
  value: number
  unit?: string
  change: number
  trend: "up" | "down" | "stable"
  icon: React.ElementType
  color: string
  delay?: number
}

export function AnimatedMetric({
  title,
  value,
  unit = "",
  change,
  trend,
  icon: Icon,
  color,
  delay = 0,
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)

      let startTime: number
      const duration = 2000

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setDisplayValue(Math.floor(easeOutQuart * value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <Card
      className={`bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl group ${isVisible ? "animate-slide-up" : "opacity-0"}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 bg-gradient-to-br ${color}/20 rounded-xl group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-6 w-6 ${color.replace("/20", "")}`} />
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : trend === "down" ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-white font-mono">
            {displayValue.toLocaleString()}
            {unit}
          </div>
          <p className="text-purple-200 text-sm">{title}</p>
        </div>

        {/* Animated progress bar */}
        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} transition-all duration-2000 ease-out`}
            style={{ width: isVisible ? `${Math.min((displayValue / value) * 100, 100)}%` : "0%" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsGrid() {
  const metrics = [
    {
      title: "Active Users",
      value: 2847,
      change: 12.5,
      trend: "up" as const,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      delay: 0,
    },
    {
      title: "API Requests",
      value: 45231,
      change: -2.3,
      trend: "down" as const,
      icon: Activity,
      color: "from-purple-500 to-purple-600",
      delay: 200,
    },
    {
      title: "Response Time",
      value: 245,
      unit: "ms",
      change: -8.7,
      trend: "down" as const,
      icon: Zap,
      color: "from-emerald-500 to-emerald-600",
      delay: 400,
    },
    {
      title: "Database Queries",
      value: 12847,
      change: 5.2,
      trend: "up" as const,
      icon: Database,
      color: "from-orange-500 to-orange-600",
      delay: 600,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <AnimatedMetric
          key={index}
          title={metric.title}
          value={metric.value}
          unit={metric.unit}
          change={metric.change}
          trend={metric.trend}
          icon={metric.icon}
          color={metric.color}
          delay={metric.delay}
        />
      ))}
    </div>
  )
}
