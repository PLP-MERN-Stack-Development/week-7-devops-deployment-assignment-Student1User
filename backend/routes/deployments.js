const express = require("express")
const { body, query, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")
const Deployment = require("../models/Deployment")
const Metric = require("../models/Metric")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @desc    Get all deployments for user
// @route   GET /api/deployments
// @access  Private
router.get(
  "/",
  protect,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["pending", "building", "deployed", "failed", "cancelled"]),
    query("environment").optional().isIn(["development", "staging", "production"]),
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

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { user: req.user.id }
    if (req.query.status) query.status = req.query.status
    if (req.query.environment) query.environment = req.query.environment

    // Get deployments with pagination
    const deployments = await Deployment.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Deployment.countDocuments(query)

    res.json({
      success: true,
      data: {
        deployments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  }),
)

// @desc    Get single deployment
// @route   GET /api/deployments/:id
// @access  Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const deployment = await Deployment.findById(req.params.id).populate("user", "name email")

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this deployment",
      })
    }

    res.json({
      success: true,
      data: {
        deployment,
      },
    })
  }),
)

// @desc    Create new deployment
// @route   POST /api/deployments
// @access  Private
router.post(
  "/",
  protect,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Deployment name is required and must be less than 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("repository.url").isURL().withMessage("Valid repository URL is required"),
    body("repository.branch").optional().trim().isLength({ min: 1 }).withMessage("Branch name cannot be empty"),
    body("environment")
      .optional()
      .isIn(["development", "staging", "production"])
      .withMessage("Environment must be development, staging, or production"),
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

    const deploymentData = {
      ...req.body,
      user: req.user.id,
    }

    const deployment = await Deployment.create(deploymentData)

    // Add initial log
    await deployment.addLog("info", "Deployment created", "system")

    res.status(201).json({
      success: true,
      message: "Deployment created successfully",
      data: {
        deployment,
      },
    })
  }),
)

// @desc    Update deployment
// @route   PUT /api/deployments/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Deployment name must be less than 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("environment")
      .optional()
      .isIn(["development", "staging", "production"])
      .withMessage("Environment must be development, staging, or production"),
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

    let deployment = await Deployment.findById(req.params.id)

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this deployment",
      })
    }

    deployment = await Deployment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    // Add log
    await deployment.addLog("info", "Deployment updated", "system")

    res.json({
      success: true,
      message: "Deployment updated successfully",
      data: {
        deployment,
      },
    })
  }),
)

// @desc    Delete deployment
// @route   DELETE /api/deployments/:id
// @access  Private
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const deployment = await Deployment.findById(req.params.id)

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this deployment",
      })
    }

    await deployment.deleteOne()

    // Delete associated metrics
    await Metric.deleteMany({ deployment: req.params.id })

    res.json({
      success: true,
      message: "Deployment deleted successfully",
    })
  }),
)

// @desc    Trigger deployment
// @route   POST /api/deployments/:id/deploy
// @access  Private
router.post(
  "/:id/deploy",
  protect,
  asyncHandler(async (req, res) => {
    const deployment = await Deployment.findById(req.params.id)

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to deploy this deployment",
      })
    }

    // Update status to building
    deployment.status = "building"
    await deployment.save()

    // Add log
    await deployment.addLog("info", "Deployment triggered", "system")

    // Here you would integrate with actual deployment services
    // For now, we'll simulate the deployment process
    setTimeout(async () => {
      try {
        // Simulate deployment success
        await deployment.updateServiceStatus("frontend", "deployed", {
          url: `https://${deployment.name}-frontend.vercel.app`,
          buildTime: Math.floor(Math.random() * 120000) + 30000, // 30s to 2.5min
        })

        await deployment.updateServiceStatus("backend", "deployed", {
          url: `https://${deployment.name}-backend.onrender.com`,
          buildTime: Math.floor(Math.random() * 180000) + 60000, // 1min to 4min
        })

        await deployment.updateServiceStatus("database", "connected")

        await deployment.addLog("info", "Deployment completed successfully", "system")
      } catch (error) {
        deployment.status = "failed"
        await deployment.save()
        await deployment.addLog("error", `Deployment failed: ${error.message}`, "system")
      }
    }, 5000) // 5 second delay to simulate build time

    res.json({
      success: true,
      message: "Deployment triggered successfully",
      data: {
        deployment,
      },
    })
  }),
)

// @desc    Get deployment logs
// @route   GET /api/deployments/:id/logs
// @access  Private
router.get(
  "/:id/logs",
  protect,
  [
    query("limit").optional().isInt({ min: 1, max: 1000 }).withMessage("Limit must be between 1 and 1000"),
    query("level").optional().isIn(["info", "warn", "error", "debug"]),
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

    const deployment = await Deployment.findById(req.params.id)

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access deployment logs",
      })
    }

    let logs = deployment.logs

    // Filter by level if specified
    if (req.query.level) {
      logs = logs.filter((log) => log.level === req.query.level)
    }

    // Limit results
    const limit = Number.parseInt(req.query.limit) || 100
    logs = logs.slice(-limit)

    res.json({
      success: true,
      data: {
        logs: logs.reverse(), // Most recent first
      },
    })
  }),
)

// @desc    Perform health check
// @route   POST /api/deployments/:id/health-check
// @access  Private
router.post(
  "/:id/health-check",
  protect,
  asyncHandler(async (req, res) => {
    const deployment = await Deployment.findById(req.params.id)

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      })
    }

    // Check ownership
    if (deployment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform health check",
      })
    }

    try {
      await deployment.performHealthCheck()
      await deployment.addLog("info", "Health check completed", "system")

      res.json({
        success: true,
        message: "Health check completed",
        data: {
          healthChecks: deployment.healthChecks,
        },
      })
    } catch (error) {
      await deployment.addLog("error", `Health check failed: ${error.message}`, "system")

      res.status(500).json({
        success: false,
        message: "Health check failed",
        error: error.message,
      })
    }
  }),
)

module.exports = router
