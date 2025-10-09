# Authentication System APIs - Feature Brief

**Task ID**: `authentication`  
**Created**: October 2025  
**Status**: Ready for Implementation  
**Estimated Duration**: 3-4 days

---

## 🎯 Problem Statement

FleetTracker Pro needs a comprehensive authentication system to secure the SaaS platform, manage user access, and provide role-based permissions for Indonesian fleet management companies. The system must handle user registration, login, password management, JWT token generation, and role-based access control (RBAC) for different user types (company admins, fleet managers, drivers).

**Target Users**:
- Company administrators who need full access to all features
- Fleet managers who need access to vehicle and driver management
- Drivers who need access to mobile GPS tracking and trip management
- System administrators who need access to analytics and reporting
- API clients that need secure access to backend services

---

## 🔍 Research & Existing Patterns

### Authentication Strategy (Based on Successful Patterns)
- **JWT-Based Authentication**: Stateless, scalable for SaaS applications
- **Role-Based Access Control (RBAC)**: Company admin, fleet manager, driver roles
- **Multi-Company Support**: Company-based data isolation and permissions
- **Indonesian Market Compliance**: Data residency and security requirements
- **Mobile-First Design**: Optimized for driver mobile applications
- **Session Management**: Redis-based session storage for scalability

### Technical Patterns (Based on Vehicle/Driver/GPS Success)
- **Service Layer**: Comprehensive business logic with validation
- **Handler Layer**: HTTP endpoints with proper error handling
- **Middleware Integration**: JWT validation and company-based authorization
- **Database Integration**: PostgreSQL with GORM models and relationships
- **Caching Strategy**: Redis for session management and token storage
- **Security Features**: Password hashing, rate limiting, input validation

### Industry Standards for SaaS Authentication
- **JWT Tokens**: Access tokens (15 minutes) and refresh tokens (7 days)
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Login attempt protection and API rate limiting
- **Session Management**: Secure session storage and cleanup
- **Multi-Factor Authentication**: SMS/Email OTP for enhanced security
- **Password Reset**: Secure token-based password reset flow

### Indonesian Market Considerations
- **Data Residency**: All authentication data stored in Indonesia
- **Compliance**: Indonesian data protection and privacy regulations
- **Local Integration**: SMS OTP with Indonesian mobile providers
- **Language Support**: Indonesian language for authentication messages
- **Cultural Adaptation**: Indonesian business practices and user preferences

---

## 📋 Requirements

### Core Authentication Features
1. **User Registration and Management** (UPDATED - Enhanced Security)
   - **Public Registration**: Only for first user (becomes company owner)
   - **Admin-Only User Creation**: Only super-admin/owner/admin can create additional users
   - **Role Hierarchy & Cross-Company Creation**: 
     * `super-admin` - Platform-level access
       - Can create ANY role (super-admin, owner, admin, operator, driver)
       - Can create users in ANY company (cross-company creation)
       - Example: Super-admin creates admin for Company A, driver for Company B
     * `owner` - Company owner (company-bound)
       - Can create: admin, operator, driver
       - Can ONLY create users in OWN company
     * `admin` - Client admin (company-bound)
       - Can create: operator, driver
       - Can ONLY create users in OWN company
     * `operator` - Regular user, cannot create users
     * `driver` - Mobile app user, cannot create users
   - Indonesian field validation (NPWP, phone numbers, addresses)
   - Email verification and account activation
   - User profile management and updates (self-service)
   - Account deactivation (admin-only)

2. **Login and Session Management**
   - Secure email/password login with validation
   - JWT token generation and validation
   - Refresh token rotation and management
   - Session tracking and management
   - Logout and session cleanup

3. **Password Management**
   - Secure password hashing with bcrypt
   - Password strength validation
   - Password reset with secure tokens
   - Password change functionality
   - Account lockout after failed attempts

4. **Role-Based Access Control (RBAC)** (UPDATED - Cross-Company for Super-Admin)
   - **Role Hierarchy** (who can create whom, where):
     * `super-admin` → Can create: ALL roles in ANY company
       - Can create owner for Company A
       - Can create admin for Company B
       - Can create driver for Company C
       - Cross-company user creation allowed
     * `owner` → Can create: admin, operator, driver
       - Can ONLY create users in OWN company (company-bound)
     * `admin` → Can create: operator, driver
       - Can ONLY create users in OWN company (company-bound)
     * `operator` → Cannot create users
     * `driver` → Cannot create users
   - **Permission-based access control** with role inheritance
   - **Company-based data isolation** (strict multi-tenancy for non-super-admin)
   - **Cross-company creation** (super-admin only)
   - **Role assignment validation** (prevent privilege escalation)
   - **Audit trail** for all role changes

5. **Security Features**
   - Rate limiting for login attempts
   - Account lockout protection
   - Input validation and sanitization
   - CORS and security headers
   - Audit logging for security events

### Technical Requirements
- **API Endpoints**: RESTful design with comprehensive error handling
- **JWT Implementation**: Access and refresh token management
- **Database**: PostgreSQL with proper indexing and relationships
- **Caching**: Redis for session management and token storage
- **Security**: bcrypt password hashing, rate limiting, validation
- **Performance**: <200ms response time for authentication operations

### Indonesian Compliance Requirements
- **Data Residency**: All user data stored in Indonesia
- **Privacy Protection**: Indonesian data protection compliance
- **Local Integration**: Indonesian SMS providers for OTP
- **Language Support**: Indonesian language for authentication flows
- **Business Compliance**: Indonesian business registration validation

---

## 🏗️ Implementation Approach

### Architecture
```
Authentication System
├── User Management Layer
│   ├── User Registration and Validation
│   ├── Profile Management
│   ├── Account Activation/Deactivation
│   └── Indonesian Compliance Validation
├── Authentication Layer
│   ├── Login/Logout Management
│   ├── JWT Token Generation
│   ├── Session Management
│   └── Password Security
├── Authorization Layer
│   ├── Role-Based Access Control
│   ├── Permission Management
│   ├── Company-Based Isolation
│   └── Middleware Integration
└── Security Layer
    ├── Rate Limiting
    ├── Input Validation
    ├── Audit Logging
    └── Security Headers
```

### Database Schema (Authentication Focused)
```sql
-- Users (enhanced with authentication fields)
users (
    id, company_id, username, email, password_hash,
    first_name, last_name, phone_number, role,
    is_active, is_verified, last_login, failed_login_attempts,
    locked_until, created_at, updated_at, deleted_at
)

-- Sessions (JWT session management)
user_sessions (
    id, user_id, access_token_hash, refresh_token_hash,
    expires_at, created_at, last_accessed_at
)

-- Password Reset Tokens
password_reset_tokens (
    id, user_id, token_hash, expires_at, used_at, created_at
)

-- Audit Logs (security events)
audit_logs (
    id, user_id, action, ip_address, user_agent,
    details, created_at
)
```

### API Endpoints Design (UPDATED - Enhanced Security)
```
PUBLIC ENDPOINTS (No authentication required):
POST   /api/v1/auth/register                    - Company owner registration ONLY
POST   /api/v1/auth/login                       - User login
POST   /api/v1/auth/forgot-password             - Request password reset
POST   /api/v1/auth/reset-password              - Reset password

AUTHENTICATED ENDPOINTS (Token required):
POST   /api/v1/auth/logout                      - User logout
POST   /api/v1/auth/refresh                     - Refresh access token
GET    /api/v1/auth/profile                     - Get user profile
PUT    /api/v1/auth/profile                     - Update user profile  
PUT    /api/v1/auth/change-password             - Change password
GET    /api/v1/auth/sessions                    - Get active sessions
DELETE /api/v1/auth/sessions/:id                - Revoke session

ADMIN ENDPOINTS (super-admin/owner/admin only):
POST   /api/v1/users                            - Create new user (role-based)
GET    /api/v1/users                            - List company users
GET    /api/v1/users/:id                        - Get user details
PUT    /api/v1/users/:id                        - Update user
DELETE /api/v1/users/:id                        - Deactivate user
PUT    /api/v1/users/:id/role                   - Change user role
GET    /api/v1/users/:id/permissions            - Get user permissions
POST   /api/v1/users/:id/permissions            - Grant permissions
DELETE /api/v1/users/:id/permissions/:perm      - Revoke permission
```

---

## 🔐 Security Implementation

### Password Security
- **bcrypt Hashing**: 12 rounds for password hashing
- **Salt Generation**: Unique salt for each password
- **Password Validation**: Minimum 8 characters, complexity requirements
- **Secure Storage**: Hashed passwords only, never plain text
- **Reset Tokens**: Secure token generation with expiration

### JWT Token Management
- **Access Tokens**: 15-minute expiration for security
- **Refresh Tokens**: 7-day expiration with rotation
- **Token Storage**: Secure storage in Redis with expiration
- **Token Validation**: Comprehensive validation middleware
- **Token Revocation**: Immediate token invalidation on logout

### Rate Limiting and Protection
- **Login Attempts**: 5 attempts per 15 minutes
- **Password Reset**: 3 requests per hour
- **API Rate Limiting**: 100 requests per minute per user
- **Account Lockout**: 30-minute lockout after 5 failed attempts
- **IP-based Limiting**: Additional protection for suspicious activity

### Indonesian Compliance
- **Data Residency**: All authentication data in Indonesian servers
- **Privacy Protection**: Indonesian data protection compliance
- **Audit Logging**: Comprehensive security event logging
- **Local Integration**: Indonesian SMS providers for OTP
- **Language Support**: Indonesian language for all authentication flows

---

## 🚀 Immediate Next Actions

### Phase 1: Core Authentication (Day 1)
1. **User Registration System**
   - `RegisterUser()` - Company-based user registration
   - `ValidateUserData()` - Indonesian field validation
   - `HashPassword()` - Secure password hashing
   - `SendVerificationEmail()` - Email verification system

2. **Login and JWT Management**
   - `LoginUser()` - Secure login with validation
   - `GenerateTokens()` - JWT access and refresh tokens
   - `ValidateToken()` - Token validation middleware
   - `RefreshToken()` - Token refresh mechanism

### Phase 2: Password Management (Day 1-2)
1. **Password Security**
   - `ChangePassword()` - Secure password change
   - `ResetPassword()` - Password reset with tokens
   - `ValidatePasswordStrength()` - Password complexity validation
   - `HashPassword()` - bcrypt password hashing

2. **Account Security**
   - `LockAccount()` - Account lockout after failed attempts
   - `UnlockAccount()` - Account unlock functionality
   - `TrackFailedAttempts()` - Failed login attempt tracking
   - `GenerateResetToken()` - Secure password reset tokens

### Phase 3: Role-Based Access Control (Day 2-3)
1. **RBAC Implementation**
   - `AssignRole()` - Role assignment to users
   - `CheckPermission()` - Permission validation
   - `GetUserPermissions()` - User permission retrieval
   - `CompanyIsolation()` - Company-based data isolation

2. **Authorization Middleware**
   - `RequireAuth()` - JWT authentication middleware
   - `RequireRole()` - Role-based authorization middleware
   - `RequirePermission()` - Permission-based authorization
   - `CompanyAccess()` - Company-based access control

### Phase 4: Session and Security Management (Day 3-4)
1. **Session Management**
   - `CreateSession()` - User session creation
   - `GetActiveSessions()` - Active session retrieval
   - `RevokeSession()` - Session revocation
   - `CleanupExpiredSessions()` - Session cleanup

2. **Security Features**
   - `RateLimit()` - Rate limiting implementation
   - `AuditLog()` - Security event logging
   - `InputValidation()` - Input sanitization
   - `SecurityHeaders()` - Security header middleware

### Phase 5: Integration and Testing (Day 4)
1. **Middleware Integration**
   - JWT middleware integration with existing routes
   - Company-based authorization for all endpoints
   - Rate limiting for authentication endpoints
   - Security headers for all responses

2. **API Testing and Validation**
   - Authentication endpoint testing
   - Role-based access testing
   - Security feature testing
   - Performance testing for authentication operations

---

## ✅ Success Criteria

### Technical Success
- [ ] JWT token generation and validation working correctly
- [ ] User registration with Indonesian field validation
- [ ] Secure password hashing and management
- [ ] Role-based access control functioning properly
- [ ] Session management with Redis integration
- [ ] Rate limiting and security features active
- [ ] API response time <200ms for authentication operations

### Security Success
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] JWT tokens with proper expiration and rotation
- [ ] Rate limiting preventing brute force attacks
- [ ] Account lockout after failed login attempts
- [ ] Secure password reset with token expiration
- [ ] Comprehensive audit logging for security events
- [ ] Input validation preventing injection attacks

### Indonesian Market Success
- [ ] Indonesian field validation (NPWP, phone numbers)
- [ ] Data residency compliance (all data in Indonesia)
- [ ] Indonesian language support for authentication flows
- [ ] Local SMS provider integration for OTP
- [ ] Indonesian business registration validation
- [ ] Compliance with Indonesian data protection regulations

### Business Success
- [ ] Multi-company user isolation working correctly
- [ ] Role-based permissions for different user types
- [ ] Seamless integration with existing vehicle/driver/GPS systems
- [ ] User-friendly authentication flows
- [ ] Scalable authentication system for 10,000+ users
- [ ] Production-ready security implementation

### Performance Success
- [ ] Authentication operations <200ms response time
- [ ] Support 1000+ concurrent authentication requests
- [ ] Redis session management with <50ms access time
- [ ] Database queries optimized with proper indexing
- [ ] Memory usage optimized for authentication operations
- [ ] Scalable to handle 10,000+ active users

---

## 🔄 Evolution Strategy

This feature brief will evolve during implementation:
- **Security Enhancement**: Update based on security testing results
- **Performance Optimization**: Refine based on load testing
- **Indonesian Integration**: Adapt based on local provider requirements
- **User Experience**: Improve based on user feedback
- **Compliance Updates**: Update based on regulatory changes

---

## 📝 Changelog

### 2025-10-08 (Update 3) - Session Management Implementation
**Status**: Feature Complete
**Changes**:
- ✅ **Session Management Implemented**: Get active sessions and revoke sessions
  * `GET /api/v1/auth/sessions` - List all active sessions for user
  * `DELETE /api/v1/auth/sessions/:id` - Revoke specific session
  * Shows: user_agent, IP address, created_at, is_current flag
- ✅ **Service Layer**: Created `session_service.go` (138 lines)
  * `GetActiveSessions()` - Retrieve active sessions
  * `RevokeSession()` - Revoke single session
  * `RevokeAllSessions()` - Revoke all except current
  * `CleanupExpiredSessions()` - Background cleanup job
- ✅ **Handler Layer**: Updated `handler.go` with implementations
- ✅ **Security Features**:
  * Users can only manage their own sessions
  * Current session marked with `is_current: true`
  * Redis cache invalidation on revoke
  * Expired session cleanup

**Rationale**:
- Enhances account security (users can see active logins)
- Allows users to revoke suspicious sessions
- Provides visibility into active devices/locations
- Aligns with security best practices (Google, Facebook model)

**Implementation**:
- **New File**: `backend/internal/auth/session_service.go` (138 lines)
- **Modified**: `backend/internal/auth/handler.go` (2 handlers updated)
- **Build Status**: ✅ Successful
- **Time**: 30 minutes

**Next Priority**: Update Swagger documentation

---

### 2025-10-08 (Update 2) - Super-Admin Cross-Company Creation
**Status**: Requirements Refined
**Changes**:
- 🔒 **Super-Admin Cross-Company Access**: Super-admin can create users in ANY company
  * Super-admin creates owner for Company A ✅
  * Super-admin creates admin for Company B ✅
  * Super-admin creates driver for Company C ✅
  * Example use case: Platform support team onboarding new companies
- 🔒 **Owner/Admin Company-Bound**: Can only create users in their OWN company
  * Owner A creates admin in Company A ✅
  * Owner A creates driver in Company B ❌ BLOCKED
- 🔒 **company_id Parameter**: 
  * Super-admin: Can specify `company_id` in request
  * Owner/Admin: `company_id` automatically set to their company (ignore request parameter)

**Rationale**:
- Super-admin needs cross-company access for platform management
- Enables super-admin to onboard new companies
- Allows super-admin to create initial users for any company
- Owner/Admin remain strictly company-bound for security

**Implementation Impact**:
- ✅ **ALREADY IMPLEMENTED**: `CreateUser()` service has this logic
- ✅ **Lines 84-90** in `user_service.go` check super-admin role
- ✅ **Validation**: Only super-admin can specify `company_id` in request
- ✅ **Security**: Owner/Admin attempts to override `company_id` return 403 Forbidden
- ✅ **Working**: Super-admin can create admin for Company A, driver for Company B

**Code Verification**:
```go
// backend/internal/auth/user_service.go:84-90
if req.CompanyID != "" {
    // Only super-admin can create users in other companies
    if creatorRole != RoleSuperAdmin {
        return nil, apperrors.NewForbiddenError("Only super-admin can create users in other companies")
    }
    companyID = req.CompanyID
}
```

**Status**: ✅ No additional implementation needed - feature already works!

---

### 2025-01-08 (Update 1) - Enhanced Security Model (SaaS Multi-Tenant)
**Status**: Updated for stricter SaaS security
**Changes**:
- 🔒 **Restricted Public Registration**: `/auth/register` now only for company owner (first user)
- 🔒 **Admin-Only User Creation**: New `/users` endpoints for creating additional users
- 🔒 **Role Hierarchy Enforcement**:
  * super-admin can create all roles in ANY company
  * owner can create admin/operator/driver in OWN company
  * admin can create operator/driver in OWN company
  * operator/driver cannot create users
- 🔒 **Privilege Escalation Prevention**: Users cannot assign roles higher than their own
- 🔒 **Company Isolation**: Owner/Admin can only manage users within their company
- 📝 **Audit Trail**: All user creation/role changes logged

**Rationale**:
- Prevents unauthorized user creation in SaaS environment
- Ensures company admins control their user base
- Prevents security vulnerabilities from open registration
- Aligns with enterprise SaaS best practices (Salesforce, HubSpot model)

**Implementation Impact**:
- **Breaking Change**: Public `/auth/register` restricted to first user only
- **New Endpoints**: `/users/*` for user management (admin-protected)
- **New Middleware**: Role hierarchy validation
- **New Business Logic**: Prevent privilege escalation
- **Estimated Implementation**: 4-6 hours (COMPLETED)

**Next Priority**: Implement role hierarchy validation and user management endpoints (COMPLETED)

---

### 2025-01-XX - Initial Feature Brief Created
**Status**: Ready for implementation
**Key Elements**:
- ✅ Comprehensive authentication system design
- ✅ JWT-based authentication with role-based access control
- ✅ Indonesian compliance and data residency requirements
- ✅ Security features including rate limiting and audit logging
- ✅ Multi-company user isolation and permission management
**Next Priority**: Begin Phase 1 - Core Authentication Implementation
