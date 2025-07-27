const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
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
    console.log("MongoDB Connected for seeding...")
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
    emailVerified: true,
  },
  {
    name: "John Developer",
    email: "john@example.com",
    password: "Developer123!",
    role: "developer",
    emailVerified: true,
  },
  {
    name: "Jane User",
    email: "jane@example.com",
    password: "User123!",
    role: "user",
    emailVerified: true,
  },
]

const deployments = [
  {
    name: "E-commerce Platform",
    description: "Full-stack e-commerce application with React and Node.js",
    repository: {
      url: "https://github.com/example/ecommerce-platform",
      branch: "main",
      commitHash: "abc123def456",
      lastCommitMessage: "Add payment integration",
    },
    environment: "production",
    status: "deployed",
    services: {
      frontend: {
        status: "deployed",
        url: "https://ecommerce-platform.vercel.app",
        platform: "vercel",
        buildTime: 120000,
        lastDeployment: new Date(),
      },
      backend: {
        status: "deployed",
        url: "https://ecommerce-api.onrender.com",
        platform: "render",
        buildTime: 180000,
        lastDeployment: new Date(),
      },
      database: {
        status: "connected",
        provider: "mongodb-atlas",
        lastConnection: new Date(),
      },
    },
    metrics: {
      buildDuration: 300000,
      deploymentSize: 25600000,
      responseTime: 245,
      uptime: 99.98,
      errorRate: 0.12,
      requestCount: 45231,
    },
  },
  {
    name: "Blog Application",
    description: "Personal blog with CMS functionality",
    repository: {
      url: "https://github.com/example/blog-app",
      branch: "main",
      commitHash: "def456ghi789",
      lastCommitMessage: "Update blog post editor",
    },
    environment: "staging",
    status: "deployed",
    services: {
      frontend: {
        status: "deployed",
        url: "https://blog-app-staging.vercel.app",
        platform: "vercel",
        buildTime: 90000,
        lastDeployment: new Date(),
      },
      backend: {
        status: "deployed",
        url: "https://blog-api-staging.onrender.com",
        platform: "render",
        buildTime: 150000,
        lastDeployment: new Date(),
      },
      database: {
        status: "connected",
        provider: "mongodb-atlas",
        lastConnection: new Date(),
      },
    },
    metrics: {
      buildDuration: 240000,
      deploymentSize: 18400000,
      responseTime: 180,
      uptime: 99.95,
      errorRate: 0.08,
      requestCount: 12847,
    },
  },
]

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany()
    await Deployment.deleteMany()
    await Metric.deleteMany()

    console.log("Existing data cleared...")

    // Create users
    const createdUsers = []
    for (const userData of users) {
      const user = await User.create(userData)
      createdUsers.push(user)
      console.log(`Created user: ${user.email}`)
    }

    // Create deployments
    const createdDeployments = []
    for (let i = 0; i < deployments.length; i++) {
      const deploymentData = {
        ...deployments[i],
        user: createdUsers[i % createdUsers.length]._id,
      }

      const deployment = await Deployment.create(deploymentData)
      createdDeployments.push(deployment)
      console.log(`Created deployment: ${deployment.name}`)
    }

    // Create sample metrics
    const metricTypes = ["response_time", "error_rate", "request_count", "cpu_usage", "memory_usage"]
    const services = ["frontend", "backend", "overall"]

    for (const deployment of createdDeployments) {
      for (let i = 0; i < 50; i++) {
        const randomType = metricTypes[Math.floor(Math.random() * metricTypes.length)]
        const randomService = services[Math.floor(Math.random() * services.length)]

        let value, unit
        switch (randomType) {
          case "response_time":
            value = Math.floor(Math.random() * 500) + 100
            unit = "ms"
            break
          case "error_rate":
            value = Math.random() * 5
            unit = "percent"
            break
          case "request_count":
            value = Math.floor(Math.random() * 1000) + 100
            unit = "count"
            break
          case "cpu_usage":
            value = Math.random() * 100
            unit = "percent"
            break
          case "memory_usage":
            value = Math.random() * 100
            unit = "percent"
            break
        }

        await Metric.create({
          deployment: deployment._id,
          type: randomType,
          value: Math.round(value * 100) / 100,
          unit,
          service: randomService,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
          metadata: {
            source: "seed-script",
            environment: deployment.environment,
          },
        })
      }
      console.log(`Created metrics for deployment: ${deployment.name}`)
    }

    console.log("Database seeded successfully!")
    console.log("\nSample login credentials:")
    console.log("Admin: admin@example.com / Admin123!")
    console.log("Developer: john@example.com / Developer123!")
    console.log("User: jane@example.com / User123!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run seeder
const runSeeder = async () => {
  await connectDB()
  await seedData()
}

if (require.main === module) {
  runSeeder()
}

module.exports = { seedData }
