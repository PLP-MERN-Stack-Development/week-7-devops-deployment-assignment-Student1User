"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface DataPoint {
  timestamp: number
  value: number
}

export function PerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<DataPoint[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  // Generate sample data
  useEffect(() => {
    const generateData = () => {
      const now = Date.now()
      const points: DataPoint[] = []

      for (let i = 0; i < 50; i++) {
        points.push({
          timestamp: now - (49 - i) * 60000, // 1 minute intervals
          value: Math.random() * 100 + Math.sin(i * 0.1) * 20 + 50,
        })
      }

      setData(points)
    }

    generateData()
    const interval = setInterval(generateData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 20

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(139, 92, 246, 0.8)")
    gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.4)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)")

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw data line
    if (data.length > 1) {
      const maxValue = Math.max(...data.map((d) => d.value))
      const minValue = Math.min(...data.map((d) => d.value))
      const valueRange = maxValue - minValue || 1

      // Create path for area fill
      ctx.beginPath()
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
        const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      // Complete the area path
      const lastX = padding + ((data.length - 1) * (width - 2 * padding)) / (data.length - 1)
      ctx.lineTo(lastX, height - padding)
      ctx.lineTo(padding, height - padding)
      ctx.closePath()

      // Fill area
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw line
      ctx.beginPath()
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
        const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.strokeStyle = "#8b5cf6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw data points
      data.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
        const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding)

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#8b5cf6"
        ctx.fill()

        // Add glow effect
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(139, 92, 246, 0.3)"
        ctx.fill()
      })
    }
  }, [data])

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <canvas ref={canvasRef} className="w-full h-full rounded-lg" style={{ width: "100%", height: "100%" }} />

          {/* Overlay stats */}
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="text-sm text-purple-200">Current</div>
            <div className="text-xl font-bold">
              {data.length > 0 ? Math.round(data[data.length - 1]?.value || 0) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
