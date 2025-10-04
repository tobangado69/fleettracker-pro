# Vehicle Management APIs - TODO List

**Task ID**: `vehicle-management`  
**Status**: In Progress  
**Priority**: High  
**Estimated Time**: 2-3 weeks  

## 🎯 **OVERVIEW**

Implement comprehensive vehicle management APIs with Indonesian compliance features for FleetTracker Pro backend.

## 📋 **TODO LIST**

### **Week 1: Core CRUD Implementation**

#### **Day 1-2: Vehicle Service Implementation**
- [ ] **Create Vehicle Service Structure**
  - [ ] Implement `internal/vehicle/service.go` with VehicleService struct
  - [ ] Add database connection and Redis client integration
  - [ ] Create service constructor with dependency injection
  - [ ] Add logging and error handling setup

- [ ] **Implement Core CRUD Operations**
  - [ ] `CreateVehicle(companyID string, req CreateVehicleRequest) (*Vehicle, error)`
  - [ ] `GetVehicle(companyID, vehicleID string) (*Vehicle, error)`
  - [ ] `UpdateVehicle(companyID, vehicleID string, req UpdateVehicleRequest) (*Vehicle, error)`
  - [ ] `DeleteVehicle(companyID, vehicleID string) error`
  - [ ] `ListVehicles(companyID string, filters VehicleFilters) ([]Vehicle, error)`

- [ ] **Add Database Transaction Handling**
  - [ ] Implement transaction support for complex operations
  - [ ] Add rollback handling for failed operations
  - [ ] Create database connection pooling optimization

#### **Day 3-4: Vehicle Handler Implementation**
- [ ] **Create Vehicle Handler Structure**
  - [ ] Implement `internal/vehicle/handler.go` with VehicleHandler struct
  - [ ] Add service dependency injection
  - [ ] Create handler constructor

- [ ] **Implement HTTP Endpoints**
  - [ ] `GET /api/v1/vehicles` - List vehicles with filters
  - [ ] `POST /api/v1/vehicles` - Create vehicle
  - [ ] `GET /api/v1/vehicles/:id` - Get vehicle details
  - [ ] `PUT /api/v1/vehicles/:id` - Update vehicle
  - [ ] `DELETE /api/v1/vehicles/:id` - Delete vehicle

- [ ] **Add Request/Response Handling**
  - [ ] Implement request validation using struct tags
  - [ ] Add response formatting and error handling
  - [ ] Create proper HTTP status codes
  - [ ] Add request/response logging

- [ ] **Middleware Integration**
  - [ ] Add JWT authentication middleware
  - [ ] Implement company-based access control
  - [ ] Add rate limiting and security headers
  - [ ] Create input validation middleware

#### **Day 5: Vehicle Status Management**
- [ ] **Implement Vehicle Status System**
  - [ ] Create VehicleStatus enum (active, maintenance, retired, inactive)
  - [ ] `UpdateVehicleStatus(companyID, vehicleID string, status VehicleStatus, reason string) error`
  - [ ] Add status change history tracking
  - [ ] Implement status validation logic

- [ ] **Add Status History Tracking**
  - [ ] Create VehicleStatusHistory model
  - [ ] Implement status change logging
  - [ ] Add status change notifications
  - [ ] Create status history API endpoint

### **Week 2: Advanced Features**

#### **Day 6-7: Driver Assignment System**
- [ ] **Implement Driver Assignment**
  - [ ] `AssignDriver(companyID, vehicleID, driverID string) error`
  - [ ] `UnassignDriver(companyID, vehicleID string) error`
  - [ ] `GetVehicleDriver(companyID, vehicleID string) (*Driver, error)`
  - [ ] Add driver-vehicle relationship validation

- [ ] **Assignment Validation Logic**
  - [ ] Check if driver is available for assignment
  - [ ] Validate driver has valid license
  - [ ] Ensure vehicle is available for assignment
  - [ ] Add assignment conflict detection

- [ ] **Assignment History Tracking**
  - [ ] Create VehicleDriverHistory model
  - [ ] Implement assignment change logging
  - [ ] Add assignment notifications
  - [ ] Create assignment history API endpoint

#### **Day 8-9: Search and Filtering**
- [ ] **Implement Advanced Search**
  - [ ] Add search functionality across make, model, license plate
  - [ ] Implement full-text search with PostgreSQL
  - [ ] Add search result ranking and relevance

- [ ] **Add Filtering System**
  - [ ] Implement status filtering
  - [ ] Add make/model/year filtering
  - [ ] Create fuel type filtering
  - [ ] Add driver assignment filtering
  - [ ] Implement GPS enabled filtering

- [ ] **Pagination and Sorting**
  - [ ] Add pagination with page/limit parameters
  - [ ] Implement sorting by multiple fields
  - [ ] Add sort order (asc/desc) support
  - [ ] Create pagination metadata in response

#### **Day 10: Indonesian Compliance Features**
- [ ] **STNK Validation**
  - [ ] Implement STNK number format validation
  - [ ] Add STNK number uniqueness check
  - [ ] Create STNK validation error messages

- [ ] **License Plate Validation**
  - [ ] Implement Indonesian license plate format validation
  - [ ] Add license plate uniqueness check
  - [ ] Create license plate validation error messages

- [ ] **Inspection Date Management**
  - [ ] `UpdateInspectionDate(companyID, vehicleID string, inspectionDate time.Time) error`
  - [ ] Add automatic next inspection date calculation
  - [ ] Implement inspection date notifications
  - [ ] Create inspection date validation

### **Week 3: Testing and Documentation**

#### **Day 11-12: Unit Testing**
- [ ] **Service Layer Tests**
  - [ ] Write unit tests for all CRUD operations
  - [ ] Add tests for error handling scenarios
  - [ ] Create tests for Indonesian compliance validation
  - [ ] Add tests for driver assignment logic

- [ ] **Handler Layer Tests**
  - [ ] Write unit tests for all HTTP endpoints
  - [ ] Add tests for request validation
  - [ ] Create tests for response formatting
  - [ ] Add tests for error responses

- [ ] **Test Coverage**
  - [ ] Achieve 90%+ test coverage
  - [ ] Add test coverage reporting
  - [ ] Create mock data for testing
  - [ ] Add test utilities and helpers

#### **Day 13-14: Integration Testing**
- [ ] **API Integration Tests**
  - [ ] Create end-to-end API tests
  - [ ] Add database integration tests
  - [ ] Test authentication and authorization
  - [ ] Add performance tests

- [ ] **Database Integration Tests**
  - [ ] Test database transactions
  - [ ] Add foreign key constraint tests
  - [ ] Test database indexing
  - [ ] Add data integrity tests

- [ ] **Indonesian Compliance Tests**
  - [ ] Test STNK validation scenarios
  - [ ] Add license plate validation tests
  - [ ] Test inspection date management
  - [ ] Add compliance error handling tests

#### **Day 15: Documentation and Review**
- [ ] **API Documentation**
  - [ ] Update Swagger documentation
  - [ ] Add API examples and schemas
  - [ ] Create API usage guides
  - [ ] Add authentication documentation

- [ ] **Code Review and Optimization**
  - [ ] Perform code review
  - [ ] Optimize database queries
  - [ ] Add performance monitoring
  - [ ] Create deployment documentation

## 🏗️ **IMPLEMENTATION DETAILS**

### **Request/Response Models**

#### **Create Vehicle Request**
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

#### **Vehicle Filters**
```go
type VehicleFilters struct {
    Status      *string `json:"status" form:"status"`
    Make        *string `json:"make" form:"make"`
    Model       *string `json:"model" form:"model"`
    Year        *int    `json:"year" form:"year"`
    FuelType    *string `json:"fuel_type" form:"fuel_type"`
    HasDriver   *bool   `json:"has_driver" form:"has_driver"`
    GPSEnabled  *bool   `json:"gps_enabled" form:"gps_enabled"`
    Search      *string `json:"search" form:"search"`
    
    // Pagination
    Page        int     `json:"page" form:"page" validate:"min=1"`
    Limit       int     `json:"limit" form:"limit" validate:"min=1,max=100"`
    SortBy      string  `json:"sort_by" form:"sort_by" validate:"oneof=created_at updated_at make model year license_plate"`
    SortOrder   string  `json:"sort_order" form:"sort_order" validate:"oneof=asc desc"`
}
```

### **API Endpoints**

```
GET    /api/v1/vehicles                    // List vehicles with filters
POST   /api/v1/vehicles                    // Create vehicle
GET    /api/v1/vehicles/:id                // Get vehicle details
PUT    /api/v1/vehicles/:id                // Update vehicle
DELETE /api/v1/vehicles/:id                // Delete vehicle
GET    /api/v1/vehicles/:id/history        // Vehicle history
POST   /api/v1/vehicles/:id/assign-driver  // Assign driver
DELETE /api/v1/vehicles/:id/driver         // Unassign driver
PUT    /api/v1/vehicles/:id/status         // Update vehicle status
PUT    /api/v1/vehicles/:id/inspection     // Update inspection date
```

### **Indonesian Compliance Features**

#### **STNK Validation**
```go
func ValidateSTNKNumber(stnkNumber string) error {
    pattern := `^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`
    matched, _ := regexp.MatchString(pattern, stnkNumber)
    if !matched {
        return errors.New("invalid STNK number format")
    }
    return nil
}
```

#### **License Plate Validation**
```go
func ValidateIndonesianLicensePlate(plate string) error {
    pattern := `^[A-Z]{1,2}\s[0-9]{1,4}\s[A-Z]{1,3}$`
    matched, _ := regexp.MatchString(pattern, plate)
    if !matched {
        return errors.New("invalid Indonesian license plate format")
    }
    return nil
}
```

## 🎯 **SUCCESS CRITERIA**

### **Technical Requirements**
- [ ] Complete vehicle CRUD operations with database integration
- [ ] Vehicle status tracking (active, maintenance, retired)
- [ ] Driver assignment functionality
- [ ] Company-based filtering and permissions
- [ ] Vehicle search and filtering endpoints
- [ ] Vehicle history tracking
- [ ] Indonesian compliance validation (STNK, BPKB)

### **Performance Requirements**
- [ ] API response time < 200ms (95th percentile)
- [ ] Support 1000+ concurrent vehicle operations
- [ ] Efficient database queries with proper indexing
- [ ] Real-time status updates

### **Indonesian Market Requirements**
- [ ] STNK number validation working
- [ ] BPKB tracking functional
- [ ] Indonesian license plate validation
- [ ] Inspection date management

## 🚀 **DEVELOPMENT COMMANDS**

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

---

**Ready to implement comprehensive vehicle management APIs!** 🚛
