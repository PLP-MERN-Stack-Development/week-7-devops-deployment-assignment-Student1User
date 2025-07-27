const express = require("express")
const { query, validationResult, body } = require("express-validator")
const asyncHandler = require("express-async-handler")
const Metric = require("../models/Metric")
const Deployment = require("../models/Deployment")
const { protect } = require("../middleware/auth")

const router = express.Router()

// @desc    Get metrics for a deployment
// @route   GET /api/metrics/:deploymentId
// @access  Private
router.get(
  "/:deploymentId",
  protect,
  [
    query("timeRange")
      .optional()
      .isIn(["1h", "24h", "7d", "30d"])
      .withMessage("Time range must be 1h, 24h, 7d, or 30d"),
    query("type")
      .optional()
      .isIn([
        "response_time",
        "error_rate",
        "request_count",
        "cpu_usage",
        "memory_usage",
        "disk_usage",
        "network_io",
        "uptime",
        "throughput",
        "latency",
      ]),
    query("service").optional().isIn(["frontend", "backend", "database", "overall"]),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { deploymentId } = req.params
    const { timeRange = "24h", type, service } = req.query

    // Check if deployment exists and user has access
    const deployment = await Deployment.findById(deploymentId)
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these metrics",
      })
    }

    // Build query
    const queryObj = { deployment: deploymentId }
    if (type) queryObj.type = type
    if (service) queryObj.service = service

    // Get time range
    const timeRanges = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }

    const startTime = new Date(Date.now() - timeRanges[timeRange])
    queryObj.timestamp = { $gte: startTime }

    const metrics = await Metric.find(queryObj).sort({ timestamp: -1 })

    res.json({
      success: true,
      data: {
        metrics,
        timeRange,
        count: metrics.length,
      },
    })
  }),
)

// @desc    Get aggregated metrics
// @route   GET /api/metrics/:deploymentId/aggregated
// @access  Private
router.get(
  "/:deploymentId/aggregated",
  protect,
  [
    query("timeRange")
      .optional()
      .isIn(["1h", "24h", "7d", "30d"])
      .withMessage("Time range must be 1h, 24h, 7d, or 30d"),
    query("groupBy").optional().isIn(["hour", "day", "week"]).withMessage("Group by must be hour, day, or week"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { deploymentId } = req.params
    const { timeRange = "24h", groupBy = "hour" } = req.query

    // Check if deployment exists and user has access
    const deployment = await Deployment.findById(deploymentId)
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these metrics",
      })
    }

    // Get time range
    const timeRanges = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }

    const startTime = new Date(Date.now() - timeRanges[timeRange])

    // Group by intervals
    const groupByIntervals = {
      hour: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } },
      day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      week: { $dateToString: { format: "%Y-W%U", date: "$timestamp" } },
    }

    const aggregatedMetrics = await Metric.aggregate([
      {
        $match: {
          deployment: deployment._id,
          timestamp: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            service: "$service",
            interval: groupByIntervals[groupBy],
          },
          avg: { $avg: "$value" },
          min: { $min: "$value" },
          max: { $max: "$value" },
          count: { $sum: 1 },
          latest: { $last: "$value" },
        },
      },
      {
        $sort: { "_id.interval": 1 },
      },
    ])

    res.json({
      success: true,
      data: {
        aggregatedMetrics,
        timeRange,
        groupBy,
      },
    })
  }),
)

// @desc    Create new metric
// @route   POST /api/metrics/:deploymentId
// @access  Private
router.post(
  "/:deploymentId",
  protect,
  [
    body("type")
      .isIn([
        "response_time",
        "error_rate",
        "request_count",
        "cpu_usage",
        "memory_usage",
        "disk_usage",
        "network_io",
        "uptime",
        "throughput",
        "latency",
      ])
      .withMessage("Invalid metric type"),
    body("value").isNumeric().withMessage("Value must be a number"),
    body("unit").isIn(["ms", "percent", "count", "bytes", "requests/min", "mb", "gb"]).withMessage("Invalid unit"),
    body("service").optional().isIn(["frontend", "backend", "database", "overall"]).withMessage("Invalid service"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { deploymentId } = req.params

    // Check if deployment exists and user has access
    const deployment = await Deployment.findById(deploymentId)
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create metrics for this deployment",
      })
    }

    const metric = await Metric.create({
      deployment: deploymentId,
      ...req.body,
    })

    res.status(201).json({
      success: true,
      message: "Metric created successfully",
      data: {
        metric,
      },
    })
  }),
)

// @desc    Get metric trends
// @route   GET /api/metrics/:deploymentId/trends
// @access  Private
router.get(
  "/:deploymentId/trends",
  protect,
  [
    query("type")
      .isIn([
        "response_time",
        "error_rate",
        "request_count",
        "cpu_usage",
        "memory_usage",
        "disk_usage",
        "network_io",
        "uptime",
        "throughput",
        "latency",
      ])
      .withMessage("Invalid metric type"),
    query("timeRange")
      .optional()
      .isIn(["1h", "24h", "7d", "30d"])
      .withMessage("Time range must be 1h, 24h, 7d, or 30d"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { deploymentId } = req.params
    const { type, timeRange = "24h" } = req.query

    // Check if deployment exists and user has access
    const deployment = await Deployment.findById(deploymentId)
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these metrics",
      })
    }

    const trend = await Metric.calculateTrend(deploymentId, type, timeRange)

    res.json({
      success: true,
      data: {
        trend,
        type,
        timeRange,
      },
    })
  }),
)

// @desc    Get current system metrics
// @route   GET /api/metrics/system/current
// @access  Private
router.get(
  "/system/current",
  protect,
  asyncHandler(async (req, res) => {
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: require("os").loadavg(),
      },
      memory: {
        usage: process.memoryUsage(),
        total: require("os").totalmem(),
        free: require("os").freemem(),
        percentage: Math.round((process.memoryUsage().heapUsed / require("os").totalmem()) * 100 * 100) / 100,
      },
      uptime: {
        process: process.uptime(),
        system: require("os").uptime(),
      },
      network: {
        hostname: require("os").hostname(),
        platform: process.platform,
        arch: process.arch,
      },
    }

    res.json({
      success: true,
      data: {
        systemMetrics,
      },
    })
  }),
)

module.exports = router
