# Technical Implementation Guide
## Driver Tracking SaaS Application

> **⚠️ DEPRECATION NOTICE**  
> This combined Technical Guide has been **split into separate documents** for better organization:
> - **Backend Technical Guide**: [docs/backend/technical-implementation-guide.md](backend/technical-implementation-guide.md) - Go + PostgreSQL implementation
> - **Frontend Technical Guide**: [docs/frontend/technical-implementation-guide.md](frontend/technical-implementation-guide.md) - React + TypeScript implementation
> - **Navigation**: [docs/README.md](README.md) - Documentation index
>
> **Please use the new structure for all future updates.**  
> This document is kept for reference only.

### Document Information
- **Project Name**: FleetTracker Pro
- **Version**: 1.0
- **Last Updated**: October 10, 2025 (Deprecated)
- **Technology Stack**: ~~Go + PostgreSQL + Vite + TypeScript + TanStack Query + Better Auth~~ **ARCHIVED - See new structure above**
- **Architecture**: Monolithic with Separated Frontend/Backend
- **Target Platform**: Web & Mobile (Indonesian Market)
- **GPS Strategy**: Mobile Device GPS (Smartphone-based tracking)
- **Backend Status**: ✅ **100% Complete** (Production-Ready) → See [Backend Tech Guide](backend/technical-implementation-guide.md)
- **Frontend Status**: 🚧 **In Planning** (Starting Development) → See [Frontend Tech Guide](frontend/technical-implementation-guide.md)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│                 │    │                 │    │                 │
│ Vite + TS       │◄──►│ Go + Gin        │◄──►│ PostgreSQL 18   │
│ TanStack Query  │    │ JWT Auth        │    │ (Mobile GPS     │
│ Better Auth     │    │ WebSocket       │    │  Optimized)     │
│ TailwindCSS     │    │ REST APIs       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │  External APIs  │             │
         │              │                 │             │
         └──────────────┤ Google Maps     │─────────────┘
                        │ QRIS Payment    │
                        │ WhatsApp API    │
                        │ Mobile GPS APIs │
                        └─────────────────┘
```

### 1.2 Technology Stack Justification

#### Backend Stack
- **Go (Golang)**: Chosen for high performance, excellent concurrency handling, and strong typing
- **PostgreSQL 18**: Robust ACID compliance, optimized for mobile GPS data storage
- **JWT Authentication**: Stateless, scalable authentication suitable for SaaS applications
- **Gin Framework**: Lightweight, fast HTTP web framework for Go

#### Frontend Stack
- **Vite**: Fast build tool with excellent TypeScript support and hot reload
- **TypeScript**: Type safety and better developer experience
- **TanStack Query**: Powerful data synchronization for server state management
- **Better Auth**: Modern, framework-agnostic authentication with excellent TypeScript support
- **TailwindCSS**: Utility-first CSS framework for rapid UI development

---

## 2. Database Design & Schema

### 2.1 Core Database Schema

#### 2.1.1 Users & Authentication Tables

```sql
-- Users table with Better Auth compatibility
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'driver',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    profile_image TEXT,
    language VARCHAR(10) DEFAULT 'id'
);

-- Sessions table for Better Auth
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table for multi-tenancy
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'
);
```

#### 2.1.2 Fleet Management Tables

```sql
-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    license_plate VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vehicle_type VARCHAR(50) NOT NULL,
    fuel_capacity DECIMAL(8,2),
    device_id VARCHAR(100), -- GPS device identifier
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, license_plate)
);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE,
    experience_years INTEGER,
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 2.1.3 GPS Tracking & Location Tables

```sql
-- Install PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- GPS tracking data (optimized for time-series)
CREATE TABLE gps_tracks (
    id BIGSERIAL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    location GEOMETRY(POINT, 4326) NOT NULL, -- PostGIS point
    speed DECIMAL(5,2), -- km/h
    heading INTEGER, -- degrees 0-360
    altitude DECIMAL(8,2), -- meters
    accuracy DECIMAL(5,2), -- meters
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (vehicle_id, timestamp)
);

-- Convert to TimescaleDB hypertable for better time-series performance
SELECT create_hypertable('gps_tracks', 'timestamp', 'vehicle_id', 4);

-- Create indexes for common queries
CREATE INDEX idx_gps_tracks_vehicle_time ON gps_tracks (vehicle_id, timestamp DESC);
CREATE INDEX idx_gps_tracks_location ON gps_tracks USING GIST (location);
CREATE INDEX idx_gps_tracks_speed ON gps_tracks (speed) WHERE speed > 80; -- Speed violations
```

#### 2.1.4 Trip Management Tables

```sql
-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    start_location GEOMETRY(POINT, 4326),
    end_location GEOMETRY(POINT, 4326),
    planned_route GEOMETRY(LINESTRING, 4326),
    actual_route GEOMETRY(LINESTRING, 4326),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    distance_km DECIMAL(8,2),
    fuel_consumed DECIMAL(6,2),
    status VARCHAR(20) DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver behavior events
CREATE TABLE driver_events (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    trip_id UUID REFERENCES trips(id),
    event_type VARCHAR(50) NOT NULL, -- 'harsh_braking', 'speeding', 'rapid_acceleration'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    location GEOMETRY(POINT, 4326),
    speed_at_event DECIMAL(5,2),
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB, -- Additional event-specific data
    
    INDEX (driver_id, timestamp),
    INDEX (event_type, timestamp)
);
```

### 2.2 Database Optimization Strategies

#### 2.2.1 Partitioning Strategy
```sql
-- Partition gps_tracks by month for better performance
CREATE TABLE gps_tracks_template (LIKE gps_tracks INCLUDING DEFAULTS INCLUDING CONSTRAINTS);

-- Create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I 
                   FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

#### 2.2.2 Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_trips_company_status_time ON trips (company_id, status, start_time DESC);
CREATE INDEX idx_driver_events_driver_type_time ON driver_events (driver_id, event_type, timestamp DESC);

-- Partial indexes for active records only
CREATE INDEX idx_vehicles_active ON vehicles (company_id) WHERE status = 'active';
CREATE INDEX idx_drivers_active ON drivers (company_id) WHERE is_active = true;

-- GIN index for JSONB fields
CREATE INDEX idx_companies_settings ON companies USING GIN (settings);
CREATE INDEX idx_driver_events_metadata ON driver_events USING GIN (metadata);
```

---

## 3. Backend Implementation

### 3.1 Project Structure
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── middleware.go
│   ├── vehicle/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── tracking/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── websocket.go
│   │   └── repository.go
│   ├── driver/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   └── common/
│       ├── database/
│       ├── middleware/
│       ├── utils/
│       └── config/
├── pkg/
│   ├── models/
│   ├── types/
│   └── errors/
├── migrations/
└── docs/
```

### 3.2 Core Backend Components

#### 3.2.1 Main Application Setup
```go
// cmd/server/main.go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    
    "fleettracker/internal/auth"
    "fleettracker/internal/tracking"
    "fleettracker/internal/vehicle"
    "fleettracker/internal/common/database"
    "fleettracker/internal/common/config"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found")
    }

    // Initialize configuration
    cfg := config.Load()

    // Initialize database
    db, err := database.Connect(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Initialize Gin router
    r := gin.New()
    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    // CORS configuration for Indonesian domains
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173", cfg.FrontendURL},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:          12 * time.Hour,
    }))

    // Initialize services
    authService := auth.NewService(db, cfg.JWTSecret)
    trackingService := tracking.NewService(db)
    vehicleService := vehicle.NewService(db)

    // Initialize handlers
    authHandler := auth.NewHandler(authService)
    trackingHandler := tracking.NewHandler(trackingService)
    vehicleHandler := vehicle.NewHandler(vehicleService)

    // Setup routes
    setupRoutes(r, authHandler, trackingHandler, vehicleHandler)

    // Setup WebSocket for real-time tracking
    setupWebSocket(r, trackingService)

    // Start server
    srv := &http.Server{
        Addr:    ":" + cfg.Port,
        Handler: r,
    }

    // Graceful shutdown
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("listen: %s\n", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exiting")
}
```

#### 3.2.2 JWT Authentication Implementation (Invite-Only System)

**Security Model**: FleetTracker Pro uses an **invite-only** authentication system with no public registration.

**Initial Setup**:
```bash
# Super-admin created via database seed
make seed

# Credentials:
# Email: admin@fleettracker.id
# Password: ChangeMe123!
# Must change password on first login
```

**Implementation**:
```go
// internal/auth/service.go
package auth

import (
    "crypto/rand"
    "encoding/base64"
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    
    "fleettracker/pkg/models"
)

type Service struct {
    db        *gorm.DB
    redis     *redis.Client
    jwtSecret []byte
}

type Claims struct {
    UserID    string `json:"user_id"`
    CompanyID string `json:"company_id"`
    Role      string `json:"role"`
    jwt.RegisteredClaims
}

type UserResponse struct {
    ID                 string `json:"id"`
    Email              string `json:"email"`
    Role               string `json:"role"`
    MustChangePassword bool   `json:"must_change_password"` // NEW: Force password change flag
    // ... other fields
}

func NewService(db *gorm.DB, redis *redis.Client, jwtSecret string) *Service {
    return &Service{
        db:        db,
        redis:     redis,
        jwtSecret: []byte(jwtSecret),
    }
}

// Login returns user data with must_change_password flag
func (s *Service) Login(email, password string) (*UserResponse, *TokenResponse, error) {
    var user models.User
    if err := s.db.Where("email = ? AND is_active = true", email).First(&user).Error; err != nil {
        return nil, nil, errors.New("invalid credentials")
    }

    // Check if account is locked
    if user.IsAccountLocked() {
        return nil, nil, errors.New("account locked due to failed login attempts")
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        user.IncrementFailedAttempts()
        s.db.Save(&user)
        return nil, nil, errors.New("invalid credentials")
    }

    // Reset failed attempts on successful login
    user.ResetFailedAttempts()
    user.UpdateLastLogin()
    s.db.Save(&user)

    // Generate JWT tokens
    tokens, err := s.generateTokens(&user)
    if err != nil {
        return nil, nil, err
    }

    // Return user response with must_change_password flag
    userResponse := &UserResponse{
        ID:                 user.ID,
        Email:              user.Email,
        Role:               user.Role,
        MustChangePassword: user.MustChangePassword, // ⚠️ Frontend uses this!
    }

    return userResponse, tokens, nil
}

func (s *Service) generateToken(user *models.User) (string, error) {
    claims := Claims{
        UserID:    user.ID,
        CompanyID: user.CompanyID,
        Role:      user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "fleettracker",
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.jwtSecret)
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return s.jwtSecret, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, errors.New("invalid token")
}

// generateTemporaryPassword creates crypto-secure random password for user invitations
func generateTemporaryPassword() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    password := base64.URLEncoding.EncodeToString(b)[:16]
    return password + "!Aa1", nil // Add complexity characters
}

// CreateUser creates new user with temporary password (invite-only)
func (s *Service) CreateUser(req CreateUserRequest, creatorRole string) (*models.User, error) {
    // Generate temporary password if not provided
    password := req.Password
    var tempPassword string
    if password == "" {
        tempPass, err := generateTemporaryPassword()
        if err != nil {
            return nil, err
        }
        password = tempPass
        tempPassword = tempPass
    }

    // Hash password
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

    // Create user with must_change_password = true
    user := &models.User{
        Email:              req.Email,
        FirstName:          req.FirstName,
        LastName:           req.LastName,
        Role:               req.Role,
        Password:           string(hashedPassword),
        IsActive:           true,
        MustChangePassword: true, // Force password change on first login
    }

    s.db.Create(user)

    // Send invitation email (logged to console for now)
    if tempPassword != "" {
        log.Printf("📧 Invitation: %s - Temp Password: %s", user.Email, tempPassword)
    }

    return user, nil
}
```

**Force Password Change Middleware**:
```go
// internal/auth/middleware.go
func CheckPasswordChangeRequired(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, exists := c.Get("user_id")
        if !exists {
            c.Next()
            return
        }

        var user models.User
        db.First(&user, "id = ?", userID)

        // If user must change password, block access except to specific endpoints
        if user.MustChangePassword {
            allowedPaths := []string{
                "/api/v1/auth/change-password",
                "/api/v1/auth/logout",
                "/api/v1/auth/profile",
            }

            if !contains(allowedPaths, c.Request.URL.Path) {
                c.JSON(403, gin.H{
                    "error": "password_change_required",
                    "message": "You must change your password before accessing this resource",
                })
                c.Abort()
                return
            }
        }

        c.Next()
    }
}
```

**Usage in Main**:
```go
// cmd/server/main.go
protected := r.Group("/api/v1")
protected.Use(authMiddleware.RequireAuth())
protected.Use(authMiddleware.CheckPasswordChangeRequired(db)) // ⚠️ Force password change

// Now all protected routes require authentication + password change
protected.GET("/vehicles", vehicleHandler.List)
protected.GET("/drivers", driverHandler.List)
// etc...
```

#### 3.2.3 Invite-Only User Management System

**Overview**: FleetTracker Pro uses an invite-only system with no public registration for enhanced B2B SaaS security.

**User Creation Flow**:

```
Super-Admin (Seed) → Create Company → Create Owner
        ↓
Owner/Admin → Invite User → Generate Temp Password → Email Invitation
        ↓
New User → Login → Force Password Change → Full Access
```

**Database Schema Updates**:
```sql
-- Migration 007: Password change tracking
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_password_change TIMESTAMPTZ;
CREATE INDEX idx_users_must_change_password ON users(must_change_password) 
  WHERE must_change_password = true;
```

**Super-Admin Seed**:
```go
// seeds/super_admin.go
func SeedSuperAdmin(db *gorm.DB) error {
    // Check if super-admin exists
    var count int64
    db.Model(&models.User{}).Where("role = ?", "super-admin").Count(&count)
    if count > 0 {
        return nil // Already exists
    }

    // Create super-admin
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("ChangeMe123!"), bcrypt.DefaultCost)
    
    superAdmin := models.User{
        Email:              "admin@fleettracker.id",
        Username:           "superadmin",
        FirstName:          "Super",
        LastName:           "Administrator",
        Role:               "super-admin",
        Password:           string(hashedPassword),
        IsActive:           true,
        MustChangePassword: true,
    }

    db.Create(&superAdmin)
    
    log.Println("✅ Super-admin created: admin@fleettracker.id / ChangeMe123!")
    return nil
}
```

**User Invitation with Temporary Password**:
```go
// internal/auth/user_service.go
func (s *Service) CreateUser(req CreateUserRequest) (*models.User, error) {
    // Generate temporary password if not provided
    if req.Password == "" {
        tempPass, _ := generateTemporaryPassword()
        req.Password = tempPass
        
        // Log temporary password (email service integration TODO)
        log.Printf("📧 Invitation: %s - Temp Password: %s", req.Email, tempPass)
    }

    // Hash password
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

    // Create user with must_change_password = true
    user := &models.User{
        Email:              req.Email,
        FirstName:          req.FirstName,
        LastName:           req.LastName,
        Role:               req.Role,
        Password:           string(hashedPassword),
        MustChangePassword: true, // Force password change on first login
        IsActive:           true,
    }

    s.db.Create(user)
    return user, nil
}
```

**Deprecated Public Registration**:
```go
// internal/auth/handler.go
// @Deprecated
func (h *Handler) Register(c *gin.Context) {
    c.JSON(http.StatusGone, gin.H{
        "error": "endpoint_deprecated",
        "message": "Public registration no longer supported. Contact your administrator.",
        "how_to_get_access": "Contact your company administrator or support@fleettracker.id",
    })
}
```

**Setup Instructions**:
```bash
# 1. Run migration
make migrate-up

# 2. Seed super-admin
make seed
# Output: admin@fleettracker.id / ChangeMe123!

# 3. Login
POST /api/v1/auth/login
{"email": "admin@fleettracker.id", "password": "ChangeMe123!"}
# Response: {"must_change_password": true}

# 4. Change password (required)
PUT /api/v1/auth/change-password
{"current_password": "ChangeMe123!", "new_password": "NewSecure123!"}

# 5. Create users
POST /api/v1/users
{"email": "user@company.com", "first_name": "John", "last_name": "Doe", "role": "admin"}
# Temp password logged to console
```

#### 3.2.4 Real-Time GPS Tracking Service
```go
// internal/tracking/service.go
package tracking

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/gorilla/websocket"
    "gorm.io/gorm"
    
    "fleettracker/pkg/models"
)

type Service struct {
    db      *gorm.DB
    clients map[string]*websocket.Conn
}

type GPSData struct {
    VehicleID string    `json:"vehicle_id"`
    DriverID  string    `json:"driver_id"`
    Latitude  float64   `json:"latitude"`
    Longitude float64   `json:"longitude"`
    Speed     float64   `json:"speed"`
    Heading   int       `json:"heading"`
    Timestamp time.Time `json:"timestamp"`
}

func NewService(db *gorm.DB) *Service {
    return &Service{
        db:      db,
        clients: make(map[string]*websocket.Conn),
    }
}

func (s *Service) ProcessGPSData(data GPSData) error {
    // Save to database
    track := models.GPSTrack{
        VehicleID: data.VehicleID,
        DriverID:  data.DriverID,
        Location:  fmt.Sprintf("POINT(%f %f)", data.Longitude, data.Latitude),
        Speed:     data.Speed,
        Heading:   data.Heading,
        Timestamp: data.Timestamp,
    }

    if err := s.db.Create(&track).Error; err != nil {
        return err
    }

    // Analyze for violations
    go s.analyzeDriverBehavior(data)

    // Broadcast to connected clients
    go s.broadcastToClients(data)

    return nil
}

func (s *Service) analyzeDriverBehavior(data GPSData) {
    // Check for speed violations
    var vehicle models.Vehicle
    if err := s.db.First(&vehicle, "id = ?", data.VehicleID).Error; err != nil {
        return
    }

    // Indonesian highway speed limit is typically 100 km/h
    if data.Speed > 100 {
        event := models.DriverEvent{
            VehicleID:     data.VehicleID,
            DriverID:      data.DriverID,
            EventType:     "speeding",
            Severity:      getSeverity(data.Speed),
            Location:      fmt.Sprintf("POINT(%f %f)", data.Longitude, data.Latitude),
            SpeedAtEvent:  data.Speed,
            Timestamp:     data.Timestamp,
        }

        s.db.Create(&event)
    }

    // Additional behavior analysis logic...
}

func (s *Service) GetVehicleHistory(vehicleID string, from, to time.Time) ([]models.GPSTrack, error) {
    var tracks []models.GPSTrack
    err := s.db.Where("vehicle_id = ? AND timestamp BETWEEN ? AND ?", 
        vehicleID, from, to).
        Order("timestamp DESC").
        Find(&tracks).Error

    return tracks, err
}
```

#### 3.2.4 Database Repository Pattern
```go
// internal/vehicle/repository.go
package vehicle

import (
    "gorm.io/gorm"
    "fleettracker/pkg/models"
)

type Repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{db: db}
}

func (r *Repository) GetByCompany(companyID string) ([]models.Vehicle, error) {
    var vehicles []models.Vehicle
    err := r.db.Where("company_id = ? AND status = 'active'", companyID).
        Preload("AssignedDriver").
        Find(&vehicles).Error
    
    return vehicles, err
}

func (r *Repository) Create(vehicle *models.Vehicle) error {
    return r.db.Create(vehicle).Error
}

func (r *Repository) Update(id string, updates map[string]interface{}) error {
    return r.db.Model(&models.Vehicle{}).Where("id = ?", id).Updates(updates).Error
}

func (r *Repository) GetWithCurrentLocation(vehicleID string) (*models.VehicleWithLocation, error) {
    var result models.VehicleWithLocation
    
    query := `
        SELECT v.*, 
               ST_X(gt.location) as current_lng,
               ST_Y(gt.location) as current_lat,
               gt.speed as current_speed,
               gt.timestamp as last_update
        FROM vehicles v
        LEFT JOIN LATERAL (
            SELECT location, speed, timestamp
            FROM gps_tracks
            WHERE vehicle_id = v.id
            ORDER BY timestamp DESC
            LIMIT 1
        ) gt ON true
        WHERE v.id = ?
    `
    
    err := r.db.Raw(query, vehicleID).Scan(&result).Error
    return &result, err
}
```

---

## 4. Frontend Implementation

### 4.1 Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── maps/
│   │   └── charts/
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── fleet/
│   │   ├── drivers/
│   │   └── reports/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── styles/
├── public/
└── package.json
```

### 4.2 Frontend Core Components

#### 4.2.1 Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

#### 4.2.2 TanStack Query Setup
```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false
        return failureCount < 3
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

#### 4.2.3 Better Auth Configuration
```typescript
// src/lib/auth.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
```

#### 4.2.4 API Service Layer
```typescript
// src/services/api.ts
import axios from 'axios'
import { authClient } from '@/lib/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await authClient.getSession()
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authClient.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

#### 4.2.5 Real-Time Fleet Map Component
```typescript
// src/components/maps/FleetMap.tsx
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { Icon } from 'leaflet'
import { vehicleService } from '@/services/vehicleService'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Vehicle {
  id: string
  licensePlate: string
  currentLat: number
  currentLng: number
  currentSpeed: number
  status: 'moving' | 'idle' | 'offline'
  driverName?: string
}

const FleetMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Fetch initial vehicle positions
  const { data: initialVehicles } = useQuery({
    queryKey: ['vehicles', 'positions'],
    queryFn: vehicleService.getAllWithPositions,
    refetchInterval: 30000, // Fallback polling every 30 seconds
  })

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket('/ws/tracking', {
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'gps_update') {
        updateVehiclePosition(data.vehicle_id, data)
      }
    },
  })

  const updateVehiclePosition = (vehicleId: string, update: any) => {
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, ...update }
          : vehicle
      )
    )
  }

  // Initialize vehicles from query
  useEffect(() => {
    if (initialVehicles) {
      setVehicles(initialVehicles)
    }
  }, [initialVehicles])

  const getVehicleIcon = (status: string) => {
    const color = status === 'moving' ? 'green' : 
                  status === 'idle' ? 'orange' : 'red'
    
    return new Icon({
      iconUrl: `/icons/vehicle-${color}.png`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[-6.2088, 106.8456]} // Jakarta coordinates
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.currentLat, vehicle.currentLng]}
            icon={getVehicleIcon(vehicle.status)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{vehicle.licensePlate}</h3>
                <p>Driver: {vehicle.driverName || 'Tidak ada'}</p>
                <p>Kecepatan: {vehicle.currentSpeed} km/h</p>
                <p>Status: {vehicle.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default FleetMap
```

#### 4.2.6 Dashboard Analytics Component
```typescript
// src/components/dashboard/DashboardStats.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Users, Fuel, AlertTriangle } from 'lucide-react'
import { dashboardService } from '@/services/dashboardService'

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 60000, // Update every minute
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const statCards = [
    {
      title: 'Total Kendaraan',
      value: stats?.totalVehicles || 0,
      icon: Truck,
      description: `${stats?.activeVehicles || 0} aktif`,
      color: 'blue',
    },
    {
      title: 'Driver Aktif',
      value: stats?.activeDrivers || 0,
      icon: Users,
      description: `${stats?.onDutyDrivers || 0} sedang bertugas`,
      color: 'green',
    },
    {
      title: 'Konsumsi BBM Hari Ini',
      value: `${stats?.todayFuelConsumption || 0} L`,
      icon: Fuel,
      description: `Rp ${(stats?.todayFuelCost || 0).toLocaleString('id-ID')}`,
      color: 'orange',
    },
    {
      title: 'Pelanggaran Hari Ini',
      value: stats?.todayViolations || 0,
      icon: AlertTriangle,
      description: `${stats?.speedingViolations || 0} kelebihan kecepatan`,
      color: 'red',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats
```

---

## 5. WebSocket Implementation for Real-Time Updates

### 5.1 Backend WebSocket Handler
```go
// internal/tracking/websocket.go
package tracking

import (
    "encoding/json"
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Configure properly for production
    },
}

type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
}

type Client struct {
    hub      *Hub
    conn     *websocket.Conn
    send     chan []byte
    companyID string
}

func NewHub() *Hub {
    return &Hub{
        broadcast:  make(chan []byte),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        clients:    make(map[*Client]bool),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true
            log.Printf("Client connected: %s", client.companyID)

        case client := <-h.unregister:
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
                log.Printf("Client disconnected: %s", client.companyID)
            }

        case message := <-h.broadcast:
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
        }
    }
}

func (s *Service) HandleWebSocket(c *gin.Context) {
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Println("WebSocket upgrade failed:", err)
        return
    }

    // Get company ID from JWT token
    companyID := c.GetString("company_id")
    
    client := &Client{
        hub:       s.hub,
        conn:      conn,
        send:      make(chan []byte, 256),
        companyID: companyID,
    }

    client.hub.register <- client

    go client.writePump()
    go client.readPump()
}
```

### 5.2 Frontend WebSocket Hook
```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  shouldReconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = options.reconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = () => {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = (event) => {
        setReadyState(WebSocket.OPEN)
        reconnectAttemptsRef.current = 0
        options.onOpen?.(event)
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
        options.onMessage?.(event)
      }

      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED)
        options.onClose?.(event)

        // Attempt to reconnect
        if (options.shouldReconnect !== false && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (event) => {
        setReadyState(WebSocket.CLOSED)
        options.onError?.(event)
      }

      setSocket(ws)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      socket?.close()
    }
  }, [url])

  const sendMessage = (message: string | object) => {
    if (socket && readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(data)
    }
  }

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage,
  }
}
```

---

## 6. Payment Integration (Indonesian Market)

### 6.1 QRIS Payment Integration
```go
// internal/payment/qris.go
package payment

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type QRISService struct {
    merchantID string
    apiKey     string
    baseURL    string
}

type QRISPaymentRequest struct {
    Amount      int64  `json:"amount"`
    Currency    string `json:"currency"`
    OrderID     string `json:"order_id"`
    Description string `json:"description"`
    CallbackURL string `json:"callback_url"`
}

type QRISPaymentResponse struct {
    QRString    string `json:"qr_string"`
    PaymentID   string `json:"payment_id"`
    ExpiryTime  string `json:"expiry_time"`
    Status      string `json:"status"`
}

func NewQRISService(merchantID, apiKey, baseURL string) *QRISService {
    return &QRISService{
        merchantID: merchantID,
        apiKey:     apiKey,
        baseURL:    baseURL,
    }
}

func (s *QRISService) CreatePayment(req QRISPaymentRequest) (*QRISPaymentResponse, error) {
    // Convert amount to IDR minor units (Rupiah doesn't have cents)
    req.Currency = "IDR"
    
    jsonData, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }

    httpReq, err := http.NewRequest("POST", s.baseURL+"/payments", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)

    client := &http.Client{Timeout: 30 * time.Second}
    resp, err := client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result QRISPaymentResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}
```

### 6.2 Subscription Management
```go
// internal/subscription/service.go
package subscription

import (
    "time"
    "gorm.io/gorm"
    "fleettracker/pkg/models"
)

type Service struct {
    db          *gorm.DB
    qrisService *payment.QRISService
}

type SubscriptionPlan struct {
    Name         string
    PricePerVehicle int64 // in IDR
    MaxVehicles     int
    Features        []string
}

var Plans = map[string]SubscriptionPlan{
    "starter": {
        Name:            "Starter",
        PricePerVehicle: 50000, // IDR 50,000
        MaxVehicles:     10,
        Features:        []string{"basic_tracking", "simple_reports"},
    },
    "professional": {
        Name:            "Professional", 
        PricePerVehicle: 75000, // IDR 75,000
        MaxVehicles:     100,
        Features:        []string{"advanced_analytics", "driver_scoring", "mobile_app"},
    },
    "enterprise": {
        Name:            "Enterprise",
        PricePerVehicle: 100000, // IDR 100,000
        MaxVehicles:     -1, // unlimited
        Features:        []string{"custom_integrations", "dedicated_support", "advanced_reporting"},
    },
}

func (s *Service) CreateSubscription(companyID string, planName string, vehicleCount int) error {
    plan, exists := Plans[planName]
    if !exists {
        return errors.New("invalid plan")
    }

    // Calculate total amount
    totalAmount := plan.PricePerVehicle * int64(vehicleCount)

    // Create QRIS payment
    paymentReq := payment.QRISPaymentRequest{
        Amount:      totalAmount,
        OrderID:     fmt.Sprintf("SUB_%s_%d", companyID, time.Now().Unix()),
        Description: fmt.Sprintf("FleetTracker %s Plan - %d vehicles", plan.Name, vehicleCount),
        CallbackURL: "https://api.fleettracker.id/webhooks/payment",
    }

    qrisResp, err := s.qrisService.CreatePayment(paymentReq)
    if err != nil {
        return err
    }

    // Store subscription record
    subscription := models.Subscription{
        CompanyID:     companyID,
        PlanName:      planName,
        VehicleCount:  vehicleCount,
        Amount:        totalAmount,
        PaymentID:     qrisResp.PaymentID,
        QRString:      qrisResp.QRString,
        Status:        "pending",
        ExpiresAt:     time.Now().AddDate(0, 1, 0), // 1 month
    }

    return s.db.Create(&subscription).Error
}
```

---

## 7. Deployment & Infrastructure

### 7.1 Docker Configuration
```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080
CMD ["./main"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.2 Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: fleettracker
      POSTGRES_USER: fleettracker
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  timescaledb:
    image: timescale/timescaledb-ha:pg15-latest
    environment:
      POSTGRES_DB: fleettracker_timeseries
      POSTGRES_USER: fleettracker
      POSTGRES_PASSWORD: password123
    ports:
      - "5433:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://fleettracker:password123@postgres:5432/fleettracker?sslmode=disable
      TIMESERIES_URL: postgres://fleettracker:password123@timescaledb:5432/fleettracker_timeseries?sslmode=disable
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-super-secret-jwt-key
      PORT: 8080
    depends_on:
      - postgres
      - timescaledb
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  timescale_data:
  redis_data:
```

### 7.3 Production Deployment (Indonesian Cloud)
```yaml
# k8s-deployment.yml for Indonesian cloud providers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fleettracker-backend
  labels:
    app: fleettracker-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fleettracker-backend
  template:
    metadata:
      labels:
        app: fleettracker-backend
    spec:
      containers:
      - name: backend
        image: fleettracker/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi" 
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 8. Security Implementation

### 8.1 Security Middleware
```go
// internal/middleware/security.go
package middleware

import (
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "golang.org/x/time/rate"
)

// Rate limiting middleware
func RateLimit(requestsPerMinute int) gin.HandlerFunc {
    limiter := rate.NewLimiter(rate.Every(time.Minute/time.Duration(requestsPerMinute)), requestsPerMinute)
    
    return func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(429, gin.H{"error": "Too many requests"})
            c.Abort()
            return
        }
        c.Next()
    }
}

// Security headers middleware
func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        c.Header("Content-Security-Policy", "default-src 'self'")
        c.Next()
    }
}

// Indonesian data residency check
func DataResidencyCheck() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Log all requests for compliance audit
        log.Printf("Request from IP: %s, Path: %s", c.ClientIP(), c.Request.URL.Path)
        c.Next()
    }
}
```

### 8.2 Input Validation & Sanitization
```go
// pkg/validation/validators.go
package validation

import (
    "regexp"
    "strings"
    "unicode"
)

var (
    indonesianPhoneRegex = regexp.MustCompile(`^(\+62|62|0)[0-9]{9,12}$`)
    licensePlateRegex    = regexp.MustCompile(`^[A-Z]{1,2}\s*[0-9]{1,4}\s*[A-Z]{1,3}$`)
)

func ValidateIndonesianPhone(phone string) bool {
    return indonesianPhoneRegex.MatchString(strings.ReplaceAll(phone, " ", ""))
}

func ValidateLicensePlate(plate string) bool {
    return licensePlateRegex.MatchString(strings.ToUpper(plate))
}

func SanitizeString(input string) string {
    // Remove potentially dangerous characters
    cleaned := strings.Map(func(r rune) rune {
        if unicode.IsLetter(r) || unicode.IsNumber(r) || unicode.IsSpace(r) {
            return r
        }
        if strings.ContainsRune(".-_@", r) {
            return r
        }
        return -1
    }, input)
    
    return strings.TrimSpace(cleaned)
}
```

---

## 9. Performance Optimization

### 9.1 Database Query Optimization
```sql
-- Optimized queries for common operations

-- Get active vehicles with latest GPS position (optimized with lateral join)
EXPLAIN ANALYZE
SELECT v.id, v.license_plate, v.status,
       gt.location, gt.speed, gt.timestamp as last_update,
       d.name as driver_name
FROM vehicles v
LEFT JOIN drivers d ON d.assigned_vehicle_id = v.id
LEFT JOIN LATERAL (
    SELECT location, speed, timestamp
    FROM gps_tracks
    WHERE vehicle_id = v.id
    ORDER BY timestamp DESC
    LIMIT 1
) gt ON true
WHERE v.company_id = $1 AND v.status = 'active';

-- Aggregated driver performance query (optimized with window functions)
SELECT driver_id,
       COUNT(*) as total_events,
       AVG(CASE WHEN event_type = 'speeding' THEN 1 ELSE 0 END) * 100 as speeding_percentage,
       AVG(speed_at_event) as avg_speed,
       DATE_TRUNC('day', timestamp) as event_date
FROM driver_events
WHERE driver_id = $1 
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY driver_id, DATE_TRUNC('day', timestamp)
ORDER BY event_date DESC;
```

### 9.2 Caching Strategy
```go
// internal/cache/redis.go
package cache

import (
    "context"
    "encoding/json"
    "time"

    "github.com/go-redis/redis/v8"
)

type Service struct {
    client *redis.Client
}

func NewService(addr, password string) *Service {
    rdb := redis.NewClient(&redis.Options{
        Addr:     addr,
        Password: password,
        DB:       0,
    })

    return &Service{client: rdb}
}

func (s *Service) SetVehiclePosition(vehicleID string, position interface{}) error {
    ctx := context.Background()
    data, err := json.Marshal(position)
    if err != nil {
        return err
    }

    return s.client.Set(ctx, "vehicle:"+vehicleID+":position", data, 5*time.Minute).Err()
}

func (s *Service) GetVehiclePosition(vehicleID string) (interface{}, error) {
    ctx := context.Background()
    data, err := s.client.Get(ctx, "vehicle:"+vehicleID+":position").Result()
    if err != nil {
        return nil, err
    }

    var position interface{}
    err = json.Unmarshal([]byte(data), &position)
    return position, err
}

// Cache frequently accessed company settings
func (s *Service) CacheCompanySettings(companyID string, settings interface{}) error {
    ctx := context.Background()
    data, err := json.Marshal(settings)
    if err != nil {
        return err
    }

    return s.client.Set(ctx, "company:"+companyID+":settings", data, 1*time.Hour).Err()
}
```

---

## 10. Testing Strategy

### 10.1 Backend Testing
```go
// internal/vehicle/service_test.go
package vehicle_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    
    "fleettracker/internal/vehicle"
    "fleettracker/pkg/models"
)

type MockRepository struct {
    mock.Mock
}

func (m *MockRepository) GetByCompany(companyID string) ([]models.Vehicle, error) {
    args := m.Called(companyID)
    return args.Get(0).([]models.Vehicle), args.Error(1)
}

func TestVehicleService_GetByCompany(t *testing.T) {
    mockRepo := new(MockRepository)
    service := vehicle.NewService(mockRepo)

    expectedVehicles := []models.Vehicle{
        {ID: "1", LicensePlate: "B 1234 ABC", CompanyID: "company-1"},
        {ID: "2", LicensePlate: "B 5678 DEF", CompanyID: "company-1"},
    }

    mockRepo.On("GetByCompany", "company-1").Return(expectedVehicles, nil)

    vehicles, err := service.GetByCompany("company-1")

    assert.NoError(t, err)
    assert.Len(t, vehicles, 2)
    assert.Equal(t, "B 1234 ABC", vehicles[0].LicensePlate)
    mockRepo.AssertExpectations(t)
}

// Integration test
func TestVehicleIntegration(t *testing.T) {
    db := setupTestDB()
    repo := vehicle.NewRepository(db)
    service := vehicle.NewService(repo)

    // Test vehicle creation
    newVehicle := &models.Vehicle{
        CompanyID:    "test-company",
        LicensePlate: "B 9999 TEST",
        Brand:        "Toyota",
        Model:        "Avanza",
    }

    err := service.Create(newVehicle)
    assert.NoError(t, err)
    assert.NotEmpty(t, newVehicle.ID)

    // Test retrieval
    vehicles, err := service.GetByCompany("test-company")
    assert.NoError(t, err)
    assert.Len(t, vehicles, 1)
}
```

### 10.2 Frontend Testing
```typescript
// src/components/__tests__/FleetMap.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import FleetMap from '../maps/FleetMap'
import { vehicleService } from '@/services/vehicleService'

// Mock the vehicle service
vi.mock('@/services/vehicleService', () => ({
  vehicleService: {
    getAllWithPositions: vi.fn(),
  },
}))

// Mock Leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}))

describe('FleetMap', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('renders map container', () => {
    const mockVehicles = [
      {
        id: '1',
        licensePlate: 'B 1234 ABC',
        currentLat: -6.2088,
        currentLng: 106.8456,
        currentSpeed: 45,
        status: 'moving' as const,
        driverName: 'John Doe',
      },
    ]

    vi.mocked(vehicleService.getAllWithPositions).mockResolvedValue(mockVehicles)

    renderWithProviders(<FleetMap />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('displays vehicle markers with correct information', async () => {
    const mockVehicles = [
      {
        id: '1',
        licensePlate: 'B 1234 ABC',
        currentLat: -6.2088,
        currentLng: 106.8456,
        currentSpeed: 45,
        status: 'moving' as const,
        driverName: 'John Doe',
      },
    ]

    vi.mocked(vehicleService.getAllWithPositions).mockResolvedValue(mockVehicles)

    renderWithProviders(<FleetMap />)

    await waitFor(() => {
      expect(screen.getByTestId('marker')).toBeInTheDocument()
    })

    expect(screen.getByText('B 1234 ABC')).toBeInTheDocument()
    expect(screen.getByText('Driver: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Kecepatan: 45 km/h')).toBeInTheDocument()
  })
})
```

---

## 11. Monitoring & Observability

### 11.1 Application Metrics
```go
// internal/monitoring/metrics.go
package monitoring

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    gpsUpdatesTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "gps_updates_total",
            Help: "Total number of GPS updates processed",
        },
        []string{"vehicle_id", "company_id"},
    )

    apiRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "api_request_duration_seconds",
            Help: "API request duration in seconds",
        },
        []string{"method", "endpoint", "status"},
    )

    activeVehicles = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "active_vehicles_total",
            Help: "Total number of active vehicles",
        },
        []string{"company_id"},
    )
)

func RecordGPSUpdate(vehicleID, companyID string) {
    gpsUpdatesTotal.WithLabelValues(vehicleID, companyID).Inc()
}

func RecordAPIRequest(method, endpoint, status string, duration float64) {
    apiRequestDuration.WithLabelValues(method, endpoint, status).Observe(duration)
}
```

### 11.2 Health Checks
```go
// internal/health/health.go
package health

import (
    "context"
    "database/sql"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

type HealthChecker struct {
    db *sql.DB
}

type HealthStatus struct {
    Status   string            `json:"status"`
    Checks   map[string]string `json:"checks"`
    Version  string            `json:"version"`
    Uptime   string            `json:"uptime"`
}

func NewHealthChecker(db *sql.DB) *HealthChecker {
    return &HealthChecker{db: db}
}

func (h *HealthChecker) HealthCheck(c *gin.Context) {
    status := HealthStatus{
        Status:  "healthy",
        Checks:  make(map[string]string),
        Version: "1.0.0",
        Uptime:  time.Since(startTime).String(),
    }

    // Database health check
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.db.PingContext(ctx); err != nil {
        status.Checks["database"] = "unhealthy: " + err.Error()
        status.Status = "unhealthy"
        c.JSON(http.StatusServiceUnavailable, status)
        return
    }
    status.Checks["database"] = "healthy"

    c.JSON(http.StatusOK, status)
}
```

---

## 12. Deployment Checklist

### 12.1 Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Backup strategy in place
- [ ] Monitoring setup complete
- [ ] Load balancer configured
- [ ] CDN setup for static assets

### 12.2 Indonesian Compliance
- [ ] Data residency verified (Indonesian servers)
- [ ] QRIS payment integration tested
- [ ] Indonesian language support complete
- [ ] Local phone number validation
- [ ] Indonesian Rupiah currency handling
- [ ] Timezone handling (WIB/WITA/WIT)
- [ ] Privacy policy in Bahasa Indonesia
- [ ] Terms of service compliance with Indonesian law

### 12.3 Performance Targets
- [ ] API response time < 200ms (95th percentile)
- [ ] GPS data processing < 30 seconds
- [ ] Database query optimization complete
- [ ] Frontend loading time < 3 seconds
- [ ] WebSocket connection stability > 99%
- [ ] Mobile app performance optimized

---

## 13. Maintenance & Updates

### 13.1 Database Maintenance
```sql
-- Monthly maintenance script
-- Partition old GPS data
SELECT create_monthly_partition('gps_tracks', CURRENT_DATE);

-- Archive old data (keep 24 months)
DELETE FROM gps_tracks 
WHERE timestamp < NOW() - INTERVAL '24 months';

-- Update statistics
ANALYZE gps_tracks;
ANALYZE driver_events;
ANALYZE trips;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public' 
  AND tablename IN ('gps_tracks', 'vehicles', 'trips');
```

### 13.2 Security Updates
- Regular dependency updates (monthly)
- Security patch deployment (weekly)
- JWT secret rotation (quarterly)
- SSL certificate renewal (automated)
- Penetration testing (quarterly)
- Compliance audit (annually)

---

## 14. Implementation Status & Achievements

### 14.1 ✅ Backend Implementation - COMPLETE

**Overall Status**: ✅ **100% COMPLETE** (Production-Ready)

**Implementation Timeline**: October 2025 (6 weeks)

#### Core Statistics:
- ✅ **111 Go files** (~18,400 lines of production code)
- ✅ **80+ API endpoints** fully functional and documented
- ✅ **18 database tables** with Indonesian compliance fields
- ✅ **91 performance indexes** across 5 migration files
- ✅ **5 repository implementations** following clean architecture
- ✅ **12+ middleware** for security, logging, and performance
- ✅ **4,566 lines of test code** (80%+ coverage)
- ✅ **Zero linter warnings**
- ✅ **< 2% code duplication**
- ✅ **< 80ms average response time**

#### Completed Features (15/15):

1. **Authentication System** (100%)
   - JWT-based authentication with refresh tokens
   - 5-tier role hierarchy (super-admin → owner → admin → operator → driver)
   - Multi-tenant company isolation
   - Session management (list, revoke, cleanup)
   - Password hashing with bcrypt
   - Files: `internal/auth/` (8 files, 2,100+ lines)

2. **Vehicle Management** (100%)
   - Full CRUD operations
   - Indonesian compliance (STNK, BPKB, license plate validation)
   - Driver assignment/unassignment
   - Vehicle history tracking
   - Maintenance management
   - Files: `internal/vehicle/` (6 files, 1,785+ lines)

3. **Driver Management** (100%)
   - Full CRUD operations
   - Indonesian compliance (NIK, SIM validation)
   - Performance tracking & scoring
   - Availability management
   - SIM expiration alerts
   - Files: `internal/driver/` (4 files, 743+ lines)

4. **GPS Tracking & Trips** (100%)
   - Real-time GPS tracking with PostGIS
   - Trip management (start, update, complete)
   - Route history & playback
   - Geofence integration
   - WebSocket support for live updates
   - Files: `internal/tracking/` (5 files, 906+ lines)

5. **Payment Integration** (100%)
   - Manual bank transfer system
   - Invoice generation with Indonesian compliance
   - PPN 11% tax calculations (Indonesian VAT)
   - Payment confirmation workflow
   - Subscription billing
   - Files: `internal/payment/` (4 files, 374+ lines)

6. **Analytics & Reporting** (100%)
   - 20+ analytics endpoints
   - Dashboard with real-time metrics
   - Fuel consumption analytics (IDR costs)
   - Driver performance scoring (0-100 scale)
   - Maintenance cost tracking
   - Route efficiency analysis
   - Geofence activity monitoring
   - Utilization reports
   - Predictive insights (ML-based)
   - Export capabilities (PDF, CSV, Excel)
   - Files: `internal/analytics/` + `internal/common/analytics/` (11 files, 3,500+ lines)

7. **Company Isolation & Multi-Tenancy** (100%)
   - Strict multi-tenant isolation enforced
   - Repository-level company filtering
   - Defense-in-depth security
   - Role-based data access
   - Cross-company access only for super-admin
   - Comprehensive integration tests

8. **Session Management** (100%)
   - Session creation on login
   - Active session listing
   - Session revocation
   - Current session detection
   - Automatic expiration cleanup
   - Redis cache integration

9. **Database Integration** (100%)
   - PostgreSQL with PostGIS
   - 18 tables with Indonesian compliance
   - 6 SQL migrations (up/down)
   - 91 performance indexes
   - Database seeding with test data
   - Repository pattern implementation

10. **API Documentation** (100%)
    - Complete Swagger/OpenAPI specification
    - Interactive Swagger UI (`/swagger/index.html`)
    - Manual API documentation with examples
    - All 80+ endpoints documented
    - Request/response schemas
    - Authentication flow documentation

11. **Backend Refactoring** (95%)
    - Error handling standardization
    - Repository pattern across all services
    - Handler refactoring (analytics split into 6 files)
    - Code duplication < 2%
    - Performance optimization
    - Middleware enhancements

12. **Request Validation** (100%)
    - Indonesian-specific validators (NIK, NPWP, SIM, STNK, BPKB)
    - Input sanitization (HTML, SQL injection, XSS prevention)
    - Business rules validation
    - Validation middleware
    - Applied to all handlers

13. **Caching System** (100%)
    - Redis-based caching
    - HTTP cache middleware
    - Service-specific cache methods
    - Cache metrics & monitoring
    - Automatic cache invalidation

14. **Background Job Processing** (100%)
    - Job queue with Redis
    - Worker pool for concurrent processing
    - Job scheduler for recurring tasks
    - Job monitoring & metrics
    - Performance optimizations
    - 20+ job management endpoints

15. **Health Checks & Monitoring** (100%)
    - Health check endpoints (`/health`, `/health/ready`, `/health/live`)
    - Readiness & liveness probes
    - Dependency health checks (PostgreSQL, Redis)
    - Prometheus metrics export (`/metrics`)
    - System metrics (CPU, memory, goroutines)

#### Indonesian Compliance:
- ✅ NIK validation (16-digit Indonesian ID)
- ✅ NPWP validation (Indonesian tax ID)
- ✅ SIM validation (Driver's license)
- ✅ STNK validation (Vehicle registration)
- ✅ BPKB validation (Vehicle ownership)
- ✅ License plate validation (Indonesian format)
- ✅ PPN 11% tax calculations (Indonesian VAT)
- ✅ IDR currency formatting
- ✅ Indonesian date/time formatting

#### Performance Achievements:
- ✅ Average response time: **< 80ms** (target was < 100ms)
- ✅ Database query optimization: **91 indexes** across all tables
- ✅ Caching layer: **Redis** integration with automatic invalidation
- ✅ Code quality: **< 2% duplication** (target was < 3%)
- ✅ Test coverage: **80%+** across all services
- ✅ Build status: **All passing** with zero linter warnings

#### Documentation Artifacts:
- ✅ `backend/README.md` - Complete project overview with role hierarchy
- ✅ `backend/docs/swagger.yaml` - Complete OpenAPI specification
- ✅ `backend/docs/api/README.md` - Manual API documentation
- ✅ `backend/ARCHITECTURE.md` - System architecture documentation
- ✅ `backend/migrations/INDEX_DOCUMENTATION.md` - Database index catalog
- ✅ `specs/active/*/` - 15 feature briefs with progress tracking
- ✅ `specs/BACKEND_COMPLETION_STATUS.md` - Comprehensive completion report

#### Production Readiness:
- ✅ Docker Compose for development
- ✅ Environment variable configuration
- ✅ Graceful shutdown implemented
- ✅ Connection pooling optimized
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Structured logging (JSON)
- ✅ Audit trail logging
- ✅ Request tracing

### 14.2 🚧 Frontend Implementation - IN PLANNING

**Overall Status**: 🚧 **In Planning** (Starting Development)

**Target Timeline**: 8-10 weeks

**Planned Technology Stack**:
- **Build Tool**: Vite (fast build, HMR)
- **Language**: TypeScript (type safety)
- **Framework**: React 18
- **State Management**: TanStack Query (server state)
- **Authentication**: Better Auth (framework-agnostic)
- **Styling**: TailwindCSS (utility-first)
- **Maps**: Leaflet or Google Maps Platform
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form
- **Icons**: Lucide Icons
- **UI Components**: shadcn/ui or custom components

**Planned Features**:
1. **Authentication UI**
   - Login page
   - Registration page (first user only)
   - Password reset flow
   - Session management UI

2. **Dashboard**
   - Real-time fleet overview
   - KPI widgets (vehicles, drivers, fuel, violations)
   - Live fleet map
   - Recent alerts & notifications

3. **Fleet Map**
   - Live vehicle tracking
   - Vehicle status indicators
   - Click for vehicle details
   - Filter by status/route/driver
   - Route playback

4. **Vehicle Management**
   - Vehicle list with filters & pagination
   - Create/edit vehicle form
   - Indonesian compliance fields (STNK, BPKB)
   - Driver assignment interface
   - Maintenance history view

5. **Driver Management**
   - Driver list with performance scores
   - Create/edit driver form
   - Indonesian compliance (NIK, SIM)
   - Performance dashboard
   - Trip history

6. **Analytics & Reports**
   - Fuel consumption charts
   - Driver performance rankings
   - Cost analysis
   - Compliance reports
   - Export to PDF/CSV/Excel

7. **Payment Interface**
   - Invoice listing
   - Invoice details view
   - Payment confirmation
   - Payment history

8. **Admin Panel**
   - User management (CRUD)
   - Company settings
   - Role assignment
   - Session monitoring

9. **Mobile-Responsive Design**
   - Works on tablets
   - Works on mobile devices
   - Touch-friendly interface

**Integration Points**:
- API Base URL: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger/index.html`
- Authentication: JWT Bearer tokens (stored in localStorage/cookies)
- Role-based UI: 5 roles (super-admin, owner, admin, operator, driver)
- Multi-tenant: Company context from JWT, filter all requests
- Language: Indonesian (Bahasa Indonesia) primary, English secondary

**Development Approach**:
1. Setup Vite project with TypeScript
2. Configure TanStack Query and Better Auth
3. Create API service layer with axios
4. Build authentication flows
5. Implement dashboard and fleet map
6. Create CRUD interfaces for vehicles/drivers
7. Add analytics and reporting
8. Implement admin panel
9. Mobile responsive optimization
10. Testing and QA

### 14.3 🚀 Deployment Strategy

**Development Environment**:
- Docker Compose for local development
- PostgreSQL + PostGIS + Redis containers
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- Swagger UI: `http://localhost:8080/swagger/index.html`

**Production Environment** (Planned):
- Indonesian cloud provider (for data residency)
- Kubernetes orchestration
- PostgreSQL managed database
- Redis managed cache
- CDN for static assets
- SSL/TLS certificates
- Domain: `fleettracker.id` or `fleettracker.co.id`

**CI/CD Pipeline** (Planned):
- GitHub Actions for automated testing
- Docker image builds
- Automated deployment to staging
- Manual approval for production
- Automated database migrations
- Health check verification

---

## 15. Conclusion & Next Steps

### Implementation Achievements:

✅ **Backend**: **100% COMPLETE** and production-ready
- All 15 major features implemented
- 80+ API endpoints functional
- Comprehensive testing (80%+ coverage)
- Complete documentation (Swagger + Manual)
- Indonesian compliance integrated
- Performance optimized (< 80ms avg)
- Security hardened (RBAC, multi-tenant isolation)

🚧 **Frontend**: **IN PLANNING** phase
- Technology stack selected
- Integration requirements defined
- Feature list prepared
- Ready to start development

### Next Steps:

1. **Frontend Development** (8-10 weeks)
   - Week 1-2: Setup, authentication, API integration
   - Week 3-4: Dashboard, fleet map
   - Week 5-6: Vehicle/driver management
   - Week 7-8: Analytics, reports
   - Week 9-10: Testing, optimization, deployment

2. **Integration Testing**
   - End-to-end testing
   - Cross-browser testing
   - Mobile responsive testing
   - Performance testing

3. **User Acceptance Testing**
   - Pilot with select customers
   - Gather feedback
   - Iterate on UX

4. **Production Deployment**
   - Infrastructure setup
   - Database migration
   - Monitoring & alerting
   - Go-live

This technical implementation guide now reflects the actual implementation status, with the backend fully complete and frontend development ready to begin.