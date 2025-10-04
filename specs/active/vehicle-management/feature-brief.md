# Vehicle Management APIs - Feature Brief

**Task ID**: `vehicle-management`  
**Status**: Planning  
**Priority**: High  
**Estimated Time**: 2-3 weeks  
**Assigned To**: Backend Team  

## 📋 Problem Statement

**User Need**: Fleet managers need comprehensive vehicle management capabilities to track, maintain, and optimize their vehicle fleet with Indonesian compliance requirements.

**Current State**: 
- ✅ Backend infrastructure complete with service/handler structures
- ✅ GORM models implemented with Indonesian compliance fields
- ✅ API endpoint stubs created
- ❌ **Missing**: Actual business logic implementation for vehicle CRUD operations

**Business Impact**: Without functional vehicle management APIs, fleet managers cannot:
- Add/update/remove vehicles from their fleet
- Track vehicle status and maintenance schedules
- Assign drivers to vehicles
- Monitor vehicle performance and compliance
- Generate vehicle reports and analytics

## 🎯 Success Criteria

### ✅ Technical Requirements
- [ ] Complete vehicle CRUD operations with database integration
- [ ] Vehicle status tracking (active, maintenance, retired)
- [ ] Driver assignment functionality
- [ ] Company-based filtering and permissions
- [ ] Vehicle search and filtering endpoints
- [ ] Vehicle history tracking
- [ ] Indonesian compliance validation (STNK, BPKB)

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
GET    /api/v1/vehicles/:id/history        // Vehicle history
POST   /api/v1/vehicles/:id/assign-driver  // Assign driver
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

## 🚀 Immediate Next Actions

### Week 1: Core CRUD Implementation
1. **Implement Vehicle Service** (2 days)
   - Create `internal/vehicle/service.go` with CRUD operations
   - Add database transaction handling
   - Implement Indonesian compliance validation
   - Add error handling and logging

2. **Implement Vehicle Handler** (2 days)
   - Create `internal/vehicle/handler.go` with HTTP endpoints
   - Add request validation and response formatting
   - Implement middleware integration
   - Add Swagger documentation

3. **Add Vehicle Status Management** (1 day)
   - Implement status update functionality
   - Add status change history tracking
   - Create status validation logic

### Week 2: Advanced Features
1. **Driver Assignment System** (2 days)
   - Implement driver assignment/unassignment
   - Add driver-vehicle relationship validation
   - Create assignment history tracking

2. **Search and Filtering** (2 days)
   - Implement advanced search functionality
   - Add pagination and sorting
   - Create filter validation

3. **Indonesian Compliance Features** (1 day)
   - Implement STNK/BPKB validation
   - Add license plate format validation
   - Create inspection date tracking

### Week 3: Testing and Documentation
1. **Unit Testing** (2 days)
   - Write comprehensive unit tests
   - Add test coverage reporting
   - Create mock data for testing

2. **Integration Testing** (2 days)
   - Create API integration tests
   - Add database integration tests
   - Test Indonesian compliance features

3. **Documentation and Review** (1 day)
   - Update API documentation
   - Code review and optimization
   - Performance testing

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

**Ready to implement comprehensive vehicle management APIs for Indonesian fleet management companies!** 🚛
