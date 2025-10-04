# Todo List: Database Migration & Seeding System

**Task ID:** migrate-seed  
**Status:** In Progress  
**Started:** 2025-10-04  

---

## Phase 1: Migration System Setup ⏳

### 1.1 Install Migration Tools
- [ ] Install golang-migrate CLI tool
- [ ] Verify installation and version
- [ ] Add to project dependencies

### 1.2 Create Directory Structure
- [ ] Create `migrations/` directory
- [ ] Create `seeds/` directory
- [ ] Create `cmd/migrate/` directory
- [ ] Create `cmd/seed/` directory

### 1.3 Convert Existing SQL to Migrations
- [ ] Extract schema from `init.sql`
- [ ] Create `001_initial_schema.up.sql`
- [ ] Create `001_initial_schema.down.sql`
- [ ] Add indexes migration `002_add_indexes.up.sql`
- [ ] Add indexes rollback `002_add_indexes.down.sql`

### 1.4 Update Makefile
- [ ] Add `migrate-up` command
- [ ] Add `migrate-down` command
- [ ] Add `migrate-create` command
- [ ] Add `migrate-status` command
- [ ] Add `migrate-force` command (for fixing broken state)
- [ ] Update help documentation

### 1.5 Test Migrations
- [ ] Test `migrate-up` on fresh database
- [ ] Verify all tables created correctly
- [ ] Test `migrate-down` rollback
- [ ] Test migration idempotency

---

## Phase 2: Seed Data Implementation ⏳

### 2.1 Create Seed Package Structure
- [ ] Create `seeds/seed.go` (main orchestrator)
- [ ] Create `seeds/companies.go`
- [ ] Create `seeds/users.go`
- [ ] Create `seeds/vehicles.go`
- [ ] Create `seeds/drivers.go`
- [ ] Create `seeds/gps_tracks.go`
- [ ] Create `seeds/trips.go`
- [ ] Create `seeds/utils.go` (helper functions)

### 2.2 Implement Company Seeds
- [ ] PT Logistik Jakarta Raya (complete profile)
- [ ] CV Transport Surabaya Jaya (complete profile)
- [ ] Add valid NPWP, SIUP numbers
- [ ] Add realistic Indonesian addresses

### 2.3 Implement User Seeds
- [ ] 1 Admin user (can login)
- [ ] 2 Manager users
- [ ] 2 Operator users
- [ ] Hash passwords properly
- [ ] Add valid NIK numbers
- [ ] Distribute across 2 companies

### 2.4 Implement Vehicle Seeds
- [ ] 5 vehicles for Jakarta company
- [ ] 5 vehicles for Surabaya company
- [ ] Realistic license plates (B XXXX XX, L XXXX XX)
- [ ] Mix of vehicle types (truck, van, motorcycle)
- [ ] Add maintenance records

### 2.5 Implement Driver Seeds
- [ ] 3 drivers for Jakarta company
- [ ] 2 drivers for Surabaya company
- [ ] Valid SIM numbers
- [ ] Realistic Indonesian names
- [ ] Emergency contact information

### 2.6 Implement GPS Track Seeds
- [ ] Generate Jakarta route (Monas → Blok M)
- [ ] Generate Surabaya route (Tugu Pahlawan → Delta Plaza)
- [ ] 50 points per route
- [ ] Realistic speeds (traffic patterns)
- [ ] Timestamps over last 24 hours

### 2.7 Implement Trip Seeds
- [ ] 10 trips for Jakarta vehicles
- [ ] 10 trips for Surabaya vehicles
- [ ] Calculate distances and fuel consumption
- [ ] Add driver behavior events
- [ ] Link GPS tracks to trips

### 2.8 Create Seed CLI Tool
- [ ] Create `cmd/seed/main.go`
- [ ] Add environment variable loading
- [ ] Add database connection
- [ ] Add error handling and logging
- [ ] Add success messages

---

## Phase 3: Indonesian Data Realism 🇮🇩

### 3.1 Indonesian Name Generator
- [ ] Create list of common Indonesian first names
- [ ] Create list of common Indonesian last names
- [ ] Implement random name generator
- [ ] Ensure gender-appropriate names

### 3.2 Indonesian ID Generators
- [ ] NPWP format validator and generator
- [ ] NIK format validator and generator
- [ ] SIM number generator
- [ ] License plate generator (by region)

### 3.3 Address Data
- [ ] Jakarta addresses (5 realistic addresses)
- [ ] Surabaya addresses (5 realistic addresses)
- [ ] Include kelurahan, kecamatan, kota
- [ ] Valid postal codes

### 3.4 Phone Numbers
- [ ] Generate valid Indonesian phone numbers
- [ ] Mix of mobile (+62 8xx) and landline formats
- [ ] Area codes for Jakarta and Surabaya

### 3.5 GPS Coordinates
- [ ] Jakarta landmarks and routes
- [ ] Surabaya landmarks and routes
- [ ] Realistic traffic speed data
- [ ] Time-based speed variations

---

## Phase 4: Integration & Testing ✅

### 4.1 Update Makefile Commands
- [ ] Add `seed` command
- [ ] Add `seed-companies` (partial seed)
- [ ] Add `seed-users` (partial seed)
- [ ] Add `seed-all` (full seed)
- [ ] Add `db-reset` (drop + migrate + seed)
- [ ] Add `db-status` (show current state)

### 4.2 Documentation
- [ ] Create `migrations/README.md`
- [ ] Create `seeds/README.md`
- [ ] Update main `README.md`
- [ ] Add usage examples
- [ ] Document seed data credentials

### 4.3 Docker Integration
- [ ] Update docker-compose.yml if needed
- [ ] Test migrations in Docker
- [ ] Test seeds in Docker
- [ ] Verify environment variables work

### 4.4 End-to-End Testing
- [ ] Test complete workflow: `make db-reset`
- [ ] Verify all tables created
- [ ] Verify all seed data inserted
- [ ] Test user login with seeded credentials
- [ ] Test vehicle API endpoints
- [ ] Test driver API endpoints
- [ ] Verify GPS data in API

### 4.5 Swagger Verification
- [ ] Test GET /api/v1/vehicles (should return 10)
- [ ] Test GET /api/v1/drivers (should return 5)
- [ ] Test GET /api/v1/tracking/vehicles/:id/history
- [ ] Test POST /api/v1/auth/login with seeded users

---

## Phase 5: Cleanup & Polish 🎨

### 5.1 Code Quality
- [ ] Run `go fmt` on all new files
- [ ] Add comments to complex functions
- [ ] Remove debug/test code
- [ ] Check for hardcoded values

### 5.2 Error Handling
- [ ] Add proper error messages
- [ ] Handle database connection failures
- [ ] Handle duplicate seed data gracefully
- [ ] Add rollback on seed failure

### 5.3 Performance
- [ ] Batch insert for large datasets
- [ ] Add transaction support
- [ ] Measure seed time (should be < 30 seconds)
- [ ] Optimize GPS track generation

### 5.4 Final Documentation
- [ ] Add migration workflow diagram
- [ ] Document common issues and solutions
- [ ] Add FAQ section
- [ ] Update project TODO.md

---

## Progress Summary

**Total Tasks:** 85  
**Completed:** 0  
**In Progress:** 0  
**Blocked:** 0  

**Estimated Time:** 4-6 hours  
**Time Spent:** 0 hours  

---

## Notes

- Using golang-migrate for production-grade migrations
- All seed data is idempotent (safe to run multiple times)
- Indonesian data follows official format standards
- GPS coordinates use real Jakarta/Surabaya locations
- Passwords for seeded users: `password123` (development only)

---

## Dependencies

- golang-migrate/migrate v4
- gofakeit v6 (for realistic data generation)
- Existing models in pkg/models/
- PostgreSQL with PostGIS and UUID extensions

---

## Success Criteria

✅ Can run `make db-reset` successfully  
✅ Can login with seeded user: `admin@logistikjkt.co.id` / `password123`  
✅ GET /api/v1/vehicles returns 10 vehicles  
✅ GET /api/v1/drivers returns 5 drivers  
✅ GPS tracks are visible in Swagger API  
✅ All Indonesian data formats are valid

