"use client"

import { useEffect, useState } from "react"
import { Sparkles, Zap, Activity } from "lucide-react"

export default function ProfessionalLoading() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Initializing deployment systems...",
    "Connecting to cloud infrastructure...",
    "Loading monitoring dashboards...",
    "Synchronizing real-time data...",
    "Finalizing security protocols...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 100)
      })
    }, 200)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-8 z-10">
        {/* Main loading spinner */}
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-200/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
          <div
            className="absolute inset-4 w-16 h-16 border-2 border-pink-300/50 border-t-pink-500 rounded-full animate-spin"
            style={{ animationDuration: "0.8s" }}
          ></div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 space-y-4">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <span>{Math.round(progress)}%</span>
            <span>Loading...</span>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white animate-pulse">Initializing Professional Dashboard</h2>

          <div className="flex items-center justify-center gap-2 text-purple-200">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="animate-fade-in">{steps[currentStep]}</span>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[
            { icon: Zap, label: "High Performance", color: "text-yellow-400" },
            { icon: Activity, label: "Real-time Monitoring", color: "text-green-400" },
            { icon: Sparkles, label: "Enterprise Grade", color: "text-purple-400" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="p-3 bg-white/10 rounded-full">
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <span className="text-sm text-purple-200">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
