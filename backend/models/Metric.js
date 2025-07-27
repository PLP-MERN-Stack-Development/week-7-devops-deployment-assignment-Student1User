const mongoose = require("mongoose")

const metricSchema = new mongoose.Schema(
  {
    deployment: {
      type: mongoose.Schema.ObjectId,
      ref: "Deployment",
      required: true,
    },
    type: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["ms", "percent", "count", "bytes", "requests/min", "mb", "gb"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    service: {
      type: String,
      enum: ["frontend", "backend", "database", "overall"],
      default: "overall",
    },
    metadata: {
      source: String,
      region: String,
      version: String,
      environment: String,
      additionalData: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
metricSchema.index({ deployment: 1, timestamp: -1 })
metricSchema.index({ type: 1, timestamp: -1 })
metricSchema.index({ service: 1, timestamp: -1 })
metricSchema.index({ timestamp: -1 })

// TTL index to automatically delete old metrics (keep for 30 days)
metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

// Static method to get metrics for a deployment
metricSchema.statics.getMetricsForDeployment = async function (deploymentId, timeRange = "24h") {
  const timeRanges = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }

  const startTime = new Date(Date.now() - timeRanges[timeRange])

  return this.find({
    deployment: deploymentId,
    timestamp: { $gte: startTime },
  }).sort({ timestamp: -1 })
}

// Static method to get aggregated metrics
metricSchema.statics.getAggregatedMetrics = async function (deploymentId, type, timeRange = "24h") {
  const timeRanges = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }

  const startTime = new Date(Date.now() - timeRanges[timeRange])

  return this.aggregate([
    {
      $match: {
        deployment: mongoose.Types.ObjectId(deploymentId),
        type: type,
        timestamp: { $gte: startTime },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$value" },
        min: { $min: "$value" },
        max: { $max: "$value" },
        count: { $sum: 1 },
        latest: { $last: "$value" },
      },
    },
  ])
}

// Method to calculate trend
metricSchema.statics.calculateTrend = async function (deploymentId, type, timeRange = "24h") {
  const metrics = await this.getMetricsForDeployment(deploymentId, timeRange)
  const typeMetrics = metrics.filter((m) => m.type === type)

  if (typeMetrics.length < 2) {
    return { trend: "stable", change: 0 }
  }

  const latest = typeMetrics[0].value
  const previous = typeMetrics[Math.floor(typeMetrics.length / 2)].value

  const change = ((latest - previous) / previous) * 100

  let trend = "stable"
  if (Math.abs(change) > 5) {
    trend = change > 0 ? "up" : "down"
  }

  return { trend, change: Math.round(change * 100) / 100 }
}

module.exports = mongoose.model("Metric", metricSchema)
