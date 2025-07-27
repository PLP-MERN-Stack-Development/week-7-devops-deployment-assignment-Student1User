# MERN Deployment Frontend

A professional Next.js 14 frontend application for deployment monitoring and management.

## 🚀 Features

- **Professional Dashboard**: Real-time deployment monitoring
- **Advanced UI/UX**: Glassmorphism design with animations
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Code splitting and lazy loading
- **TypeScript**: Full type safety
- **Production Ready**: Optimized builds and deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on port 5000

### Installation
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📚 Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
\`\`\`

## 🌐 Environment Variables

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

## 🏗️ Project Structure

\`\`\`
frontend/
├── app/                 # Next.js 14 App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main dashboard
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Custom components
├── lib/               # Utility functions
└── public/            # Static assets
\`\`\`

## 🎨 UI Components

The application uses shadcn/ui components for consistent design:

- **Button**: Interactive buttons with variants
- **Card**: Content containers
- **Badge**: Status indicators
- **Tabs**: Navigation tabs
- **Alert**: Notification messages
- **Progress**: Progress indicators

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## ⚡ Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Caching**: Static asset caching
- **Compression**: Gzip/Brotli compression

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment
\`\`\`bash
npm run build
npm run start
\`\`\`

## 🔧 Development

### Adding New Components
\`\`\`bash
# Add shadcn/ui component
npx shadcn@latest add [component-name]
\`\`\`

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📄 License

MIT License - see LICENSE file for details.
