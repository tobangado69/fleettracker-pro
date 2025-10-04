# Todo List: Backend Refactoring

**Task ID:** `refactor-backend`  
**Status:** 🚧 In Progress  
**Created:** 2025-10-04  
**Last Updated:** 2025-10-04

---

## 📋 Implementation Checklist

### Phase 1: Code Analysis & Preparation ✅
- [x] Analyze current codebase structure
- [x] Identify pain points and refactoring targets
- [x] Create feature brief with implementation plan
- [x] Update README with current progress
- [x] Create backup branch for safety

### Phase 2: Error Handling Standardization 🔄 (50% Complete)
- [x] **Task 2.1**: Create custom error package ✅
  - [x] Define `AppError` struct with Code, Message, Status, Err
  - [x] Create common error types (NotFound, Unauthorized, Validation, Internal, Conflict)
  - [x] Add error wrapping utilities
  - [x] Add error logging helpers
- [x] **Task 2.2**: Create error handling middleware ✅
  - [x] Implement `ErrorHandler` middleware
  - [x] Standardize error response format
  - [x] Add error logging with context
  - [x] Handle panic recovery
- [ ] **Task 2.3**: Update all handlers to use new error system (0/6)
  - [ ] Auth handlers error conversion
  - [ ] Vehicle handlers error conversion
  - [ ] Driver handlers error conversion
  - [ ] Tracking handlers error conversion
  - [ ] Payment handlers error conversion
  - [ ] Analytics handlers error conversion
- [ ] **Task 2.4**: Update all services to return AppError (2/6) 🔄
  - [x] Auth service error returns ✅
  - [x] Vehicle service error returns ✅ (service.go + history_service.go)
  - [ ] Driver service error returns
  - [ ] Tracking service error returns
  - [ ] Payment service error returns
  - [ ] Analytics service error returns

### Phase 3: Repository Pattern Implementation 🔄
- [ ] **Task 3.1**: Define repository interfaces
  - [ ] Create `pkg/repository/interfaces.go`
  - [ ] Define `VehicleRepository` interface
  - [ ] Define `DriverRepository` interface
  - [ ] Define `TripRepository` interface
  - [ ] Define `PaymentRepository` interface
  - [ ] Define `GPSTrackRepository` interface
- [ ] **Task 3.2**: Implement concrete repositories
  - [ ] Create `internal/vehicle/repository.go`
  - [ ] Create `internal/driver/repository.go`
  - [ ] Create `internal/tracking/repository.go`
  - [ ] Create `internal/payment/repository.go`
  - [ ] Move database queries from services to repositories
- [ ] **Task 3.3**: Update services to use repository interfaces
  - [ ] Inject repositories via constructors
  - [ ] Replace direct DB calls with repository methods
  - [ ] Update service tests to mock repositories (optional)
- [ ] **Task 3.4**: Optimize repository queries
  - [ ] Add eager loading for common relations
  - [ ] Implement query builders for complex filters
  - [ ] Add pagination helpers
  - [ ] Add transaction support

### Phase 4: Handler Refactoring (Thin Controllers) 🔄
- [ ] **Task 4.1**: Split analytics handler (860 lines → < 300)
  - [ ] Extract dashboard logic to `analytics/dashboard_handler.go`
  - [ ] Extract reports logic to `analytics/reports_handler.go`
  - [ ] Extract charts logic to `analytics/charts_handler.go`
  - [ ] Keep main `handler.go` as route aggregator
- [ ] **Task 4.2**: Refactor vehicle handlers
  - [ ] Move business logic from handlers to service
  - [ ] Ensure handlers only do: bind → validate → call service → respond
  - [ ] Reduce handler functions to < 50 lines
  - [ ] Remove duplicate validation code
- [ ] **Task 4.3**: Refactor driver handlers
  - [ ] Move business logic to service layer
  - [ ] Standardize request binding and validation
  - [ ] Use common response helpers
- [ ] **Task 4.4**: Refactor tracking handlers
  - [ ] Optimize WebSocket handler
  - [ ] Move GPS processing to service layer
  - [ ] Simplify route history handler
- [ ] **Task 4.5**: Refactor payment handlers
  - [ ] Extract payment provider logic
  - [ ] Move calculation logic to service
  - [ ] Standardize webhook handlers
- [ ] **Task 4.6**: Create common handler utilities
  - [ ] `BindAndValidate()` helper
  - [ ] `RespondSuccess()` helper
  - [ ] `RespondError()` helper
  - [ ] `GetUserFromContext()` helper
  - [ ] `ParsePagination()` helper

### Phase 5: Code Duplication Removal (DRY) 🔄
- [ ] **Task 5.1**: Extract common validation functions
  - [ ] Indonesian NIK validator
  - [ ] NPWP validator
  - [ ] SIM validator
  - [ ] License plate validator
  - [ ] Phone number validator
- [ ] **Task 5.2**: Create shared response builders
  - [ ] Pagination response builder
  - [ ] List response builder
  - [ ] Single item response builder
  - [ ] Error response builder
- [ ] **Task 5.3**: Extract common database patterns
  - [ ] Soft delete helper
  - [ ] Find by ID with company filter
  - [ ] List with pagination
  - [ ] Bulk operations helper
- [ ] **Task 5.4**: Consolidate Indonesian compliance logic
  - [ ] Create `pkg/indonesian/` package
  - [ ] Move all ID format validators
  - [ ] Move tax calculation (PPN 11%)
  - [ ] Move date/time helpers (WIB timezone)

### Phase 6: Performance Optimization 🔄
- [ ] **Task 6.1**: Database query optimization
  - [ ] Add indexes for common query patterns
  - [ ] Implement eager loading for N+1 problems
  - [ ] Optimize GPS data queries
  - [ ] Add query result caching
- [ ] **Task 6.2**: Implement Redis caching layer
  - [ ] Create `pkg/cache/` package
  - [ ] Define `Cache` interface
  - [ ] Implement Redis cache
  - [ ] Add cache middleware for GET endpoints
  - [ ] Cache vehicle list
  - [ ] Cache driver list
  - [ ] Cache company settings
- [ ] **Task 6.3**: Add request tracing & logging
  - [ ] Create request ID middleware
  - [ ] Add structured logging middleware
  - [ ] Log slow queries (> 100ms)
  - [ ] Add request/response logging (debug mode)
- [ ] **Task 6.4**: Connection pool tuning
  - [ ] Optimize PostgreSQL pool settings
  - [ ] Optimize Redis pool settings
  - [ ] Add connection metrics

### Phase 7: Middleware Enhancements 🔄
- [ ] **Task 7.1**: Request ID middleware
  - [ ] Generate/extract request ID
  - [ ] Add to response headers
  - [ ] Inject into context
  - [ ] Use in all logs
- [ ] **Task 7.2**: Structured logging middleware
  - [ ] Log request method, path, status
  - [ ] Log response time
  - [ ] Log user ID if authenticated
  - [ ] Log company ID for multi-tenant
- [ ] **Task 7.3**: Performance monitoring middleware
  - [ ] Track endpoint response times
  - [ ] Track database query times
  - [ ] Add metrics endpoint
  - [ ] Alert on slow endpoints
- [ ] **Task 7.4**: Rate limiting improvements
  - [ ] Per-user rate limiting
  - [ ] Per-company rate limiting
  - [ ] Configurable limits per endpoint
  - [ ] Rate limit headers

### Phase 8: Testing & Verification ✅
- [ ] **Task 8.1**: Run all existing tests
  - [ ] Auth service tests (348 lines)
  - [ ] Tracking service tests (638 lines)
  - [ ] Payment service tests (480 lines)
  - [ ] Vehicle service tests (504 lines)
  - [ ] Driver service tests (657 lines)
  - [ ] Integration tests (400 lines)
- [ ] **Task 8.2**: Update tests for refactored code
  - [ ] Update imports
  - [ ] Update function signatures
  - [ ] Fix breaking changes
  - [ ] Maintain 80%+ coverage
- [ ] **Task 8.3**: Add new tests for new code
  - [ ] Error handling tests
  - [ ] Repository tests
  - [ ] Middleware tests
  - [ ] Cache tests
- [ ] **Task 8.4**: Run linters
  - [ ] golangci-lint
  - [ ] go vet
  - [ ] staticcheck
  - [ ] Fix all warnings

### Phase 9: Documentation Updates ✅
- [ ] **Task 9.1**: Update README.md
  - [x] Add project status with achievements ✅
  - [x] Add test coverage statistics ✅
  - [x] Add CI/CD pipeline info ✅
  - [ ] Add architecture section
  - [ ] Add performance benchmarks
- [ ] **Task 9.2**: Create ARCHITECTURE.md
  - [ ] System overview
  - [ ] Component diagram
  - [ ] Data flow diagram
  - [ ] Technology stack details
  - [ ] Design decisions (ADRs)
- [ ] **Task 9.3**: Create CONTRIBUTING.md
  - [ ] Development setup
  - [ ] Code style guide
  - [ ] Testing requirements
  - [ ] PR process
  - [ ] Code review checklist
- [ ] **Task 9.4**: Update inline documentation
  - [ ] Add package documentation
  - [ ] Document exported functions
  - [ ] Add usage examples
  - [ ] Document error cases

### Phase 10: Final Verification & Deployment 🔄
- [ ] **Task 10.1**: Performance benchmarking
  - [ ] Benchmark critical endpoints
  - [ ] Compare before/after metrics
  - [ ] Document improvements
  - [ ] Verify < 100ms response time goal
- [ ] **Task 10.2**: Load testing
  - [ ] Test with 100 concurrent users
  - [ ] Test with 1000 concurrent users
  - [ ] Identify bottlenecks
  - [ ] Optimize as needed
- [ ] **Task 10.3**: Code quality metrics
  - [ ] Run code duplication detector
  - [ ] Verify < 3% duplication
  - [ ] Check cyclomatic complexity
  - [ ] Verify all < 15 complexity
- [ ] **Task 10.4**: Final review
  - [ ] Review all changes
  - [ ] Update TODO.md in root
  - [ ] Create changelog
  - [ ] Merge to main
  - [ ] Tag release

---

## 📊 Progress Tracking

### Completed Tasks: 4 / 78 (5%)
### In Progress: Phase 2 - Error Handling
### Blocked: None
### Next Up: Task 2.1 - Create custom error package

---

## 🎯 Current Sprint Focus

**Sprint Goal**: Standardize error handling and implement repository pattern

**This Week**:
- ✅ Phase 1: Analysis complete
- 🔄 Phase 2: Error handling (Day 1)
- 🔄 Phase 3: Repository pattern (Day 1-2)
- ⏳ Phase 4: Handler refactoring (Day 2)

**Next Week**:
- Phase 5: DRY refactoring
- Phase 6: Performance optimization
- Phase 7: Middleware enhancements
- Phase 8: Testing

---

## 🚧 Blockers & Issues

**Current Blockers**: None

**Potential Risks**:
- Breaking existing tests during refactoring
- Performance regression in optimized queries
- Over-engineering solutions

**Mitigation**:
- Run tests after each major change
- Benchmark before/after optimizations
- Follow YAGNI principle

---

## 📝 Notes

- Keep all existing tests passing (4,566 lines, 80%+ coverage)
- Follow incremental refactoring approach
- Commit after each completed phase
- Document all significant changes
- Maintain backward compatibility where possible

---

**Last Updated**: 2025-10-04  
**Next Review**: After Phase 2 completion

