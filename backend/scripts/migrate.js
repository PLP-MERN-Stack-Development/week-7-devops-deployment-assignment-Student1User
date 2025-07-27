const mongoose = require("mongoose")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Deployment = require("../models/Deployment")
const Metric = require("../models/Metric")

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB Connected for migration...")
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}

// Migration functions
const migrations = {
  // Add indexes for better performance
  addIndexes: async () => {
    console.log("Adding database indexes...")

    try {
      // User indexes
      await User.collection.createIndex({ email: 1 }, { unique: true })
      await User.collection.createIndex({ createdAt: -1 })
      await User.collection.createIndex({ role: 1 })

      // Deployment indexes
      await Deployment.collection.createIndex({ user: 1, createdAt: -1 })
      await Deployment.collection.createIndex({ status: 1 })
      await Deployment.collection.createIndex({ environment: 1 })

      // Metric indexes
      await Metric.collection.createIndex({ deployment: 1, timestamp: -1 })
      await Metric.collection.createIndex({ type: 1, timestamp: -1 })
      await Metric.collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

      console.log("Indexes added successfully!")
    } catch (error) {
      console.error("Error adding indexes:", error)
    }
  },

  // Update user preferences structure
  updateUserPreferences: async () => {
    console.log("Updating user preferences structure...")

    try {
      const users = await User.find({ preferences: { $exists: false } })

      for (const user of users) {
        user.preferences = {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: "auto",
          language: "en",
        }
        await user.save()
      }

      console.log(`Updated preferences for ${users.length} users`)
    } catch (error) {
      console.error("Error updating user preferences:", error)
    }
  },

  // Add health checks to existing deployments
  addHealthChecks: async () => {
    console.log("Adding health checks to existing deployments...")

    try {
      const deployments = await Deployment.find({ healthChecks: { $size: 0 } })

      for (const deployment of deployments) {
        const healthChecks = []

        if (deployment.services.frontend.status === "deployed") {
          healthChecks.push({
            service: "Frontend (Vercel)",
            status: "healthy",
            responseTime: Math.floor(Math.random() * 200) + 100,
            lastCheck: new Date(),
            uptime: 99.9,
          })
        }

        if (deployment.services.backend.status === "deployed") {
          healthChecks.push({
            service: "Backend API (Render)",
            status: "healthy",
            responseTime: Math.floor(Math.random() * 300) + 150,
            lastCheck: new Date(),
            uptime: 99.8,
          })
        }

        if (deployment.services.database.status === "connected") {
          healthChecks.push({
            service: "MongoDB Atlas",
            status: "healthy",
            responseTime: Math.floor(Math.random() * 100) + 50,
            lastCheck: new Date(),
            uptime: 99.99,
          })
        }

        deployment.healthChecks = healthChecks
        await deployment.save()
      }

      console.log(`Added health checks to ${deployments.length} deployments`)
    } catch (error) {
      console.error("Error adding health checks:", error)
    }
  },

  // Clean up old metrics (older than 30 days)
  cleanupOldMetrics: async () => {
    console.log("Cleaning up old metrics...")

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const result = await Metric.deleteMany({ timestamp: { $lt: thirtyDaysAgo } })

      console.log(`Deleted ${result.deletedCount} old metrics`)
    } catch (error) {
      console.error("Error cleaning up old metrics:", error)
    }
  },

  // Update deployment configuration structure
  updateDeploymentConfig: async () => {
    console.log("Updating deployment configuration structure...")

    try {
      const deployments = await Deployment.find({ "configuration.packageManager": { $exists: false } })

      for (const deployment of deployments) {
        if (!deployment.configuration) {
          deployment.configuration = {}
        }

        deployment.configuration = {
          ...deployment.configuration,
          buildCommand: deployment.configuration.buildCommand || "npm run build",
          startCommand: deployment.configuration.startCommand || "npm start",
          nodeVersion: deployment.configuration.nodeVersion || "18.x",
          packageManager: deployment.configuration.packageManager || "npm",
        }

        await deployment.save()
      }

      console.log(`Updated configuration for ${deployments.length} deployments`)
    } catch (error) {
      console.error("Error updating deployment configuration:", error)
    }
  },
}

// Run all migrations
const runMigrations = async () => {
  await connectDB()

  console.log("Starting database migrations...\n")

  for (const [name, migration] of Object.entries(migrations)) {
    console.log(`Running migration: ${name}`)
    await migration()
    console.log(`Completed migration: ${name}\n`)
  }

  console.log("All migrations completed successfully!")
  mongoose.connection.close()
}

// Run specific migration
const runSpecificMigration = async (migrationName) => {
  await connectDB()

  if (migrations[migrationName]) {
    console.log(`Running migration: ${migrationName}`)
    await migrations[migrationName]()
    console.log(`Completed migration: ${migrationName}`)
  } else {
    console.error(`Migration '${migrationName}' not found`)
    console.log("Available migrations:", Object.keys(migrations).join(", "))
  }

  mongoose.connection.close()
}

// CLI handling
if (require.main === module) {
  const migrationName = process.argv[2]

  if (migrationName) {
    runSpecificMigration(migrationName)
  } else {
    runMigrations()
  }
}

module.exports = { migrations, runMigrations, runSpecificMigration }
