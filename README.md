# 🚛 FleetTracker Pro

**Comprehensive Driver Tracking SaaS Application for Indonesian Fleet Management**

[![Go Version](https://img.shields.io/badge/Go-1.21+-blue.svg)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Overview

FleetTracker Pro is a comprehensive SaaS application designed specifically for Indonesian logistics companies and fleet operators. The platform provides real-time GPS tracking, driver behavior analysis, and operational efficiency through advanced analytics and reporting.

### 🌟 Key Features

- **📍 Real-Time GPS Tracking** - 30-second update intervals with 99.5% accuracy
- **👨‍💼 Driver Behavior Monitoring** - Comprehensive scoring system (0-100 scale)
- **⛽ Fuel Consumption Analytics** - Advanced tracking with IDR cost analysis
- **🗺️ ETA Prediction & Route Optimization** - AI-powered route suggestions
- **💳 Indonesian Payment Integration** - QRIS, GoPay, OVO, DANA support
- **🌏 Multi-language Support** - Bahasa Indonesia & English
- **📊 Advanced Analytics** - Custom reports and compliance tracking

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Go (Golang)** - High-performance backend with excellent concurrency
- **PostgreSQL 18** - Robust database with PostGIS for geospatial data
- **TimescaleDB** - Time-series data optimization for GPS tracking
- **Gin Framework** - Lightweight, fast HTTP web framework
- **JWT Authentication** - Stateless, scalable authentication

#### Frontend
- **Vite + TypeScript** - Modern build tool with type safety
- **TanStack Query** - Powerful server state management
- **Better Auth** - Modern authentication with excellent TypeScript support
- **TailwindCSS** - Utility-first CSS framework
- **React Leaflet** - Interactive maps for fleet visualization

#### Infrastructure
- **Docker** - Containerized deployment
- **Redis** - Caching and session storage
- **WebSocket** - Real-time GPS updates
- **Indonesian Cloud Providers** - Data residency compliance

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│                 │    │                 │    │                 │
│ Vite + TS       │◄──►│ Go + Gin        │◄──►│ PostgreSQL 18   │
│ TanStack Query  │    │ JWT Auth        │    │ PostGIS         │
│ Better Auth     │    │ WebSocket       │    │ TimescaleDB     │
│ TailwindCSS     │    │ REST APIs       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │  External APIs  │             │
         │              │                 │             │
         └──────────────┤ Google Maps     │─────────────┘
                        │ QRIS Payment    │
                        │ WhatsApp API    │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Go 1.21+** - [Download](https://golang.org/dl/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 18+** with PostGIS - [Download](https://www.postgresql.org/download/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tobangado69/fleettracker-pro.git
   cd fleettracker-pro
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit with your configuration
   nano backend/.env
   nano frontend/.env
   ```

3. **Start with Docker Compose (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

4. **Manual Setup (Development)**
   ```bash
   # Start database
   docker-compose up -d postgres redis
   
   # Backend setup
   cd backend
   go mod download
   go run cmd/server/main.go
   
   # Frontend setup (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Database**: localhost:5432 (postgres/fleettracker)

## 📁 Project Structure

```
fleettracker-pro/
├── backend/               # Go backend application
│   ├── cmd/server/        # Application entry point
│   ├── internal/          # Private application code
│   │   ├── auth/          # Authentication service
│   │   ├── vehicle/       # Vehicle management
│   │   ├── tracking/      # GPS tracking service
│   │   ├── driver/        # Driver management
│   │   └── common/        # Shared utilities
│   ├── pkg/               # Public library code
│   ├── migrations/        # Database migrations
│   └── docs/              # API documentation
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── stores/        # State management
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── docs/                  # Project documentation
│   ├── PRD.md             # Product Requirements Document
│   └── technical-implementation-guide.md
├── specs/                 # SDD specifications
├── docker-compose.yml     # Development environment
├── Dockerfile             # Production container
└── README.md              # This file
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Install dependencies
go mod download

# Run tests
go test ./...

# Run with hot reload (install air first)
go install github.com/cosmtrek/air@latest
air

# Generate API documentation
swag init -g cmd/server/main.go
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Type checking
npm run type-check
```

### Database Management

```bash
# Run migrations
cd backend
go run cmd/migrate/main.go up

# Create new migration
go run cmd/migrate/main.go create add_new_table

# Rollback migration
go run cmd/migrate/main.go down 1
```

## 🌏 Indonesian Market Features

### Payment Integration
- **QRIS** - Indonesian standardized QR payment
- **Bank Transfer** - BCA, Mandiri, BNI, BRI integration
- **E-Wallet** - GoPay, OVO, DANA, ShopeePay support

### Localization
- **Currency** - Indonesian Rupiah (IDR) with proper formatting
- **Language** - Bahasa Indonesia with English fallback
- **Timezone** - WIB/WITA/WIT support
- **Phone Numbers** - Indonesian phone number validation

### Compliance
- **Data Residency** - All data stored within Indonesia
- **Transportation Regulations** - Ministry of Transportation compliance
- **Labor Laws** - Driver working hours tracking
- **Privacy Laws** - Indonesian data protection compliance

## 📊 Performance Targets

- **API Response Time**: < 200ms (95th percentile)
- **GPS Data Processing**: < 30 seconds
- **Frontend Loading**: < 3 seconds
- **Database Queries**: Optimized with proper indexing
- **WebSocket Stability**: > 99% uptime
- **System Availability**: 99.9% SLA

## 🔐 Security

- **Authentication**: Multi-factor authentication for admin users
- **Data Encryption**: AES-256 encryption at rest and in transit
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Complete audit trail for all actions
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting and DDoS protection

## 🧪 Testing

```bash
# Backend tests
cd backend
go test -v ./...

# Frontend tests
cd frontend
npm run test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

```bash
# Build production images
docker build -t fleettracker/backend:latest ./backend
docker build -t fleettracker/frontend:latest ./frontend

# Deploy to Indonesian cloud provider
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods -l app=fleettracker
```

### Environment Configuration

- **Development**: Local development with Docker Compose
- **Staging**: Staging environment for testing
- **Production**: Indonesian cloud deployment with data residency

## 📈 Monitoring & Observability

- **Metrics**: Prometheus + Grafana dashboards
- **Logging**: Structured logging with ELK stack
- **Tracing**: Distributed tracing with Jaeger
- **Health Checks**: Kubernetes health and readiness probes
- **Alerts**: Critical system alerts via WhatsApp/SMS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Go best practices and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure Indonesian market requirements are met
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/tobangado69/fleettracker-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tobangado69/fleettracker-pro/discussions)
- **Email**: support@fleettracker.id

## 🏆 Success Metrics

### Business Impact
- **25% reduction** in fuel consumption within 6 months
- **30% improvement** in delivery time accuracy
- **20% decrease** in vehicle maintenance costs
- **95% user satisfaction** rating
- **40% reduction** in unauthorized vehicle usage

### Technical Metrics
- **99.5% GPS data accuracy**
- **99.9% system uptime**
- **<2 second** dashboard load time
- **<30 second** real-time update latency

---

**Built with ❤️ for Indonesian Fleet Management**

*FleetTracker Pro - Real-Time Visibility, Data-Driven Insights*
