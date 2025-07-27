"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Key, Globe, Server, Database, Shield, Zap } from "lucide-react"

export default function DeploymentConfig() {
  const environmentVariables = [
    { key: "NEXT_PUBLIC_API_URL", value: "https://api.your-app.com", type: "public" },
    { key: "NEXT_PUBLIC_APP_VERSION", value: "1.0.0", type: "public" },
    { key: "NEXT_PUBLIC_ENVIRONMENT", value: "production", type: "public" },
    { key: "DATABASE_URL", value: "***hidden***", type: "secret" },
    { key: "JWT_SECRET", value: "***hidden***", type: "secret" },
    { key: "MONGODB_URI", value: "***hidden***", type: "secret" },
  ]

  const deploymentPlatforms = [
    {
      name: "Vercel",
      type: "Frontend",
      status: "active",
      url: "https://your-app.vercel.app",
      features: ["Automatic HTTPS", "Global CDN", "Serverless Functions", "Preview Deployments"],
    },
    {
      name: "Render",
      type: "Backend",
      status: "active",
      url: "https://your-api.onrender.com",
      features: ["Auto-deploy from Git", "Free SSL", "Health Checks", "Log Streaming"],
    },
    {
      name: "MongoDB Atlas",
      type: "Database",
      status: "active",
      url: "cluster0.mongodb.net",
      features: ["Global Clusters", "Automated Backups", "Security Features", "Performance Advisor"],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Deployment Configuration</h1>
        <p className="text-muted-foreground">Production deployment settings and environment configuration</p>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4">
            {deploymentPlatforms.map((platform, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {platform.type === "Frontend" && <Globe className="h-5 w-5 text-blue-600" />}
                        {platform.type === "Backend" && <Server className="h-5 w-5 text-blue-600" />}
                        {platform.type === "Database" && <Database className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>{platform.type} Hosting</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{platform.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">URL:</span>
                      <p className="font-mono text-sm bg-slate-100 p-2 rounded mt-1">{platform.url}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Features:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {platform.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Dashboard
                      </Button>
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Environment Variables
              </CardTitle>
              <CardDescription>Configuration variables for different deployment environments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {environmentVariables.map((env, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={env.type === "public" ? "default" : "destructive"}>{env.type}</Badge>
                      <span className="font-mono text-sm">{env.key}</span>
                    </div>
                    <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded">{env.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Environment variables are automatically injected during the build process. Secret variables are encrypted
              and only accessible to the deployment platform.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSL/TLS Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Frontend SSL</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Backend SSL</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database SSL</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">HSTS</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security Headers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CSP</span>
                  <Badge className="bg-green-100 text-green-800">Configured</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">X-Frame-Options</span>
                  <Badge className="bg-green-100 text-green-800">DENY</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">X-Content-Type</span>
                  <Badge className="bg-green-100 text-green-800">nosniff</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Referrer-Policy</span>
                  <Badge className="bg-green-100 text-green-800">strict-origin</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Frontend Security</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Content Security Policy implemented</li>
                    <li>• XSS protection enabled</li>
                    <li>• Secure cookie settings</li>
                    <li>• HTTPS redirect enforced</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Backend Security</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• JWT token authentication</li>
                    <li>• Rate limiting implemented</li>
                    <li>• CORS properly configured</li>
                    <li>• Input validation & sanitization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Frontend Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Code Splitting</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tree Shaking</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Minification</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Compression</span>
                  <Badge className="bg-green-100 text-green-800">Gzip/Brotli</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Backend Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Caching</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Indexing</span>
                  <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Connection Pooling</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Load Balancing</span>
                  <Badge className="bg-green-100 text-green-800">Auto</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Current optimization results and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">95</div>
                  <div className="text-sm text-muted-foreground">Performance Score</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">245KB</div>
                  <div className="text-sm text-muted-foreground">Bundle Size</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
