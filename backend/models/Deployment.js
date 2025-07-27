const mongoose = require("mongoose")

const deploymentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a deployment name"],
      trim: true,
      maxlength: [100, "Deployment name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    repository: {
      url: {
        type: String,
        required: [true, "Repository URL is required"],
      },
      branch: {
        type: String,
        default: "main",
      },
      commitHash: String,
      lastCommitMessage: String,
    },
    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "development",
    },
    status: {
      type: String,
      enum: ["pending", "building", "deployed", "failed", "cancelled"],
      default: "pending",
    },
    services: {
      frontend: {
        status: {
          type: String,
          enum: ["pending", "building", "deployed", "failed"],
          default: "pending",
        },
        url: String,
        platform: {
          type: String,
          enum: ["vercel", "netlify", "github-pages"],
          default: "vercel",
        },
        buildTime: Number,
        lastDeployment: Date,
      },
      backend: {
        status: {
          type: String,
          enum: ["pending", "building", "deployed", "failed"],
          default: "pending",
        },
        url: String,
        platform: {
          type: String,
          enum: ["render", "heroku", "railway", "aws"],
          default: "render",
        },
        buildTime: Number,
        lastDeployment: Date,
      },
      database: {
        status: {
          type: String,
          enum: ["pending", "connecting", "connected", "failed"],
          default: "pending",
        },
        provider: {
          type: String,
          enum: ["mongodb-atlas", "aws-documentdb", "local"],
          default: "mongodb-atlas",
        },
        connectionString: String,
        lastConnection: Date,
      },
    },
    metrics: {
      buildDuration: Number,
      deploymentSize: Number,
      responseTime: Number,
      uptime: {
        type: Number,
        default: 0,
      },
      errorRate: {
        type: Number,
        default: 0,
      },
      requestCount: {
        type: Number,
        default: 0,
      },
    },
    healthChecks: [
      {
        service: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["healthy", "unhealthy", "checking"],
          default: "checking",
        },
        responseTime: Number,
        lastCheck: {
          type: Date,
          default: Date.now,
        },
        uptime: {
          type: Number,
          default: 100,
        },
      },
    ],
    logs: [
      {
        level: {
          type: String,
          enum: ["info", "warn", "error", "debug"],
          default: "info",
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        service: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    configuration: {
      environmentVariables: [
        {
          key: String,
          value: String,
          isSecret: {
            type: Boolean,
            default: false,
          },
        },
      ],
      buildCommand: String,
      startCommand: String,
      nodeVersion: String,
      packageManager: {
        type: String,
        enum: ["npm", "yarn", "pnpm"],
        default: "npm",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
deploymentSchema.index({ user: 1, createdAt: -1 })
deploymentSchema.index({ status: 1 })
deploymentSchema.index({ environment: 1 })
deploymentSchema.index({ "services.frontend.status": 1 })
deploymentSchema.index({ "services.backend.status": 1 })

// Virtual for overall deployment health
deploymentSchema.virtual("health").get(function () {
  const services = this.services
  const totalServices = 3 // frontend, backend, database
  let healthyServices = 0

  if (services.frontend.status === "deployed") healthyServices++
  if (services.backend.status === "deployed") healthyServices++
  if (services.database.status === "connected") healthyServices++

  return Math.round((healthyServices / totalServices) * 100)
})

// Virtual for deployment duration
deploymentSchema.virtual("deploymentDuration").get(function () {
  if (this.status === "deployed" && this.createdAt) {
    return Date.now() - this.createdAt.getTime()
  }
  return null
})

// Method to add log entry
deploymentSchema.methods.addLog = function (level, message, service = null, metadata = null) {
  this.logs.push({
    level,
    message,
    service,
    metadata,
    timestamp: new Date(),
  })

  // Keep only last 100 logs
  if (this.logs.length > 100) {
    this.logs = this.logs.slice(-100)
  }

  return this.save()
}

// Method to update service status
deploymentSchema.methods.updateServiceStatus = function (service, status, additionalData = {}) {
  if (this.services[service]) {
    this.services[service].status = status
    this.services[service].lastDeployment = new Date()

    Object.assign(this.services[service], additionalData)

    // Update overall deployment status
    this.updateOverallStatus()

    return this.save()
  }
  throw new Error(`Service ${service} not found`)
}

// Method to update overall deployment status
deploymentSchema.methods.updateOverallStatus = function () {
  const { frontend, backend, database } = this.services

  if (frontend.status === "failed" || backend.status === "failed" || database.status === "failed") {
    this.status = "failed"
  } else if (frontend.status === "deployed" && backend.status === "deployed" && database.status === "connected") {
    this.status = "deployed"
  } else if (frontend.status === "building" || backend.status === "building") {
    this.status = "building"
  } else {
    this.status = "pending"
  }
}

// Method to perform health check
deploymentSchema.methods.performHealthCheck = async function () {
  const axios = require("axios")
  const healthChecks = []

  // Check frontend
  if (this.services.frontend.url) {
    try {
      const start = Date.now()
      await axios.get(this.services.frontend.url, { timeout: 5000 })
      const responseTime = Date.now() - start

      healthChecks.push({
        service: "Frontend",
        status: "healthy",
        responseTime,
        lastCheck: new Date(),
        uptime: 100,
      })
    } catch (error) {
      healthChecks.push({
        service: "Frontend",
        status: "unhealthy",
        responseTime: 0,
        lastCheck: new Date(),
        uptime: 0,
      })
    }
  }

  // Check backend
  if (this.services.backend.url) {
    try {
      const start = Date.now()
      await axios.get(`${this.services.backend.url}/api/health`, { timeout: 5000 })
      const responseTime = Date.now() - start

      healthChecks.push({
        service: "Backend",
        status: "healthy",
        responseTime,
        lastCheck: new Date(),
        uptime: 100,
      })
    } catch (error) {
      healthChecks.push({
        service: "Backend",
        status: "unhealthy",
        responseTime: 0,
        lastCheck: new Date(),
        uptime: 0,
      })
    }
  }

  this.healthChecks = healthChecks
  return this.save()
}

module.exports = mongoose.model("Deployment", deploymentSchema)
