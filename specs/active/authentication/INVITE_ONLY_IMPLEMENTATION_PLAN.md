# Invite-Only Authentication System - Implementation Plan

**Feature**: Remove Public Registration, Implement Invite-Only System  
**Status**: Architecture Evolved, Ready for Implementation  
**Estimated Time**: 1-2 days  
**Priority**: High (Security Enhancement)

---

## 🎯 Overview

Convert FleetTracker Pro from public registration to invite-only user creation system, aligning with B2B SaaS best practices.

### Why This Change?

**Current Problem**:
- ❌ Public registration allows anyone to create companies
- ❌ No business validation before company creation
- ❌ Violates multi-tenant security model
- ❌ Subscription setup not enforced
- ❌ Spam/abuse potential

**Solution Benefits**:
- ✅ Controlled company onboarding
- ✅ Business validation before access
- ✅ Subscription setup verified
- ✅ Better security posture
- ✅ Aligns with Salesforce, Slack, HubSpot model

---

## 📋 Implementation Tasks

### Task 1: Database Migration - Add Password Change Tracking

**File**: `backend/migrations/007_add_password_change_tracking.up.sql`

```sql
-- Add must_change_password and last_password_change fields
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_password_change TIMESTAMPTZ;

-- Update existing users to not require password change (already active)
UPDATE users SET must_change_password = false WHERE is_active = true;

-- Index for quick lookups
CREATE INDEX idx_users_must_change_password ON users(must_change_password) WHERE must_change_password = true;
```

**File**: `backend/migrations/007_add_password_change_tracking.down.sql`

```sql
DROP INDEX IF EXISTS idx_users_must_change_password;
ALTER TABLE users DROP COLUMN IF EXISTS last_password_change;
ALTER TABLE users DROP COLUMN IF EXISTS must_change_password;
```

---

### Task 2: Create Super-Admin Seed Script

**File**: `backend/seeds/super_admin.go`

```go
package seeds

import (
    "log"
    "time"

    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"

    "github.com/tobangado69/fleettracker-pro/backend/pkg/models"
)

// SeedSuperAdmin creates the initial super-admin user if it doesn't exist
func SeedSuperAdmin(db *gorm.DB) error {
    log.Println("🔐 Checking for super-admin...")

    // Check if super-admin already exists
    var count int64
    if err := db.Model(&models.User{}).Where("role = ?", "super-admin").Count(&count).Error; err != nil {
        return err
    }

    if count > 0 {
        log.Println("✅ Super-admin already exists, skipping creation")
        return nil
    }

    // Generate secure temporary password
    tempPassword := "ChangeMe123!"
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
    if err != nil {
        return err
    }

    // Create super-admin user
    superAdmin := models.User{
        Email:              "admin@fleettracker.id",
        Name:               "Super Administrator",
        Role:               "super-admin",
        PasswordHash:       string(hashedPassword),
        IsActive:           true,
        MustChangePassword: true,
        CreatedAt:          time.Now(),
        UpdatedAt:          time.Now(),
    }

    if err := db.Create(&superAdmin).Error; err != nil {
        return err
    }

    log.Println("✅ Super-admin created successfully!")
    log.Println("📧 Email: admin@fleettracker.id")
    log.Println("🔑 Temporary Password: ChangeMe123!")
    log.Println("⚠️  IMPORTANT: Change this password immediately after first login!")

    return nil
}
```

**Update**: `backend/seeds/seed.go`

```go
func RunSeeds(db *gorm.DB) error {
    log.Println("🌱 Starting database seeding...")

    // Run super-admin seed FIRST
    if err := SeedSuperAdmin(db); err != nil {
        return fmt.Errorf("failed to seed super-admin: %w", err)
    }

    // Run other seeds...
    if err := SeedCompanies(db); err != nil {
        return fmt.Errorf("failed to seed companies: %w", err)
    }

    // ... rest of seeds

    log.Println("✅ Database seeding completed!")
    return nil
}
```

---

### Task 3: Update User Model

**File**: `backend/pkg/models/user.go`

```go
type User struct {
    ID                 string     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
    CompanyID          *string    `gorm:"type:uuid" json:"company_id,omitempty"`
    Email              string     `gorm:"type:varchar(255);unique;not null" json:"email"`
    Name               string     `gorm:"type:varchar(255);not null" json:"name"`
    PasswordHash       string     `gorm:"type:varchar(255);not null" json:"-"`
    Role               string     `gorm:"type:varchar(50);not null;default:'driver'" json:"role"`
    IsActive           bool       `gorm:"default:true" json:"is_active"`
    MustChangePassword bool       `gorm:"default:true" json:"must_change_password"`          // NEW
    LastPasswordChange *time.Time `json:"last_password_change,omitempty"`                    // NEW
    LastLogin          *time.Time `json:"last_login,omitempty"`
    CreatedAt          time.Time  `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt          time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
    DeletedAt          *time.Time `gorm:"index" json:"deleted_at,omitempty"`

    // Associations
    Company *models.Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}
```

---

### Task 4: Add Force Password Change Middleware

**File**: `backend/internal/auth/middleware.go` (add to existing file)

```go
// CheckPasswordChangeRequired middleware - forces password change on first login
func (m *Middleware) CheckPasswordChangeRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, exists := c.Get("user_id")
        if !exists {
            c.Next()
            return
        }

        // Get user from database
        var user models.User
        if err := m.db.First(&user, "id = ?", userID).Error; err != nil {
            c.Next()
            return
        }

        // If user must change password, only allow access to change-password endpoint
        if user.MustChangePassword {
            // Allow these endpoints even if password change required
            allowedPaths := []string{
                "/api/v1/auth/change-password",
                "/api/v1/auth/logout",
                "/api/v1/auth/profile",
            }

            currentPath := c.Request.URL.Path
            for _, path := range allowedPaths {
                if currentPath == path {
                    c.Next()
                    return
                }
            }

            // Block all other endpoints
            c.JSON(http.StatusForbidden, gin.H{
                "success": false,
                "error":   "password_change_required",
                "message": "You must change your password before accessing this resource",
            })
            c.Abort()
            return
        }

        c.Next()
    }
}
```

---

### Task 5: Update Login Response

**File**: `backend/internal/auth/service.go`

```go
func (s *Service) Login(email, password string) (*LoginResponse, *apperrors.AppError) {
    var user models.User
    if err := s.db.Where("email = ? AND is_active = true", email).First(&user).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, apperrors.NewUnauthorizedError("Invalid credentials")
        }
        return nil, apperrors.NewInternalError("Database error", err)
    }

    // Verify password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
        return nil, apperrors.NewUnauthorizedError("Invalid credentials")
    }

    // Generate tokens
    accessToken, refreshToken, err := s.generateTokens(&user)
    if err != nil {
        return nil, apperrors.NewInternalError("Failed to generate tokens", err)
    }

    // Update last login
    now := time.Now()
    s.db.Model(&user).Updates(map[string]interface{}{
        "last_login": now,
    })

    return &LoginResponse{
        AccessToken:        accessToken,
        RefreshToken:       refreshToken,
        User:               &user,
        MustChangePassword: user.MustChangePassword,  // NEW: Tell frontend to force password change
    }, nil
}

type LoginResponse struct {
    AccessToken        string       `json:"access_token"`
    RefreshToken       string       `json:"refresh_token"`
    User               *models.User `json:"user"`
    MustChangePassword bool         `json:"must_change_password"`  // NEW
}
```

---

### Task 6: Update Change Password Endpoint

**File**: `backend/internal/auth/service.go`

```go
func (s *Service) ChangePassword(userID, oldPassword, newPassword string) *apperrors.AppError {
    var user models.User
    if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
        return apperrors.NewNotFoundError("User not found")
    }

    // Verify old password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
        return apperrors.NewUnauthorizedError("Invalid current password")
    }

    // Validate new password strength
    if len(newPassword) < 8 {
        return apperrors.NewBadRequestError("Password must be at least 8 characters long")
    }

    // Hash new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
    if err != nil {
        return apperrors.NewInternalError("Failed to hash password", err)
    }

    // Update password and clear must_change_password flag
    now := time.Now()
    if err := s.db.Model(&user).Updates(map[string]interface{}{
        "password_hash":        string(hashedPassword),
        "must_change_password": false,           // NEW: Clear the flag
        "last_password_change": now,             // NEW: Track when password changed
        "updated_at":          now,
    }).Error; err != nil {
        return apperrors.NewInternalError("Failed to update password", err)
    }

    return nil
}
```

---

### Task 7: Update User Creation (Invitation)

**File**: `backend/internal/auth/user_service.go`

```go
import (
    "crypto/rand"
    "encoding/base64"
)

// generateTemporaryPassword creates a secure random password
func generateTemporaryPassword() (string, error) {
    b := make([]byte, 12)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b)[:16], nil
}

func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest, creatorID, creatorRole, creatorCompanyID string) (*models.User, *apperrors.AppError) {
    // ... existing validation logic ...

    // Generate temporary password
    tempPassword, err := generateTemporaryPassword()
    if err != nil {
        return nil, apperrors.NewInternalError("Failed to generate temporary password", err)
    }

    // Hash the temporary password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
    if err != nil {
        return nil, apperrors.NewInternalError("Failed to hash password", err)
    }

    // Create user with must_change_password = true
    user := &models.User{
        Email:              req.Email,
        Name:               req.Name,
        PasswordHash:       string(hashedPassword),
        Role:               req.Role,
        CompanyID:          &companyID,
        IsActive:           true,
        MustChangePassword: true,  // NEW: Force password change on first login
    }

    if err := s.db.Create(user).Error; err != nil {
        return nil, apperrors.NewInternalError("Failed to create user", err)
    }

    // Send invitation email with temporary password
    go s.sendInvitationEmail(user.Email, user.Name, tempPassword)

    return user, nil
}

// sendInvitationEmail sends an email with login credentials
func (s *UserService) sendInvitationEmail(email, name, tempPassword string) {
    // TODO: Implement email sending
    // For now, just log it
    log.Printf("📧 Invitation email sent to %s (%s)", email, name)
    log.Printf("🔑 Temporary password: %s", tempPassword)
    log.Printf("⚠️  User must change password on first login")
}
```

---

### Task 8: Remove/Deprecate Register Endpoint

**File**: `backend/internal/auth/handler.go`

```go
// ❌ REMOVE OR COMMENT OUT THIS HANDLER
/*
func (h *Handler) Register(c *gin.Context) {
    // This endpoint is deprecated - use invite-only user creation
    c.JSON(http.StatusGone, gin.H{
        "success": false,
        "error": "endpoint_deprecated",
        "message": "Public registration is no longer supported. Please contact your administrator to create an account.",
    })
}
*/
```

**File**: `backend/cmd/server/main.go`

```go
// ❌ REMOVE OR COMMENT OUT THIS ROUTE
// public.POST("/register", authHandler.Register)  // DEPRECATED

// ✅ Keep only these public routes:
public.POST("/login", authHandler.Login)
public.POST("/forgot-password", authHandler.ForgotPassword)
public.POST("/reset-password", authHandler.ResetPassword)
```

---

### Task 9: Update Documentation

**Files to Update**:
1. `backend/docs/swagger.yaml` - Remove register endpoint, add must_change_password field
2. `backend/docs/api/README.md` - Update authentication flow, document invitation process
3. `backend/README.md` - Add initial setup instructions

**Example README Update**:

```markdown
## Initial Setup

### First-Time Installation

1. Run database migrations:
   ```bash
   cd backend
   make migrate-up
   ```

2. Run database seeds (creates super-admin):
   ```bash
   make seed
   ```

3. Super-admin credentials:
   - **Email**: `admin@fleettracker.id`
   - **Password**: `ChangeMe123!`
   - ⚠️ **IMPORTANT**: Change this password immediately after first login!

4. Login and change password:
   ```bash
   # Login
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@fleettracker.id","password":"ChangeMe123!"}'

   # Response will include: "must_change_password": true

   # Change password
   curl -X PUT http://localhost:8080/api/v1/auth/change-password \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"old_password":"ChangeMe123!","new_password":"YourSecurePassword123!"}'
   ```

### User Onboarding Flow

FleetTracker Pro uses an **invite-only** system. There is no public registration.

1. **Super-admin** creates companies and their owners
2. **Owners** create admin/operator/driver users for their company
3. **Admins** create operator/driver users for their company
4. Users receive email with temporary password
5. Users must change password on first login

#### Creating New Users

```bash
# Super-admin creates owner for Company A
POST /api/v1/users
{
  "email": "owner@companya.com",
  "name": "Company A Owner",
  "role": "owner",
  "company_id": "company-a-uuid"  // super-admin can specify company
}

# Owner creates admin for their company
POST /api/v1/users
{
  "email": "admin@companya.com",
  "name": "Company A Admin",
  "role": "admin"
  // company_id automatically set to owner's company
}
```

Users will receive an email with:
- Login URL
- Email address
- Temporary password
- Instructions to change password on first login
```

---

## 📊 Testing Checklist

### Manual Testing

- [ ] **Super-Admin Seed**
  - [ ] Run `make seed` creates super-admin
  - [ ] Can login with `admin@fleettracker.id` / `ChangeMe123!`
  - [ ] Login response includes `must_change_password: true`

- [ ] **Force Password Change**
  - [ ] Cannot access other endpoints before password change
  - [ ] Can access `/auth/change-password`, `/auth/profile`, `/auth/logout`
  - [ ] After password change, `must_change_password` becomes false
  - [ ] Can access all authorized endpoints after password change

- [ ] **User Invitation**
  - [ ] Super-admin can create user in any company
  - [ ] Owner can create user in own company only
  - [ ] Admin can create user in own company only
  - [ ] New user has `must_change_password: true`
  - [ ] Temporary password is randomly generated
  - [ ] Email sent with login credentials (check logs)

- [ ] **Security**
  - [ ] Cannot bypass password change requirement
  - [ ] Old password required for password change
  - [ ] Password strength validation works
  - [ ] `last_password_change` timestamp updated

- [ ] **Removed Endpoints**
  - [ ] `POST /auth/register` returns 410 Gone or 404 Not Found
  - [ ] Documentation updated to remove register endpoint

### Integration Tests

```go
// Test force password change
func TestForcePasswordChange(t *testing.T) {
    // Create user with must_change_password = true
    // Login
    // Try to access protected endpoint → expect 403
    // Change password
    // Try to access protected endpoint → expect 200
}

// Test user invitation
func TestUserInvitation(t *testing.T) {
    // Create user via POST /users
    // Verify must_change_password = true
    // Verify temporary password is generated
    // Login with temporary password
    // Change password
    // Login with new password
}
```

---

## 🚀 Deployment Steps

1. **Backup Production Database** (if already deployed)
   ```bash
   pg_dump fleettracker_prod > backup_before_invite_only.sql
   ```

2. **Run Migration**
   ```bash
   cd backend
   make migrate-up
   ```

3. **Run Super-Admin Seed**
   ```bash
   make seed
   ```

4. **Notify Existing Users** (if any)
   - Send email about system upgrade
   - Explain new login process
   - Provide support contact

5. **Update Frontend**
   - Handle `must_change_password: true` in login response
   - Show password change modal/page
   - Block access to app until password changed
   - Remove registration UI components

6. **Monitor Logs**
   - Watch for password change attempts
   - Monitor failed logins
   - Check email delivery logs

---

## 📝 Rollback Plan

If issues occur, rollback steps:

1. **Revert Migration**
   ```bash
   make migrate-down
   ```

2. **Restore Previous Code**
   ```bash
   git revert <commit-hash>
   ```

3. **Re-enable Register Endpoint**
   - Uncomment `/auth/register` route
   - Deploy previous version

---

## ✅ Success Criteria

- [ ] Super-admin seed creates initial admin successfully
- [ ] Super-admin can login with temporary password
- [ ] Super-admin forced to change password
- [ ] After password change, full access granted
- [ ] Users created via POST /users have must_change_password = true
- [ ] Invitation emails sent (logged for now)
- [ ] New users can login with temporary password
- [ ] New users forced to change password
- [ ] Register endpoint removed/deprecated
- [ ] Documentation updated
- [ ] Frontend handles force password change flow

---

## 🎯 Next Steps After Implementation

1. **Email Service Integration**
   - Integrate SendGrid/AWS SES for production emails
   - Create professional email templates
   - Add email delivery tracking

2. **Admin Panel**
   - Company management UI (super-admin)
   - User invitation UI (owner/admin)
   - User management dashboard

3. **Password Policy Enhancements**
   - Password expiration (90 days)
   - Password history (prevent reuse)
   - Stronger complexity requirements
   - Password reset rate limiting

4. **Audit Logging**
   - Log all user creation events
   - Log password changes
   - Track who invited whom
   - Security event monitoring

---

**Estimated Implementation Time**: 1-2 days  
**Priority**: High (Security Enhancement)  
**Status**: Ready to implement

This implementation plan provides everything needed to convert FleetTracker Pro to a secure, invite-only authentication system aligned with enterprise B2B SaaS best practices.

