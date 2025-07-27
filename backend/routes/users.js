const express = require("express")
const { body, query, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("role").optional().isIn(["user", "admin", "developer"]),
    query("isActive").optional().isBoolean(),
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
    const query = {}
    if (req.query.role) query.role = req.query.role
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === "true"

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Users can only access their own profile, admins can access any
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this user",
      })
    }

    res.json({
      success: true,
      data: {
        user: user.profile,
      },
    })
  }),
)

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("role").optional().isIn(["user", "admin", "developer"]).withMessage("Role must be user, admin, or developer"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
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

    let user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Users can only update their own profile, admins can update any
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      })
    }

    // Only admins can change role and isActive status
    if (req.user.role !== "admin") {
      delete req.body.role
      delete req.body.isActive
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("-password")

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: user.profile,
      },
    })
  }),
)

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      })
    }

    await user.deleteOne()

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  }),
)

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private/Admin
router.get(
  "/stats/overview",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = await User.countDocuments({ isActive: false })

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    const recentUsers = await User.find().select("name email createdAt").sort({ createdAt: -1 }).limit(5)

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $limit: 12,
      },
    ])

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
        },
        recentUsers,
        userGrowth,
      },
    })
  }),
)

module.exports = router
