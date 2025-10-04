# Vehicle Management APIs - Feature Brief

**Task ID**: `vehicle-management`  
**Status**: Implementation Complete - Adding Vehicle History Tracking  
**Priority**: High  
**Estimated Time**: 2-3 weeks (Core Complete, History Tracking in Progress)  
**Assigned To**: Backend Team  

## 📋 Problem Statement

**User Need**: Fleet managers need comprehensive vehicle management capabilities to track, maintain, and optimize their vehicle fleet with Indonesian compliance requirements.

**Current State**: 
- ✅ Backend infrastructure complete with service/handler structures
- ✅ GORM models implemented with Indonesian compliance fields
- ✅ **COMPLETED**: Full vehicle CRUD operations with database integration
- ✅ **COMPLETED**: Vehicle status tracking (active, maintenance, retired)
- ✅ **COMPLETED**: Driver assignment functionality
- ✅ **COMPLETED**: Company-based filtering and permissions
- ✅ **COMPLETED**: Vehicle search and filtering endpoints
- ✅ **COMPLETED**: Indonesian compliance validation (STNK, BPKB, license plates)
- ✅ **COMPLETED**: Inspection date management with automatic calculation
- 🚧 **IN PROGRESS**: Vehicle history tracking implementation

**Business Impact**: Core vehicle management is complete. Now fleet managers need:
- ✅ Add/update/remove vehicles from their fleet
- ✅ Track vehicle status and maintenance schedules
- ✅ Assign drivers to vehicles
- ✅ Monitor vehicle compliance (STNK, BPKB, inspections)
- 🚧 **Next Priority**: Track comprehensive vehicle history for maintenance, repairs, and compliance auditing

## 🎯 Success Criteria

### ✅ Technical Requirements
- [x] ✅ Complete vehicle CRUD operations with database integration
- [x] ✅ Vehicle status tracking (active, maintenance, retired)
- [x] ✅ Driver assignment functionality
- [x] ✅ Company-based filtering and permissions
- [x] ✅ Vehicle search and filtering endpoints
- [x] ✅ Indonesian compliance validation (STNK, BPKB)
- [ ] 🚧 **Vehicle History Tracking** - Maintenance, repairs, status changes, compliance events

### ✅ Performance Requirements
- API response time < 200ms (95th percentile)
- Support 1000+ concurrent vehicle operations
- Efficient database queries with proper indexing
- Real-time status updates

### ✅ Indonesian Market Requirements
- STNK (Surat Tanda Nomor Kendaraan) validation
- BPKB (Buku Pemilik Kendaraan Bermotor) tracking
- Indonesian license plate format validation
- Insurance policy number management
- Indonesian inspection date tracking

## 🔍 Quick Research (15 minutes)

### Existing Patterns Analysis
- **Go + Gin Framework**: Industry standard for high-performance APIs
- **GORM ORM**: Proven solution for database operations with relationships
- **Repository Pattern**: Clean separation of concerns for maintainability
- **JWT Authentication**: Stateless, scalable for SaaS applications
- **Indonesian Compliance**: NPWP, SIUP, NIK, SIM validation patterns

### Similar Implementations
- **Fleet Management Systems**: Vehicle CRUD with status tracking
- **Indonesian ERP Systems**: STNK/BPKB compliance validation
- **SaaS Platforms**: Multi-tenant vehicle management
- **Real-time Systems**: WebSocket for live vehicle status updates

## 🏗️ Implementation Approach

### Core Vehicle Management Components

#### 1. **Vehicle Service Layer**
```go
type VehicleService struct {
    db *gorm.DB
    redis *redis.Client
}

// Core CRUD operations
func (s *VehicleService) CreateVehicle(companyID string, req CreateVehicleRequest) (*Vehicle, error)
func (s *VehicleService) GetVehicle(companyID, vehicleID string) (*Vehicle, error)
func (s *VehicleService) UpdateVehicle(companyID, vehicleID string, req UpdateVehicleRequest) (*Vehicle, error)
func (s *VehicleService) DeleteVehicle(companyID, vehicleID string) error
func (s *VehicleService) ListVehicles(companyID string, filters VehicleFilters) ([]Vehicle, error)
```

#### 2. **Vehicle Handler Layer**
```go
type VehicleHandler struct {
    service *VehicleService
}

// HTTP endpoints
GET    /api/v1/vehicles                    // List vehicles with filters
POST   /api/v1/vehicles                    // Create vehicle
GET    /api/v1/vehicles/:id                // Get vehicle details
PUT    /api/v1/vehicles/:id                // Update vehicle
DELETE /api/v1/vehicles/:id                // Delete vehicle
POST   /api/v1/vehicles/:id/assign-driver  // Assign driver

// Vehicle History endpoints 🚧 **NEW**
GET    /api/v1/vehicles/:id/history        // Get vehicle history with filters
POST   /api/v1/vehicles/:id/history        // Add history entry (maintenance, repair, etc.)
GET    /api/v1/vehicles/:id/maintenance    // Get maintenance history only
GET    /api/v1/vehicles/maintenance/upcoming // Get upcoming maintenance for company
PUT    /api/v1/vehicles/:id/history/:historyId // Update history entry
```

#### 3. **Vehicle Status Management**
```go
type VehicleStatus string

const (
    StatusActive      VehicleStatus = "active"
    StatusMaintenance VehicleStatus = "maintenance"
    StatusRetired     VehicleStatus = "retired"
    StatusInactive    VehicleStatus = "inactive"
)

func (s *VehicleService) UpdateVehicleStatus(companyID, vehicleID string, status VehicleStatus, reason string) error
```

#### 4. **Driver Assignment System**
```go
func (s *VehicleService) AssignDriver(companyID, vehicleID, driverID string) error
func (s *VehicleService) UnassignDriver(companyID, vehicleID string) error
func (s *VehicleService) GetVehicleDriver(companyID, vehicleID string) (*Driver, error)
```

#### 5. **Vehicle History Tracking System** 🚧 **NEW FEATURE**
```go
type VehicleHistory struct {
    ID              string    `json:"id" gorm:"primaryKey;type:uuid"`
    VehicleID       string    `json:"vehicle_id" gorm:"type:uuid;index"`
    CompanyID       string    `json:"company_id" gorm:"type:uuid;index"`
    EventType       string    `json:"event_type" gorm:"size:50"` // maintenance, repair, status_change, inspection, assignment
    EventCategory   string    `json:"event_category" gorm:"size:50"` // scheduled, emergency, compliance, operational
    Title           string    `json:"title" gorm:"size:200"`
    Description     string    `json:"description" gorm:"type:text"`
    MileageAtEvent  int       `json:"mileage_at_event"`
    Cost            float64   `json:"cost" gorm:"type:decimal(12,2)"`
    Currency        string    `json:"currency" gorm:"size:3;default:'IDR'"`
    Location        string    `json:"location" gorm:"size:200"`
    ServiceProvider string    `json:"service_provider" gorm:"size:200"`
    InvoiceNumber   string    `json:"invoice_number" gorm:"size:50"`
    Documents       JSON      `json:"documents" gorm:"type:jsonb"` // Receipts, invoices, certificates
    NextServiceDue  *time.Time `json:"next_service_due"`
    CreatedBy       string    `json:"created_by" gorm:"type:uuid"`
    CreatedAt       time.Time `json:"created_at"`
    
    // Relationships
    Vehicle         Vehicle   `json:"vehicle" gorm:"foreignKey:VehicleID"`
    Company         Company   `json:"company" gorm:"foreignKey:CompanyID"`
    Creator         User      `json:"creator" gorm:"foreignKey:CreatedBy"`
}

// Vehicle History Service Methods
func (s *VehicleService) AddVehicleHistory(companyID, vehicleID string, req AddHistoryRequest) (*VehicleHistory, error)
func (s *VehicleService) GetVehicleHistory(companyID, vehicleID string, filters HistoryFilters) ([]VehicleHistory, error)
func (s *VehicleService) GetMaintenanceHistory(companyID, vehicleID string) ([]VehicleHistory, error)
func (s *VehicleService) GetUpcomingMaintenance(companyID string) ([]VehicleHistory, error)
func (s *VehicleService) UpdateMaintenanceSchedule(companyID, vehicleID string, req MaintenanceScheduleRequest) error
```

### Database Schema Integration

#### Vehicle Model (Already Implemented)
```go
type Vehicle struct {
    ID                      string    `json:"id" gorm:"primaryKey;type:uuid"`
    CompanyID               string    `json:"company_id" gorm:"type:uuid;index"`
    DriverID                *string   `json:"driver_id" gorm:"type:uuid;index"`
    Make                    string    `json:"make" gorm:"size:100"`
    Model                   string    `json:"model" gorm:"size:100"`
    Year                    int       `json:"year"`
    LicensePlate            string    `json:"license_plate" gorm:"size:20;uniqueIndex"`
    VIN                     string    `json:"vin" gorm:"size:17;uniqueIndex"`
    Color                   string    `json:"color" gorm:"size:50"`
    FuelType                string    `json:"fuel_type" gorm:"size:20"`
    CurrentOdometer         int       `json:"current_odometer"`
    LastMaintenanceOdometer int       `json:"last_maintenance_odometer"`
    PurchaseDate            *time.Time `json:"purchase_date"`
    Status                  string    `json:"status" gorm:"size:20;default:active"`
    IsActive                bool      `json:"is_active" gorm:"default:true"`
    IsGPSEnabled            bool      `json:"is_gps_enabled" gorm:"default:true"`
    
    // Indonesian Compliance Fields
    STNKNumber              string    `json:"stnk_number" gorm:"size:20"`
    BPKBNumber              string    `json:"bpkb_number" gorm:"size:20"`
    InsurancePolicyNumber   string    `json:"insurance_policy_number" gorm:"size:50"`
    LastInspectionDate      *time.Time `json:"last_inspection_date"`
    NextInspectionDate      *time.Time `json:"next_inspection_date"`
    
    // Timestamps
    CreatedAt               time.Time `json:"created_at"`
    UpdatedAt               time.Time `json:"updated_at"`
    DeletedAt               gorm.DeletedAt `json:"deleted_at" gorm:"index"`
    
    // Relationships
    Company                 Company   `json:"company" gorm:"foreignKey:CompanyID"`
    Driver                  *Driver   `json:"driver" gorm:"foreignKey:DriverID"`
}
```

### Indonesian Compliance Features

#### 1. **STNK Validation**
```go
func ValidateSTNKNumber(stnkNumber string) error {
    // Indonesian STNK format validation
    // Format: XXXX-XXXX-XXXX-XXXX
    pattern := `^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`
    matched, _ := regexp.MatchString(pattern, stnkNumber)
    if !matched {
        return errors.New("invalid STNK number format")
    }
    return nil
}
```

#### 2. **License Plate Validation**
```go
func ValidateIndonesianLicensePlate(plate string) error {
    // Indonesian license plate format: B 1234 ABC
    pattern := `^[A-Z]{1,2}\s[0-9]{1,4}\s[A-Z]{1,3}$`
    matched, _ := regexp.MatchString(pattern, plate)
    if !matched {
        return errors.New("invalid Indonesian license plate format")
    }
    return nil
}
```

#### 3. **Inspection Date Tracking**
```go
func (s *VehicleService) UpdateInspectionDate(companyID, vehicleID string, inspectionDate time.Time) error {
    // Update inspection dates and send notifications
    vehicle := &Vehicle{}
    if err := s.db.Where("company_id = ? AND id = ?", companyID, vehicleID).First(vehicle).Error; err != nil {
        return err
    }
    
    vehicle.LastInspectionDate = &inspectionDate
    vehicle.NextInspectionDate = &time.Time{inspectionDate.AddDate(1, 0, 0)} // 1 year later
    
    return s.db.Save(vehicle).Error
}
```

### API Request/Response Models

#### Create Vehicle Request
```go
type CreateVehicleRequest struct {
    Make                    string     `json:"make" validate:"required,min=2,max=100"`
    Model                   string     `json:"model" validate:"required,min=2,max=100"`
    Year                    int        `json:"year" validate:"required,min=1900,max=2030"`
    LicensePlate            string     `json:"license_plate" validate:"required,min=5,max=20"`
    VIN                     string     `json:"vin" validate:"required,len=17"`
    Color                   string     `json:"color" validate:"required,min=2,max=50"`
    FuelType                string     `json:"fuel_type" validate:"required,oneof=gasoline diesel electric hybrid"`
    CurrentOdometer         int        `json:"current_odometer" validate:"min=0"`
    PurchaseDate            *time.Time `json:"purchase_date"`
    DriverID                *string    `json:"driver_id,omitempty"`
    
    // Indonesian Compliance Fields
    STNKNumber              string     `json:"stnk_number" validate:"required,min=10,max=20"`
    BPKBNumber              string     `json:"bpkb_number" validate:"required,min=10,max=20"`
    InsurancePolicyNumber   string     `json:"insurance_policy_number" validate:"required,min=5,max=50"`
    LastInspectionDate      *time.Time `json:"last_inspection_date"`
}
```

#### Vehicle Response
```go
type VehicleResponse struct {
    ID                      string     `json:"id"`
    Make                    string     `json:"make"`
    Model                   string     `json:"model"`
    Year                    int        `json:"year"`
    LicensePlate            string     `json:"license_plate"`
    VIN                     string     `json:"vin"`
    Color                   string     `json:"color"`
    FuelType                string     `json:"fuel_type"`
    CurrentOdometer         int        `json:"current_odometer"`
    LastMaintenanceOdometer int        `json:"last_maintenance_odometer"`
    PurchaseDate            *time.Time `json:"purchase_date"`
    Status                  string     `json:"status"`
    IsActive                bool       `json:"is_active"`
    IsGPSEnabled            bool       `json:"is_gps_enabled"`
    
    // Indonesian Compliance Fields
    STNKNumber              string     `json:"stnk_number"`
    BPKBNumber              string     `json:"bpkb_number"`
    InsurancePolicyNumber   string     `json:"insurance_policy_number"`
    LastInspectionDate      *time.Time `json:"last_inspection_date"`
    NextInspectionDate      *time.Time `json:"next_inspection_date"`
    
    // Relationships
    Driver                  *DriverResponse `json:"driver,omitempty"`
    
    // Timestamps
    CreatedAt               time.Time  `json:"created_at"`
    UpdatedAt               time.Time  `json:"updated_at"`
}
```

### Search and Filtering

#### Vehicle Filters
```go
type VehicleFilters struct {
    Status      *string `json:"status" form:"status"`
    Make        *string `json:"make" form:"make"`
    Model       *string `json:"model" form:"model"`
    Year        *int    `json:"year" form:"year"`
    FuelType    *string `json:"fuel_type" form:"fuel_type"`
    HasDriver   *bool   `json:"has_driver" form:"has_driver"`
    GPSEnabled  *bool   `json:"gps_enabled" form:"gps_enabled"`
    Search      *string `json:"search" form:"search"` // Search in make, model, license plate
    
    // Pagination
    Page        int     `json:"page" form:"page" validate:"min=1"`
    Limit       int     `json:"limit" form:"limit" validate:"min=1,max=100"`
    SortBy      string  `json:"sort_by" form:"sort_by" validate:"oneof=created_at updated_at make model year license_plate"`
    SortOrder   string  `json:"sort_order" form:"sort_order" validate:"oneof=asc desc"`
}
```

#### Vehicle History Request/Response Models 🚧 **NEW**
```go
// Add Vehicle History Request
type AddHistoryRequest struct {
    EventType       string     `json:"event_type" validate:"required,oneof=maintenance repair status_change inspection assignment"`
    EventCategory   string     `json:"event_category" validate:"required,oneof=scheduled emergency compliance operational"`
    Title           string     `json:"title" validate:"required,min=5,max=200"`
    Description     string     `json:"description" validate:"required,min=10,max=1000"`
    MileageAtEvent  int        `json:"mileage_at_event" validate:"min=0"`
    Cost            float64    `json:"cost" validate:"min=0"`
    Currency        string     `json:"currency" validate:"len=3"`
    Location        string     `json:"location" validate:"max=200"`
    ServiceProvider string     `json:"service_provider" validate:"max=200"`
    InvoiceNumber   string     `json:"invoice_number" validate:"max=50"`
    Documents       JSON       `json:"documents"`
    NextServiceDue  *time.Time `json:"next_service_due"`
}

// Vehicle History Response
type VehicleHistoryResponse struct {
    ID              string     `json:"id"`
    VehicleID       string     `json:"vehicle_id"`
    EventType       string     `json:"event_type"`
    EventCategory   string     `json:"event_category"`
    Title           string     `json:"title"`
    Description     string     `json:"description"`
    MileageAtEvent  int        `json:"mileage_at_event"`
    Cost            float64    `json:"cost"`
    Currency        string     `json:"currency"`
    Location        string     `json:"location"`
    ServiceProvider string     `json:"service_provider"`
    InvoiceNumber   string     `json:"invoice_number"`
    Documents       JSON       `json:"documents"`
    NextServiceDue  *time.Time `json:"next_service_due"`
    CreatedBy       string     `json:"created_by"`
    CreatedAt       time.Time  `json:"created_at"`
}

// History Filters
type HistoryFilters struct {
    EventType       *string    `json:"event_type" form:"event_type"`
    EventCategory   *string    `json:"event_category" form:"event_category"`
    StartDate       *time.Time `json:"start_date" form:"start_date"`
    EndDate         *time.Time `json:"end_date" form:"end_date"`
    MinCost         *float64   `json:"min_cost" form:"min_cost"`
    MaxCost         *float64   `json:"max_cost" form:"max_cost"`
    ServiceProvider *string    `json:"service_provider" form:"service_provider"`
    Search          *string    `json:"search" form:"search"`
    
    // Pagination
    Page            int        `json:"page" form:"page" validate:"min=1"`
    Limit           int        `json:"limit" form:"limit" validate:"min=1,max=100"`
    SortBy          string     `json:"sort_by" form:"sort_by" validate:"oneof=created_at cost mileage_at_event"`
    SortOrder       string     `json:"sort_order" form:"sort_order" validate:"oneof=asc desc"`
}
```

## 🚀 Immediate Next Actions

### ✅ **COMPLETED - Core Vehicle Management**
1. ✅ **Vehicle Service Implementation** - Complete CRUD operations with database integration
2. ✅ **Vehicle Handler Implementation** - Full HTTP endpoints with validation
3. ✅ **Vehicle Status Management** - Status tracking and updates
4. ✅ **Driver Assignment System** - Complete assignment/unassignment functionality
5. ✅ **Search and Filtering** - Advanced search with pagination and sorting
6. ✅ **Indonesian Compliance Features** - STNK/BPKB validation and inspection tracking

### 🚧 **CURRENT PRIORITY - Vehicle History Tracking (Week 4)**
1. **Vehicle History Model & Repository** (1 day)
   - Create `VehicleHistory` GORM model with Indonesian compliance fields
   - Implement repository pattern for history data access
   - Add database indexes for performance optimization

2. **Vehicle History Service Implementation** (2 days)
   - Implement `AddVehicleHistory` with automatic event categorization
   - Create `GetVehicleHistory` with advanced filtering and pagination
   - Add `GetMaintenanceHistory` for maintenance-specific queries
   - Implement `GetUpcomingMaintenance` for proactive maintenance alerts

3. **Vehicle History API Endpoints** (2 days)
   - `GET /api/v1/vehicles/:id/history` - Get vehicle history with filters
   - `POST /api/v1/vehicles/:id/history` - Add history entry
   - `GET /api/v1/vehicles/:id/maintenance` - Get maintenance history only
   - `GET /api/v1/vehicles/maintenance/upcoming` - Get upcoming maintenance
   - `PUT /api/v1/vehicles/:id/history/:historyId` - Update history entry

4. **Indonesian Compliance Integration** (1 day)
   - Integrate with existing STNK/BPKB validation
   - Add maintenance cost tracking in IDR
   - Create compliance audit trail functionality
   - Add service provider validation and tracking

### 📋 **Future Enhancements (Post-History Implementation)**
1. **Advanced Analytics** - Cost analysis, maintenance trends, predictive maintenance
2. **Document Management** - Upload and store maintenance receipts, invoices, certificates
3. **Maintenance Scheduling** - Automated maintenance reminders and scheduling
4. **Integration Testing** - Comprehensive testing of history tracking functionality

## 🔧 Development Commands

```bash
# Start development environment
cd backend
make docker-up

# Run the server
make run

# Run tests
make test

# Generate Swagger docs
make swagger

# Database migrations
make migrate-up
```

## 📊 Success Metrics

### Technical Metrics
- [ ] API response time < 200ms (95th percentile)
- [ ] 100% CRUD operation coverage
- [ ] 90%+ test coverage
- [ ] Zero critical security vulnerabilities

### Business Metrics
- [ ] Support 1000+ concurrent vehicle operations
- [ ] Indonesian compliance validation 100% accurate
- [ ] Real-time vehicle status updates
- [ ] Complete driver assignment functionality

### Indonesian Market Compliance
- [ ] STNK number validation working
- [ ] BPKB tracking functional
- [ ] Indonesian license plate validation
- [ ] Inspection date management

---

## 📝 Changelog

### 2025-01-XX - Vehicle History Tracking Evolution
**Status**: Core vehicle management complete, adding history tracking
**Key Changes**:
- ✅ Updated status from "Planning" to "Implementation Complete - Adding Vehicle History Tracking"
- ✅ Marked all core CRUD operations as completed
- ✅ Added comprehensive Vehicle History Tracking system design
- ✅ Defined VehicleHistory GORM model with Indonesian compliance fields
- ✅ Added new API endpoints for history management
- ✅ Created request/response models for history operations
- ✅ Updated immediate next actions to focus on history tracking implementation
- ✅ Added Indonesian compliance integration for maintenance tracking

**Next Priority**: Implement vehicle history tracking with maintenance, repair, and compliance event logging

---

**Core vehicle management APIs complete! Now implementing comprehensive vehicle history tracking for Indonesian fleet management companies!** 🚛📋
