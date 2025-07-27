# MERN Deployment Backend

A production-ready Node.js/Express backend API for the MERN stack deployment monitoring application.

## 🚀 Features

- **RESTful API**: Complete REST API with authentication and authorization
- **MongoDB Integration**: Mongoose ODM with advanced schemas and relationships
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Admin, Developer, and User roles
- **Real-time Monitoring**: Health checks and metrics collection
- **Production Ready**: Security middleware, rate limiting, and error handling
- **Comprehensive Testing**: Unit tests and integration tests
- **CI/CD Pipeline**: Automated testing and deployment

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest and Supertest
- **Deployment**: Docker, Render

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB
- Git

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd mern-deployment/backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Seed the database (optional)**
   \`\`\`bash
   npm run seed
   \`\`\`

The API will be available at [http://localhost:5000](http://localhost:5000)

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-api.onrender.com/api`

### Authentication

All protected routes require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update user profile
- `PUT /auth/password` - Change password
- `POST /auth/logout` - Logout user

#### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get single user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)
- `GET /users/stats/overview` - User statistics (Admin only)

#### Deployments
- `GET /deployments` - Get user's deployments
- `GET /deployments/:id` - Get single deployment
- `POST /deployments` - Create new deployment
- `PUT /deployments/:id` - Update deployment
- `DELETE /deployments/:id` - Delete deployment
- `POST /deployments/:id/deploy` - Trigger deployment
- `GET /deployments/:id/logs` - Get deployment logs
- `POST /deployments/:id/health-check` - Perform health check

#### Metrics
- `GET /metrics/:deploymentId` - Get deployment metrics
- `GET /metrics/:deploymentId/aggregated` - Get aggregated metrics
- `POST /metrics/:deploymentId` - Create new metric
- `GET /metrics/:deploymentId/trends` - Get metric trends
- `GET /metrics/system/current` - Get current system metrics

#### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

## 🗄️ Database Schema

### User Model
- Personal information (name, email, password)
- Role-based permissions (user, developer, admin)
- Account security (login attempts, account locking)
- User preferences and settings

### Deployment Model
- Project information and repository details
- Service status (frontend, backend, database)
- Deployment metrics and health checks
- Configuration and environment variables
- Deployment logs and history

### Metric Model
- Performance metrics (response time, error rate, etc.)
- System metrics (CPU, memory, disk usage)
- Time-series data with automatic cleanup
- Aggregation and trend analysis

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Account locking after failed attempts
- Password strength requirements

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Environment variable protection
- Secure cookie settings

## 🧪 Testing

### Run Tests
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
\`\`\`

## 🚀 Deployment

### Environment Variables

Required environment variables for production:

\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
\`\`\`

### Docker Deployment

1. **Build Docker image**
   \`\`\`bash
   docker build -t mern-backend .
   \`\`\`

2. **Run container**
   \`\`\`bash
   docker run -p 5000:5000 --env-file .env mern-backend
   \`\`\`

### Render Deployment

1. **Connect GitHub repository** to Render
2. **Set environment variables** in Render dashboard
3. **Configure build and start commands**:
   - Build Command: `npm install`
   - Start Command: `npm start`

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics collection
- Error tracking and logging
- Database connection monitoring

### System Metrics
- CPU and memory usage
- Request/response times
- Error rates and status codes
- Database query performance

## 🔧 Scripts

\`\`\`bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Database
npm run seed        # Seed database with sample data
npm run migrate     # Run database migrations

# Testing
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
