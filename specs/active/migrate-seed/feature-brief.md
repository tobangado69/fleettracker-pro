# Feature Brief: Database Migration & Seeding System

**Task ID:** `migrate-seed`  
**Created:** 2025-10-04  
**Status:** Planning  
**Estimated Time:** 4-6 hours development

---

## 🎯 Problem Statement

Currently, the FleetTracker Pro backend has:
- ❌ No structured migration system (just GORM AutoMigrate)
- ❌ No seed data for development/testing
- ❌ Manual SQL files (`init.sql`, `init-timescale.sql`) that duplicate model definitions
- ❌ No way to version database schema changes
- ❌ Difficult to reset and populate database with realistic test data

**Users Affected:**
- Backend developers (need test data)
- QA team (need consistent test environments)
- DevOps (need repeatable deployments)
- Frontend developers (need API data to work with)

**Success Criteria:**
1. ✅ Developers can run `make migrate` to apply all schema changes
2. ✅ Developers can run `make seed` to populate with realistic Indonesian fleet data
3. ✅ Can reset database with `make db-reset` (drop, migrate, seed)
4. ✅ Migration files are versioned and trackable
5. ✅ Seed data includes: 2 companies, 5 users, 10 vehicles, 5 drivers, 100 GPS tracks

---

## 📊 Current State Analysis

### Existing Database Models (from `pkg/models/`)
1. **Company** - Multi-tenant fleet companies (NPWP, SIUP, Indonesian fields)
2. **User** - System users (admin, manager, operator) with NIK
3. **Session** - JWT session management
4. **AuditLog** - Activity tracking
5. **PasswordResetToken** - Password recovery
6. **Vehicle** - Fleet vehicles with Indonesian plates
7. **MaintenanceLog** - Vehicle maintenance records
8. **FuelLog** - Fuel consumption tracking
9. **Driver** - Driver information with SIM (Indonesian license)
10. **DriverEvent** - Driving behavior events
11. **PerformanceLog** - Driver performance metrics
12. **GPSTrack** - Real-time GPS location data
13. **Trip** - Journey records with route optimization
14. **Geofence** - Geographic boundaries
15. **VehicleHistory** - Vehicle usage history
16. **Subscription** - Company subscription plans
17. **Payment** - Payment records
18. **Invoice** - Billing invoices

### Current Migration Approach
```go
// cmd/server/main.go (lines 90-114)
db.AutoMigrate(
    &models.Company{},
    &models.User{},
    // ... all 18 models
)
```

**Problems:**
- No version control
- Can't rollback changes
- No migration history
- Runs on every app start (slow)

---

## 🔍 Research: Migration Tools for Go

### Option 1: golang-migrate/migrate ⭐ **RECOMMENDED**
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

**Pros:**
- ✅ Industry standard
- ✅ Version-based migrations (001_init.up.sql, 001_init.down.sql)
- ✅ CLI tool + Go library
- ✅ Supports rollback
- ✅ Used by many production systems

**Cons:**
- ❌ Requires SQL knowledge (but we already have init.sql)
- ❌ Separate from GORM

### Option 2: GORM AutoMigrate (Current)
**Pros:**
- ✅ Already in use
- ✅ Simple, no extra tools

**Cons:**
- ❌ No version control
- ❌ Can't rollback
- ❌ No migration history

### Option 3: goose
Similar to golang-migrate but less popular.

**Decision:** Use **golang-migrate** for production-grade migrations while keeping GORM for rapid prototyping.

---

## 📋 Requirements

### Functional Requirements

#### 1. Migration System
- **FR-1.1:** Create versioned migration files (001_initial_schema.up.sql)
- **FR-1.2:** Support up migrations (apply changes)
- **FR-1.3:** Support down migrations (rollback changes)
- **FR-1.4:** Track migration version in database (`schema_migrations` table)
- **FR-1.5:** Integrate with Makefile for easy commands

#### 2. Seed Data System
- **FR-2.1:** Create seed data generator in Go
- **FR-2.2:** Generate realistic Indonesian fleet data:
  - 2 companies (PT Logistics Jakarta, CV Transport Surabaya)
  - 5 users (1 admin, 2 managers, 2 operators)
  - 10 vehicles (mix of trucks, vans, motorcycles)
  - 5 drivers with valid Indonesian SIM
  - 100 GPS tracking points (realistic Jakarta/Surabaya routes)
  - 20 trips with fuel consumption data
- **FR-2.3:** Idempotent seeding (can run multiple times safely)
- **FR-2.4:** Separate seed files for development vs production

#### 3. Database Management Commands
- **FR-3.1:** `make migrate-up` - Apply pending migrations
- **FR-3.2:** `make migrate-down` - Rollback last migration
- **FR-3.3:** `make migrate-create NAME=add_column` - Create new migration
- **FR-3.4:** `make seed` - Populate with test data
- **FR-3.5:** `make db-reset` - Drop, migrate, seed (full reset)
- **FR-3.6:** `make db-status` - Show current migration version

### Non-Functional Requirements
- **NFR-1:** Migrations must complete in < 5 seconds
- **NFR-2:** Seed data generation must be deterministic (same data each time)
- **NFR-3:** Must work in Docker and local environments
- **NFR-4:** Must not conflict with existing `init.sql` (migration path)

---

## 🏗️ Technical Design

### Directory Structure
```
backend/
├── migrations/
│   ├── 001_initial_schema.up.sql      # Create all tables
│   ├── 001_initial_schema.down.sql    # Drop all tables
│   ├── 002_add_indexes.up.sql         # Performance indexes
│   ├── 002_add_indexes.down.sql       # Remove indexes
│   └── README.md                       # Migration guidelines
├── seeds/
│   ├── seed.go                         # Main seed orchestrator
│   ├── companies.go                    # Company seed data
│   ├── users.go                        # User seed data
│   ├── vehicles.go                     # Vehicle seed data
│   ├── drivers.go                      # Driver seed data
│   ├── gps_tracks.go                   # GPS data generator
│   └── README.md                       # Seed data documentation
└── cmd/
    ├── migrate/
    │   └── main.go                     # Migration CLI tool
    └── seed/
        └── main.go                     # Seed CLI tool
```

### Migration File Example (001_initial_schema.up.sql)
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    npwp VARCHAR(20) UNIQUE,  -- Indonesian tax ID
    -- ... all fields from models.Company
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nik VARCHAR(16) UNIQUE,  -- Indonesian ID
    -- ... all fields from models.User
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ... all other tables
```

### Seed Data Example (seeds/companies.go)
```go
package seeds

import (
    "gorm.io/gorm"
    "github.com/tobangado69/fleettracker-pro/backend/pkg/models"
)

func SeedCompanies(db *gorm.DB) error {
    companies := []models.Company{
        {
            ID:          "550e8400-e29b-41d4-a716-446655440001",
            Name:        "PT Logistik Jakarta Raya",
            Email:       "admin@logistikjkt.co.id",
            Phone:       "+62215551234",
            NPWP:        "01.234.567.8-901.000",
            SIUP:        "SIUP/01234/2023",
            City:        "Jakarta Pusat",
            Province:    "DKI Jakarta",
            PostalCode:  "10110",
            FleetSize:   25,
            Status:      "active",
        },
        {
            ID:          "550e8400-e29b-41d4-a716-446655440002",
            Name:        "CV Transport Surabaya Jaya",
            Email:       "admin@transportsby.co.id",
            Phone:       "+62315551234",
            NPWP:        "01.234.567.8-902.000",
            City:        "Surabaya",
            Province:    "Jawa Timur",
            PostalCode:  "60123",
            FleetSize:   15,
            Status:      "active",
        },
    }

    for _, company := range companies {
        if err := db.FirstOrCreate(&company, "id = ?", company.ID).Error; err != nil {
            return err
        }
    }
    return nil
}
```

### GPS Track Generator (seeds/gps_tracks.go)
```go
func GenerateJakartaRoute() []models.GPSTrack {
    // Generate realistic route from Jakarta Pusat to Jakarta Selatan
    startLat, startLon := -6.2088, 106.8456  // Monas
    endLat, endLon := -6.2615, 106.8106      // Blok M
    
    tracks := []models.GPSTrack{}
    steps := 100
    
    for i := 0; i < steps; i++ {
        progress := float64(i) / float64(steps)
        lat := startLat + (endLat-startLat)*progress
        lon := startLon + (endLon-startLon)*progress
        
        tracks = append(tracks, models.GPSTrack{
            Latitude:  lat,
            Longitude: lon,
            Speed:     randomSpeed(20, 60),  // 20-60 km/h city traffic
            Timestamp: time.Now().Add(-time.Duration(steps-i) * time.Minute),
        })
    }
    return tracks
}
```

---

## 🔧 Implementation Plan

### Phase 1: Migration System Setup (2 hours)
1. **Install golang-migrate**
   ```bash
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   ```

2. **Create migration directory structure**
   ```bash
   mkdir -p migrations
   ```

3. **Convert init.sql to migration files**
   - Extract from `init.sql` → `001_initial_schema.up.sql`
   - Create corresponding `.down.sql` for rollback

4. **Update Makefile with migration commands**
   ```makefile
   migrate-up:
       migrate -database ${DATABASE_URL} -path migrations up
   
   migrate-down:
       migrate -database ${DATABASE_URL} -path migrations down 1
   
   migrate-create:
       migrate create -ext sql -dir migrations -seq $(NAME)
   ```

5. **Test migration**
   - Run on fresh database
   - Verify all tables created
   - Test rollback

### Phase 2: Seed Data Implementation (2 hours)
1. **Create seed package structure**
   ```bash
   mkdir -p seeds
   ```

2. **Implement seed files**
   - `seeds/seed.go` - Main orchestrator
   - `seeds/companies.go` - 2 Indonesian companies
   - `seeds/users.go` - 5 users with roles
   - `seeds/vehicles.go` - 10 vehicles (realistic plates)
   - `seeds/drivers.go` - 5 drivers with SIM
   - `seeds/gps_tracks.go` - 100 GPS points
   - `seeds/trips.go` - 20 completed trips

3. **Create seed CLI tool**
   ```go
   // cmd/seed/main.go
   package main
   
   func main() {
       db := database.Connect(os.Getenv("DATABASE_URL"))
       seeds.RunAll(db)
   }
   ```

4. **Add to Makefile**
   ```makefile
   seed:
       go run cmd/seed/main.go
   
   db-reset:
       make migrate-down
       make migrate-up
       make seed
   ```

### Phase 3: Indonesian Realistic Data (1-2 hours)
1. **Research Indonesian data**
   - Valid NPWP format: `XX.XXX.XXX.X-XXX.XXX`
   - Valid NIK format: `DDPPKKSSDDMMYY####`
   - Valid SIM numbers
   - Realistic Jakarta/Surabaya addresses
   - Indonesian phone numbers: `+62XXX`

2. **Implement realistic generators**
   - Indonesian names (common names database)
   - Valid license plates: `B 1234 XYZ` (Jakarta), `L 5678 ABC` (Surabaya)
   - GPS coordinates for major Indonesian cities
   - Realistic speed data (Jakarta traffic: 10-40 km/h, highways: 60-100 km/h)

3. **Add faker library for variety**
   ```bash
   go get github.com/brianvoe/gofakeit/v6
   ```

### Phase 4: Documentation & Testing (1 hour)
1. **Create documentation**
   - `migrations/README.md` - How to create migrations
   - `seeds/README.md` - How seed data works

2. **Update main README**
   - Add migration section
   - Add seeding instructions

3. **Test complete workflow**
   ```bash
   make db-reset  # Should work end-to-end
   make docker-up
   make migrate-up
   make seed
   ```

4. **Verify with Swagger**
   - Check companies exist
   - Check users can login
   - Check vehicles appear in API

---

## ✅ Acceptance Criteria

### Must Have (MVP)
- [ ] Can run `make migrate-up` to create all tables
- [ ] Can run `make migrate-down` to rollback
- [ ] Can run `make seed` to populate data
- [ ] Can run `make db-reset` for full reset
- [ ] Seed creates 2 companies, 5 users, 10 vehicles
- [ ] Users can login with seeded credentials
- [ ] Vehicles appear in Swagger API

### Should Have
- [ ] 100 GPS tracking points generated
- [ ] 20 trips with realistic data
- [ ] 5 drivers with valid SIM numbers
- [ ] Indonesian addresses and phone numbers
- [ ] Migration version tracking in database

### Could Have (Future)
- [ ] Seed data for production (minimal)
- [ ] CSV import for bulk seeding
- [ ] Web UI for viewing seed data
- [ ] Performance benchmarks

---

## 🎯 Next Actions

### Immediate (Do First)
1. Install golang-migrate tool
2. Create `migrations/` directory
3. Convert `init.sql` → `001_initial_schema.up.sql`
4. Update Makefile with migrate commands
5. Test migration on fresh database

### Follow-up
6. Create `seeds/` package structure
7. Implement company seed data
8. Implement user seed data
9. Add remaining seed files
10. Test complete workflow

---

## 📊 Success Metrics

**Developer Experience:**
- Time to set up database: < 2 minutes (currently ~10 minutes manual)
- Time to reset database: < 30 seconds (currently ~5 minutes)
- Migration reliability: 100% success rate

**Data Quality:**
- 100% realistic Indonesian data (names, addresses, plates)
- 100% valid format (NPWP, NIK, SIM)
- GPS tracks follow real Jakarta/Surabaya routes

---

## 🔗 Related Documents

- [init.sql](../../backend/init.sql) - Current initialization script
- [init-timescale.sql](../../backend/init-timescale.sql) - TimescaleDB setup
- [models/](../../backend/pkg/models/) - All data models
- [DOCKER_SETUP.md](../../backend/DOCKER_SETUP.md) - Docker environment

---

## 💡 Key Decisions

1. **Migration Tool:** golang-migrate (industry standard, production-ready)
2. **Seed Approach:** Go code (type-safe, can use models directly)
3. **Data Realism:** 100% Indonesian-compliant data
4. **Idempotency:** Seeds use FirstOrCreate (safe to run multiple times)
5. **Integration:** Makefile commands for developer convenience

---

## 🚀 Ready to Start!

**First command to run:**
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
mkdir -p migrations seeds
```

**Estimated completion:** 4-6 hours

**Owner:** Backend Team  
**Reviewer:** Tech Lead  
**Priority:** High (blocks development and testing)

