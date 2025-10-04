# Backend Refactoring - Implementation Guide

**Status**: 🚧 In Progress (8% Complete)  
**Branch**: `refactor-implementation`  
**Started**: 2025-10-04

---

## 🎯 Quick Overview

**Goal**: Refactor FleetTracker Pro backend for production-readiness with:
- ✅ Standardized error handling
- ⏳ Repository pattern with interfaces
- ⏳ Thin controllers (< 50 lines per handler)
- ⏳ < 3% code duplication
- ⏳ < 100ms response time
- ✅ 80%+ test coverage maintained

**Progress**: Phase 2 of 10 (Error handling foundation complete)

---

## ✅ Completed Work

### Phase 1: Planning & Analysis (100%)
- [x] Created comprehensive refactor brief (500 lines)
- [x] Created todo-list with 78 tasks
- [x] Created progress tracking system
- [x] Updated README with project status
- [x] Created backup branches

### Phase 2: Error Handling (50%)
- [x] **Task 2.1**: Custom error package (`pkg/errors/errors.go`)
  - AppError struct with full error context
  - 10+ error constructors (NotFound, Unauthorized, Validation, etc.)
  - Error wrapping utilities
  - 275 lines of production-ready code

- [x] **Task 2.2**: Error handling middleware
  - ErrorHandler for standardized responses
  - RecoveryHandler for panic recovery
  - Helper functions (AbortWithError, etc.)
  - Structured logging with request context
  - 200+ lines of middleware code

---

## 🔄 Next Steps (Phase 2 Completion)

### Task 2.3: Update Handlers to Use New Error System

**Goal**: Replace inconsistent error handling with new AppError system

#### 1. Auth Handler (`internal/auth/handler.go`)

**Current Pattern (Inconsistent)**:
```go
// Old way - multiple patterns
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": msg})
```

**New Pattern (Standardized)**:
```go
// Import our error package
import "github.com/tobangado69/fleettracker-pro/backend/pkg/errors"
import "github.com/tobangado69/fleettracker-pro/backend/internal/common/middleware"

// In handlers - use helper functions
func (h *Handler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.AbortWithValidation(c, "Invalid login request")
        return
    }
    
    user, token, err := h.service.Login(req)
    if err != nil {
        _ = c.Error(err) // Let ErrorHandler middleware handle it
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"user": user, "token": token})
}
```

#### 2. Vehicle Handler (`internal/vehicle/handler.go`)

**Files to Update**:
- `handler.go` - Main CRUD handlers
- `history_handler.go` - History-specific handlers

**Pattern**:
```go
func (h *Handler) GetVehicle(c *gin.Context) {
    id := c.Param("id")
    
    vehicle, err := h.service.GetVehicle(c.Request.Context(), id)
    if err != nil {
        _ = c.Error(err) // Service returns AppError
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"vehicle": vehicle})
}
```

#### 3. Driver Handler (`internal/driver/handler.go`)

**Focus**: Update all CRUD operations and performance tracking endpoints

#### 4. Tracking Handler (`internal/tracking/handler.go`)

**Focus**: GPS endpoints and WebSocket error handling

#### 5. Payment Handler (`internal/payment/handler.go`)

**Focus**: Payment processing and webhook endpoints

#### 6. Analytics Handler (`internal/analytics/handler.go`)

**Focus**: Dashboard and reporting endpoints (will split later in Phase 4)

---

### Task 2.4: Update Services to Return AppError

**Goal**: Services return typed errors instead of generic errors

#### Pattern for All Services:

**Before**:
```go
func (s *Service) GetVehicle(ctx context.Context, id string) (*models.Vehicle, error) {
    var vehicle models.Vehicle
    if err := s.db.First(&vehicle, "id = ?", id).Error; err != nil {
        return nil, err // Generic error
    }
    return &vehicle, nil
}
```

**After**:
```go
import "github.com/tobangado69/fleettracker-pro/backend/pkg/errors"

func (s *Service) GetVehicle(ctx context.Context, id string) (*models.Vehicle, error) {
    var vehicle models.Vehicle
    if err := s.db.First(&vehicle, "id = ?", id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return nil, errors.NewNotFoundError("Vehicle")
        }
        return nil, errors.NewInternalError("Failed to fetch vehicle").WithInternal(err)
    }
    return &vehicle, nil
}
```

#### Services to Update:

1. **Auth Service** (`internal/auth/service.go`)
   - Login: Return Unauthorized for wrong credentials
   - Register: Return Conflict for duplicate email
   - Validation errors for invalid input

2. **Vehicle Service** (`internal/vehicle/service.go` + `history_service.go`)
   - NotFound for missing vehicles
   - Forbidden for wrong company access
   - Validation for Indonesian compliance

3. **Driver Service** (`internal/driver/service.go`)
   - NotFound for missing drivers
   - Validation for NIK/SIM
   - Conflict for duplicate SIM numbers

4. **Tracking Service** (`internal/tracking/service.go`)
   - NotFound for missing trips
   - Validation for GPS coordinates
   - BadRequest for invalid time ranges

5. **Payment Service** (`internal/payment/service.go`)
   - NotFound for missing invoices
   - Conflict for duplicate payments
   - Validation for payment amounts

6. **Analytics Service** (`internal/analytics/service.go`)
   - BadRequest for invalid date ranges
   - NotFound for missing data
   - Internal for calculation errors

---

## 🚀 Implementation Strategy

### Step-by-Step Process:

1. **One Service at a Time**
   - Start with Auth (smallest, most critical)
   - Then Vehicle, Driver, Tracking, Payment, Analytics
   - Commit after each service update

2. **Update Pattern**
   ```bash
   # For each service:
   1. Update service.go to return AppError
   2. Update handler.go to use error helpers
   3. Run tests: go test ./internal/{service}/...
   4. Fix any broken tests
   5. Commit: "refactor({service}): use standardized error handling"
   ```

3. **Testing Strategy**
   - Run service tests after each update
   - Ensure all 4,566 lines of tests still pass
   - Fix any test failures immediately
   - Maintain 80%+ coverage

4. **Commit Strategy**
   - Small, focused commits
   - One service per commit
   - Clear commit messages
   - Easy to review and rollback

---

## 📋 Checklist for Each Service

### Auth Service
- [ ] Update `auth/service.go` error returns
- [ ] Update `auth/handler.go` error handling
- [ ] Run tests: `go test ./internal/auth/...`
- [ ] Verify 348 lines of tests pass
- [ ] Commit changes

### Vehicle Service
- [ ] Update `vehicle/service.go` error returns
- [ ] Update `vehicle/history_service.go` error returns
- [ ] Update `vehicle/handler.go` error handling
- [ ] Update `vehicle/history_handler.go` error handling
- [ ] Run tests: `go test ./internal/vehicle/...`
- [ ] Verify 504 lines of tests pass
- [ ] Commit changes

### Driver Service
- [ ] Update `driver/service.go` error returns
- [ ] Update `driver/handler.go` error handling
- [ ] Run tests: `go test ./internal/driver/...`
- [ ] Verify 657 lines of tests pass
- [ ] Commit changes

### Tracking Service
- [ ] Update `tracking/service.go` error returns
- [ ] Update `tracking/handler.go` error handling
- [ ] Run tests: `go test ./internal/tracking/...`
- [ ] Verify 638 lines of tests pass
- [ ] Commit changes

### Payment Service
- [ ] Update `payment/service.go` error returns
- [ ] Update `payment/handler.go` error handling
- [ ] Run tests: `go test ./internal/payment/...`
- [ ] Verify 480 lines of tests pass
- [ ] Commit changes

### Analytics Service
- [ ] Update `analytics/service.go` error returns
- [ ] Update `analytics/handler.go` error handling
- [ ] Run tests (if any exist)
- [ ] Commit changes

---

## 🧪 Testing Commands

```bash
# Test individual services
go test -v ./internal/auth/...
go test -v ./internal/vehicle/...
go test -v ./internal/driver/...
go test -v ./internal/tracking/...
go test -v ./internal/payment/...

# Test all at once
go test -v ./internal/...

# With coverage
go test -cover ./internal/...

# Run comprehensive coverage script
./test-coverage.sh
```

---

## 🎯 Success Criteria for Phase 2

- [x] Custom error package created ✅
- [x] Error handling middleware created ✅
- [ ] All handlers use standardized error responses
- [ ] All services return AppError
- [ ] All tests passing (4,566 lines, 80%+)
- [ ] Zero linter warnings
- [ ] Consistent error format across all endpoints

**Target**: Complete Phase 2 by end of Day 1

---

## 📚 Code Examples

### Complete Handler Example

```go
package auth

import (
    "github.com/gin-gonic/gin"
    "github.com/tobangado69/fleettracker-pro/backend/internal/common/middleware"
    "github.com/tobangado69/fleettracker-pro/backend/pkg/errors"
    "net/http"
)

type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}

// Login authenticates a user
// @Summary Login user
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} TokenResponse
// @Failure 400 {object} middleware.ErrorResponse
// @Failure 401 {object} middleware.ErrorResponse
// @Router /auth/login [post]
func (h *Handler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.AbortWithValidation(c, "Invalid login request")
        return
    }
    
    user, tokenResp, err := h.service.Login(req)
    if err != nil {
        _ = c.Error(err)
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "user":  user,
            "token": tokenResp,
        },
    })
}

// Register creates a new user
func (h *Handler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.AbortWithValidation(c, "Invalid registration request")
        return
    }
    
    user, err := h.service.Register(req)
    if err != nil {
        _ = c.Error(err)
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "data":    user,
    })
}
```

### Complete Service Example

```go
package auth

import (
    "context"
    "github.com/tobangado69/fleettracker-pro/backend/pkg/errors"
    "github.com/tobangado69/fleettracker-pro/backend/pkg/models"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type Service struct {
    db        *gorm.DB
    jwtSecret string
}

func NewService(db *gorm.DB, jwtSecret string) *Service {
    return &Service{
        db:        db,
        jwtSecret: jwtSecret,
    }
}

func (s *Service) Login(req LoginRequest) (*models.User, *TokenResponse, error) {
    var user models.User
    if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return nil, nil, errors.NewUnauthorizedError("Invalid email or password")
        }
        return nil, nil, errors.NewInternalError("Failed to authenticate").WithInternal(err)
    }
    
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        return nil, nil, errors.NewUnauthorizedError("Invalid email or password")
    }
    
    token, err := s.generateToken(&user)
    if err != nil {
        return nil, nil, errors.NewInternalError("Failed to generate token").WithInternal(err)
    }
    
    return &user, token, nil
}

func (s *Service) Register(req RegisterRequest) (*models.User, error) {
    // Check if user exists
    var existingUser models.User
    if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
        return nil, errors.NewConflictError("Email already registered")
    }
    
    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, errors.NewInternalError("Failed to hash password").WithInternal(err)
    }
    
    // Create user
    user := &models.User{
        CompanyID: req.CompanyID,
        Email:     req.Email,
        Username:  req.Username,
        Password:  string(hashedPassword),
        FirstName: req.FirstName,
        LastName:  req.LastName,
        Phone:     req.Phone,
        Role:      req.Role,
        IsActive:  true,
    }
    
    if err := s.db.Create(user).Error; err != nil {
        return nil, errors.NewInternalError("Failed to create user").WithInternal(err)
    }
    
    return user, nil
}
```

---

## 🔧 Troubleshooting

### Issue: Tests Failing After Error Update

**Solution**:
```go
// Update test assertions
// Old:
assert.Error(t, err)

// New:
assert.Error(t, err)
appErr, ok := err.(*errors.AppError)
assert.True(t, ok)
assert.Equal(t, "NOT_FOUND", appErr.Code)
```

### Issue: Middleware Not Working

**Solution**: Ensure middleware is registered in main.go:
```go
r.Use(middleware.RecoveryHandler())
r.Use(middleware.ErrorHandler()) // Must be last
```

---

## 📊 Progress Tracking

Update `progress.md` after each service:
- Mark tasks as complete
- Update percentage
- Note any issues
- Track time spent

---

## 🎉 When Phase 2 is Complete

- [ ] All 6 services updated
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Commit all changes
- [ ] Merge to main (or continue to Phase 3)
- [ ] Start Phase 3: Repository Pattern

---

**Last Updated**: 2025-10-04  
**Current Focus**: Task 2.3 - Update handlers  
**Next Milestone**: Phase 2 complete (50% → 100%)

