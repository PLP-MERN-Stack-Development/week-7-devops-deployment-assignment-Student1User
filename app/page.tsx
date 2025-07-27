"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Server,
  Database,
  Globe,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Shield,
  Monitor,
  TrendingUp,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"

interface DeploymentStatus {
  frontend: "deployed" | "deploying" | "failed"
  backend: "deployed" | "deploying" | "failed"
  database: "connected" | "connecting" | "failed"
  cicd: "active" | "inactive" | "failed"
}

interface HealthCheck {
  service: string
  status: "healthy" | "unhealthy" | "checking"
  responseTime: number
  lastCheck: string
  uptime: number
}

interface MetricData {
  label: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
}

// Move the hook outside the component
function useAnimatedCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}

export default function ProfessionalDeploymentDashboard() {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    frontend: "deployed",
    backend: "deployed",
    database: "connected",
    cicd: "active",
  })

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      service: "Frontend (Vercel)",
      status: "healthy",
      responseTime: 120,
      lastCheck: new Date().toLocaleTimeString(),
      uptime: 99.98,
    },
    {
      service: "Backend API (Render)",
      status: "healthy",
      responseTime: 250,
      lastCheck: new Date().toLocaleTimeString(),
      uptime: 99.95,
    },
    {
      service: "MongoDB Atlas",
      status: "healthy",
      responseTime: 180,
      lastCheck: new Date().toLocaleTimeString(),
      uptime: 99.99,
    },
  ])

  const [metrics, setMetrics] = useState<MetricData[]>([
    { label: "Active Users", value: 2847, change: 12.5, trend: "up" },
    { label: "API Requests", value: 45231, change: -2.3, trend: "down" },
    { label: "Response Time", value: 245, change: -8.7, trend: "down" },
    { label: "Error Rate", value: 0.12, change: -45.2, trend: "down" },
  ])

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Call hooks consistently for each metric
  const animatedValue1 = useAnimatedCounter(metrics[0]?.value || 0)
  const animatedValue2 = useAnimatedCounter(metrics[1]?.value || 0)
  const animatedValue3 = useAnimatedCounter(metrics[2]?.value || 0)
  const animatedValue4 = useAnimatedCounter(metrics[3]?.value || 0)

  const animatedValues = [animatedValue1, animatedValue2, animatedValue3, animatedValue4]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
      case "connected":
      case "active":
      case "healthy":
        return "from-emerald-400 to-emerald-600"
      case "deploying":
      case "connecting":
      case "checking":
        return "from-amber-400 to-amber-600"
      case "failed":
      case "unhealthy":
      case "inactive":
        return "from-red-400 to-red-600"
      default:
        return "from-slate-400 to-slate-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed":
      case "connected":
      case "active":
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "deploying":
      case "connecting":
      case "checking":
        return <Activity className="h-4 w-4 animate-spin" />
      case "failed":
      case "unhealthy":
      case "inactive":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const canvasAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }

  useEffect(() => {
    canvasAnimation()

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500)

    // Update metrics periodically
    const interval = setInterval(() => {
      setHealthChecks((prev) =>
        prev.map((check) => ({
          ...check,
          responseTime: Math.floor(Math.random() * 300) + 100,
          lastCheck: new Date().toLocaleTimeString(),
        })),
      )
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Initializing Dashboard</h2>
            <p className="text-purple-200">Loading deployment metrics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-20" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>

      <div className="relative z-10 p-6 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-white font-medium">Professional Deployment Suite</span>
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
              MERN Stack Dashboard
            </h1>

            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade deployment monitoring with real-time analytics, automated CI/CD pipelines, and
              comprehensive performance insights
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-medium">
                Production Ready
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-4 py-2 text-sm font-medium">
                v2.1.0
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                Enterprise
              </Badge>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const animatedValue = animatedValues[index] || 0
              return (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-6 w-6 text-purple-300" />
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          metric.trend === "up"
                            ? "text-emerald-400"
                            : metric.trend === "down"
                              ? "text-red-400"
                              : "text-slate-400"
                        }`}
                      >
                        {metric.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-white">
                        {metric.label === "Response Time"
                          ? `${animatedValue}ms`
                          : metric.label === "Error Rate"
                            ? `${(animatedValue / 100).toFixed(2)}%`
                            : animatedValue.toLocaleString()}
                      </p>
                      <p className="text-purple-200 text-sm">{metric.label}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { key: "frontend", label: "Frontend", icon: Globe, platform: "Vercel" },
              { key: "backend", label: "Backend API", icon: Server, platform: "Render" },
              { key: "database", label: "Database", icon: Database, platform: "MongoDB Atlas" },
              { key: "cicd", label: "CI/CD Pipeline", icon: GitBranch, platform: "GitHub Actions" },
            ].map((service, index) => (
              <Card
                key={service.key}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500 group overflow-hidden"
              >
                <CardContent className="p-6 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(deploymentStatus[service.key as keyof DeploymentStatus])} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(deploymentStatus[service.key as keyof DeploymentStatus])} animate-pulse`}
                      ></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">{service.label}</h3>
                      <p className="text-purple-200 text-sm">{service.platform}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deploymentStatus[service.key as keyof DeploymentStatus])}
                        <span className="text-sm font-medium text-white capitalize">
                          {deploymentStatus[service.key as keyof DeploymentStatus]}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20 p-1">
              {[
                { value: "overview", label: "Overview", icon: BarChart3 },
                { value: "monitoring", label: "Monitoring", icon: Activity },
                { value: "performance", label: "Performance", icon: Zap },
                { value: "security", label: "Security", icon: Shield },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-purple-200 hover:text-white transition-all duration-300 flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg">
                        <Activity className="h-5 w-5 text-emerald-400" />
                      </div>
                      System Health Overview
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Real-time monitoring of all critical services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {healthChecks.map((check, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(check.status)} animate-pulse`}
                            ></div>
                            <span className="font-medium text-white">{check.service}</span>
                          </div>
                          <Badge
                            className={`${check.status === "healthy" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"} border`}
                          >
                            {check.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-purple-300">Response</p>
                            <p className="text-white font-medium">{check.responseTime}ms</p>
                          </div>
                          <div>
                            <p className="text-purple-300">Uptime</p>
                            <p className="text-white font-medium">{check.uptime}%</p>
                          </div>
                          <div>
                            <p className="text-purple-300">Last Check</p>
                            <p className="text-white font-medium">{check.lastCheck}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-purple-300 mb-1">
                            <span>Performance</span>
                            <span>{Math.min(100, Math.max(0, 100 - check.responseTime / 10))}%</span>
                          </div>
                          <Progress
                            value={Math.min(100, Math.max(0, 100 - check.responseTime / 10))}
                            className="h-2 bg-white/10"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Resource Usage */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                        <Cpu className="h-5 w-5 text-blue-400" />
                      </div>
                      Resource Utilization
                    </CardTitle>
                    <CardDescription className="text-purple-200">Current system resource consumption</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { label: "CPU Usage", value: 45, icon: Cpu, color: "from-blue-500 to-blue-600" },
                      { label: "Memory", value: 62, icon: HardDrive, color: "from-purple-500 to-purple-600" },
                      { label: "Network", value: 28, icon: Wifi, color: "from-emerald-500 to-emerald-600" },
                      { label: "Storage", value: 73, icon: HardDrive, color: "from-orange-500 to-orange-600" },
                    ].map((resource, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-br ${resource.color}/20 rounded-lg`}>
                              <resource.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-medium">{resource.label}</span>
                          </div>
                          <span className="text-white font-bold">{resource.value}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={resource.value} className="h-3 bg-white/10" />
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${resource.color} opacity-80 rounded-full`}
                            style={{ width: `${resource.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-400" />
                    </div>
                    Advanced Monitoring Suite
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Comprehensive application and infrastructure monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Error Tracking", value: "0.12%", change: "-45%", status: "excellent" },
                      { title: "API Latency", value: "245ms", change: "-8%", status: "good" },
                      { title: "Throughput", value: "1.2K/min", change: "+15%", status: "excellent" },
                    ].map((metric, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 text-center"
                      >
                        <h3 className="text-purple-200 text-sm mb-2">{metric.title}</h3>
                        <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
                        <div
                          className={`inline-flex items-center gap-1 text-sm ${
                            metric.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {metric.change.startsWith("+") ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-400" />
                      </div>
                      Core Web Vitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { metric: "LCP", value: 1.2, threshold: 2.5, unit: "s", status: "good" },
                      { metric: "FID", value: 8, threshold: 100, unit: "ms", status: "excellent" },
                      { metric: "CLS", value: 0.05, threshold: 0.1, unit: "", status: "good" },
                    ].map((vital, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{vital.metric}</span>
                          <span className="text-white font-bold">
                            {vital.value}
                            {vital.unit}
                          </span>
                        </div>
                        <Progress value={(vital.value / vital.threshold) * 100} className="h-2 bg-white/10" />
                        <div className="flex justify-between text-xs text-purple-300">
                          <span>
                            Threshold: {vital.threshold}
                            {vital.unit}
                          </span>
                          <Badge
                            className={`${vital.status === "excellent" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"} border-0`}
                          >
                            {vital.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${95 * 2.51} ${100 * 2.51}`}
                          strokeLinecap="round"
                          className="animate-pulse"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white">95</div>
                          <div className="text-sm text-purple-200">Performance</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg">
                        <Shield className="h-5 w-5 text-red-400" />
                      </div>
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { check: "SSL/TLS Certificate", status: "valid", expires: "2025-01-15" },
                      { check: "Security Headers", status: "configured", score: "A+" },
                      { check: "Vulnerability Scan", status: "clean", lastScan: "2 hours ago" },
                      { check: "Access Control", status: "enforced", policies: "12 active" },
                    ].map((security, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <p className="text-white font-medium">{security.check}</p>
                          <p className="text-purple-300 text-sm">
                            {security.expires && `Expires: ${security.expires}`}
                            {security.score && `Score: ${security.score}`}
                            {security.lastScan && `Last scan: ${security.lastScan}`}
                            {security.policies && `${security.policies}`}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">
                          {security.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                      </div>
                      Threat Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">All Clear</h3>
                      <p className="text-purple-200">No security threats detected in the last 24 hours</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
