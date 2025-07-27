const express = require("express")
const mongoose = require("mongoose")
const asyncHandler = require("express-async-handler")

const router = express.Router()

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: "checking",
        memory: "OK",
        disk: "OK",
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        cpu: {
          usage: process.cpuUsage(),
        },
      },
    }

    try {
      // Check database connection
      if (mongoose.connection.readyState === 1) {
        healthCheck.services.database = "OK"

        // Test database query
        await mongoose.connection.db.admin().ping()
        healthCheck.services.database = "OK"
      } else {
        healthCheck.services.database = "ERROR"
        healthCheck.status = "ERROR"
      }
    } catch (error) {
      healthCheck.services.database = "ERROR"
      healthCheck.status = "ERROR"
      healthCheck.error = error.message
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

    if (memoryUsagePercent > 90) {
      healthCheck.services.memory = "WARNING"
      if (healthCheck.status === "OK") healthCheck.status = "WARNING"
    }

    const statusCode = healthCheck.status === "OK" ? 200 : healthCheck.status === "WARNING" ? 200 : 503

    res.status(statusCode).json({
      success: healthCheck.status !== "ERROR",
      data: healthCheck,
    })
  }),
)

// @desc    Detailed health check
// @route   GET /api/health/detailed
// @access  Public
router.get(
  "/detailed",
  asyncHandler(async (req, res) => {
    const detailedHealth = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: {
        process: process.uptime(),
        system: require("os").uptime(),
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: {
          status: "checking",
          responseTime: null,
          connections: null,
        },
        memory: {
          status: "OK",
          usage: process.memoryUsage(),
          percentage: null,
        },
        cpu: {
          status: "OK",
          usage: process.cpuUsage(),
          loadAverage: require("os").loadavg(),
        },
        disk: {
          status: "OK",
        },
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        hostname: require("os").hostname(),
        totalMemory: require("os").totalmem(),
        freeMemory: require("os").freemem(),
        cpus: require("os").cpus().length,
      },
      dependencies: {
        express: require("express/package.json").version,
        mongoose: require("mongoose/package.json").version,
      },
    }

    try {
      // Database health check with timing
      const dbStart = Date.now()

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping()
        detailedHealth.services.database.status = "OK"
        detailedHealth.services.database.responseTime = Date.now() - dbStart
        detailedHealth.services.database.connections = mongoose.connection.db.serverConfig?.connections?.length || "N/A"
      } else {
        detailedHealth.services.database.status = "ERROR"
        detailedHealth.status = "ERROR"
      }
    } catch (error) {
      detailedHealth.services.database.status = "ERROR"
      detailedHealth.services.database.error = error.message
      detailedHealth.status = "ERROR"
    }

    // Memory analysis
    const memoryUsage = process.memoryUsage()
    const totalMemory = require("os").totalmem()
    const memoryPercentage = (memoryUsage.heapUsed / totalMemory) * 100

    detailedHealth.services.memory.percentage = Math.round(memoryPercentage * 100) / 100

    if (memoryPercentage > 90) {
      detailedHealth.services.memory.status = "CRITICAL"
      detailedHealth.status = "ERROR"
    } else if (memoryPercentage > 75) {
      detailedHealth.services.memory.status = "WARNING"
      if (detailedHealth.status === "OK") detailedHealth.status = "WARNING"
    }

    // CPU analysis
    const loadAverage = require("os").loadavg()
    const cpuCount = require("os").cpus().length
    const avgLoad = loadAverage[0] / cpuCount

    if (avgLoad > 0.8) {
      detailedHealth.services.cpu.status = "WARNING"
      if (detailedHealth.status === "OK") detailedHealth.status = "WARNING"
    }

    const statusCode = detailedHealth.status === "OK" ? 200 : detailedHealth.status === "WARNING" ? 200 : 503

    res.status(statusCode).json({
      success: detailedHealth.status !== "ERROR",
      data: detailedHealth,
    })
  }),
)

// @desc    Readiness check
// @route   GET /api/health/ready
// @access  Public
router.get(
  "/ready",
  asyncHandler(async (req, res) => {
    const readinessCheck = {
      ready: false,
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        dependencies: false,
      },
    }

    try {
      // Check database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping()
        readinessCheck.checks.database = true
      }

      // Check if all required dependencies are available
      readinessCheck.checks.dependencies = true

      // Overall readiness
      readinessCheck.ready = Object.values(readinessCheck.checks).every((check) => check === true)

      const statusCode = readinessCheck.ready ? 200 : 503

      res.status(statusCode).json({
        success: readinessCheck.ready,
        data: readinessCheck,
      })
    } catch (error) {
      res.status(503).json({
        success: false,
        data: {
          ...readinessCheck,
          error: error.message,
        },
      })
    }
  }),
)

// @desc    Liveness check
// @route   GET /api/health/live
// @access  Public
router.get(
  "/live",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    })
  }),
)

module.exports = router
