# Product Requirements Document (PRD)
## FleetTracker Pro - Frontend Dashboard & UI

### Document Information
- **Product Name**: FleetTracker Pro Frontend
- **Version**: 1.0
- **Date**: October 2025
- **Last Updated**: October 10, 2025
- **Target Market**: Indonesian Fleet Management Companies
- **Document Type**: Frontend Product Requirements Document
- **Implementation Status**: 🚧 **IN PLANNING** (Starting Development)
- **Related Documents**: [Backend PRD](../backend/PRD.md) | [Frontend Tech Guide](technical-implementation-guide.md)

---

## 1. Executive Summary

FleetTracker Pro Frontend is a modern, responsive web application designed to provide Indonesian fleet managers with an intuitive interface for real-time fleet monitoring, driver management, and operational analytics. Built with Vite, TypeScript, and React, the frontend delivers a fast, user-friendly experience optimized for Indonesian users.

### 1.1 Product Vision
To provide Indonesian fleet managers with a powerful, beautiful, and easy-to-use web dashboard that makes fleet management effortless through intuitive design, real-time updates, and mobile-responsive interfaces.

### 1.2 Frontend Success Metrics
- **User Experience:**
  - < 3 seconds initial page load time
  - < 2 seconds navigation between pages
  - 95% user satisfaction rating
  - < 5% bounce rate on dashboard

- **Performance:**
  - Lighthouse score > 90 for performance
  - < 100ms UI response time for user interactions
  - Support for 1000+ simultaneous dashboard users
  
- **Adoption:**
  - 80% of users actively using core features
  - 90% customer retention rate
  - Average session duration > 15 minutes

---

## 2. Target Users & Personas

### 2.1 Primary Users

#### Persona 1: Fleet Manager (Primary User)
- **Demographics**: 35-50 years old, technical background
- **Technology Comfort**: Moderate to high
- **Responsibilities**: Manage 20-200 vehicles, monitor real-time operations
- **Pain Points**: 
  - Overwhelming data without clear insights
  - Difficult to find specific vehicle/driver information quickly
  - Complex interfaces that require training
  - Lack of mobile access for on-the-go monitoring
- **Goals**: 
  - Monitor fleet at a glance
  - Quickly identify and respond to issues
  - Generate reports for management
  - Access dashboard from any device
- **UI Preferences**:
  - Clean, uncluttered dashboard
  - Real-time map view as primary interface
  - Quick access to alerts and notifications
  - Bahasa Indonesia language support

#### Persona 2: Operations Director (Secondary User)
- **Demographics**: 40-55 years old, business background
- **Technology Comfort**: Low to moderate
- **Responsibilities**: Strategic decisions, KPI tracking, budget management
- **Pain Points**:
  - Difficulty understanding technical metrics
  - Lack of high-level business insights
  - Complex report generation process
  - No easy way to share insights with stakeholders
- **Goals**:
  - View business KPIs at a glance
  - Generate executive reports easily
  - Identify cost-saving opportunities
  - Share insights with management team
- **UI Preferences**:
  - Business-focused dashboards (costs, ROI)
  - Simple, visual charts and graphs
  - One-click report generation
  - Easy data export (PDF, Excel)

#### Persona 3: Driver (End User - Mobile Focus)
- **Demographics**: 25-50 years old, varying technical literacy
- **Technology Comfort**: Low to moderate
- **Responsibilities**: Complete deliveries, maintain vehicle
- **Pain Points**:
  - Unclear route instructions
  - No visibility into own performance
  - Manual reporting is time-consuming
  - Complex apps that are hard to use
- **Goals**:
  - Understand daily route clearly
  - See own performance score
  - Submit trip reports easily
  - Communicate with dispatch
- **UI Preferences**:
  - Simple, large buttons
  - Clear, step-by-step instructions
  - Offline capability for poor signal areas
  - Bahasa Indonesia language

---

## 3. Frontend Product Overview

### 3.1 Core UI Value Propositions
1. **Real-Time Visibility**: Live fleet map with 30-second updates
2. **Intuitive Design**: Clean, modern UI following Indonesian design preferences
3. **Mobile-First**: Responsive design that works on all devices
4. **Indonesian Language**: Complete Bahasa Indonesia support
5. **Fast Performance**: < 3 second page loads, instant UI interactions

### 3.2 Key Frontend Differentiators
- **Indonesian-First UX**: IDR formatting, Indonesian date/time, local conventions
- **Beautiful Design**: Modern, clean interface with Tailwind CSS
- **Real-Time Updates**: WebSocket integration for live data
- **Offline Capability**: Service workers for basic offline functionality
- **Accessibility**: WCAG 2.1 AA compliant for Indonesian users

---

## 4. Functional Requirements - Frontend Features

### 4.1 Authentication & User Management UI

#### 4.1.1 Login & Authentication Flow
**Priority**: P0 (Critical) | **Status**: 🚧 PLANNED

**Planned UI Components:**
- **Login Page**:
  - Email/username input
  - Password input with show/hide toggle
  - "Remember me" checkbox
  - "Forgot password" link
  - Language selector (Bahasa Indonesia / English)
  - Clean, professional design

- **Force Password Change Page**:
  - Current password input
  - New password input with strength indicator
  - Confirm password input
  - Password requirements checklist
  - Auto-redirect after successful change

- **Session Management UI**:
  - View active sessions (device, location, last active)
  - Revoke sessions with one click
  - Current session indicator

**User Flow:**
```
1. User enters email/password → Login
2. If must_change_password = true → Redirect to change password
3. After password change → Redirect to dashboard
4. If already authenticated → Direct to dashboard
```

**Success Criteria:**
- [ ] Login form validation (client-side + server-side)
- [ ] Clear error messages in Bahasa Indonesia
- [ ] Automatic token refresh without user interruption
- [ ] Session timeout warning (5 minutes before expiry)

---

### 4.2 Dashboard & KPI Overview

#### 4.2.1 Main Dashboard
**Priority**: P0 (Critical) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Top KPI Cards** (4 cards in grid):
   ```
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   │ Total        │ Driver       │ Fuel Today   │ Violations   │
   │ Kendaraan    │ Aktif        │ (Liters/IDR) │ Today        │
   │ [150]        │ [85]         │ [1,200 L]    │ [12]         │
   │ +5 aktif     │ 50 bertugas  │ Rp 18jt      │ 8 speeding   │
   └──────────────┴──────────────┴──────────────┴──────────────┘
   ```

2. **Live Fleet Map** (Full-width, main focus):
   - Real-time vehicle markers (color-coded by status)
   - Vehicle info popup on click
   - Filter panel (status, route, driver)
   - Search bar for quick vehicle lookup
   - Fullscreen mode toggle
   - Legend for marker colors

3. **Recent Alerts** (Right sidebar):
   - Speed violations
   - Geofence breaches
   - Vehicle maintenance due
   - Driver SIM expiration
   - Clear all / Mark as read

4. **Quick Actions** (Button bar):
   - Add Vehicle
   - Add Driver
   - Start Trip
   - Generate Report
   - View Analytics

**Layout (Desktop):**
```
┌────────────────────────────────────────────────────────────┐
│ Header: FleetTracker Pro | Notifications | Profile        │
├─────────────┬──────────────────────────────┬───────────────┤
│ Sidebar     │ KPI Cards (4 widgets)        │ Alerts Panel  │
│             ├──────────────────────────────┤               │
│ - Dashboard │                              │ Speed Alert   │
│ - Vehicles  │                              │ Geofence      │
│ - Drivers   │                              │ Maintenance   │
│ - Trips     │   Live Fleet Map             │ SIM Exp       │
│ - Reports   │   (Interactive Map)          │               │
│ - Payments  │                              │ [Clear All]   │
│ - Settings  │                              │               │
│             │                              │               │
└─────────────┴──────────────────────────────┴───────────────┘
```

**Success Criteria:**
- [ ] Dashboard loads in < 3 seconds
- [ ] Map displays 1000+ vehicles without lag
- [ ] Real-time updates (30-second intervals) via WebSocket
- [ ] Responsive design for mobile/tablet
- [ ] All text in Bahasa Indonesia

---

### 4.3 Vehicle Management UI

#### 4.3.1 Vehicle List Page
**Priority**: P0 (Critical) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Vehicle Table** (Paginated, filterable):
   - Columns: License Plate, Brand/Model, Status, Driver, Last Update, Actions
   - Sort by any column
   - Filter by status (active, idle, maintenance, offline)
   - Search by license plate or VIN
   - Bulk actions (assign driver, change status)

2. **Vehicle Card View** (Alternative layout):
   - Grid of vehicle cards
   - Shows: License plate, photo, status, driver, last location
   - Click for details

3. **Add/Edit Vehicle Form**:
   - Basic Info: License plate, brand, model, year, type
   - Indonesian Compliance: STNK, BPKB, registration expiry
   - Technical: Fuel capacity, GPS device ID
   - Photo upload
   - Validation for Indonesian formats

**UI Features:**
- [ ] Real-time status updates (moving, idle, offline)
- [ ] Color-coded status badges
- [ ] Quick assign/unassign driver
- [ ] View vehicle on map (redirect to dashboard)
- [ ] Export vehicle list (CSV, Excel)

**Success Criteria:**
- [ ] List loads in < 2 seconds
- [ ] Smooth pagination (no flicker)
- [ ] Validation prevents invalid STNK/BPKB
- [ ] Photo upload with preview

---

### 4.4 Driver Management UI

#### 4.4.1 Driver List & Performance Page
**Priority**: P0 (Critical) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Driver Table** (Paginated, sortable):
   - Columns: Name, NIK, SIM, Performance Score, Status, Vehicle, Actions
   - Sort by performance score (default: highest first)
   - Filter by status (active, on-duty, off-duty)
   - Search by name or NIK

2. **Driver Performance Cards** (Top performers):
   - Top 3 drivers with photo, score, badges
   - "Driver of the Month" highlight

3. **Add/Edit Driver Form**:
   - Personal Info: Name, NIK, phone, email
   - License Info: SIM number, expiry date, type
   - Photo upload
   - Emergency contact
   - Validation for Indonesian formats (NIK, SIM)

4. **Driver Detail Page**:
   - Performance dashboard (chart with trend)
   - Recent trips list
   - Violation history
   - Current vehicle assignment
   - Contact information

**Performance Score Breakdown:**
```
┌─────────────────────────────────────────┐
│ Driver: John Doe          Score: 85/100 │
├─────────────────────────────────────────┤
│ Speed Compliance:     ██████████ 90/100 │
│ Braking Score:        ████████   80/100 │
│ Fuel Efficiency:      ████████░  85/100 │
│ Route Adherence:      █████████  88/100 │
│ Overall Rating:       ████████░  85/100 │
└─────────────────────────────────────────┘
```

**Success Criteria:**
- [ ] Performance charts update in real-time
- [ ] Clear visualization of score components
- [ ] Easy driver creation with validation
- [ ] SIM expiration alerts

---

### 4.5 Live Fleet Map

#### 4.5.1 Interactive Map Component
**Priority**: P0 (Critical) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Map Library**: React Leaflet or Google Maps
2. **Vehicle Markers**:
   - Color-coded by status:
     - 🟢 Green: Moving
     - 🟡 Orange: Idle (stopped > 5 min)
     - 🔴 Red: Offline (no data > 30 min)
   - Custom icons showing vehicle type
   - Rotation based on heading

3. **Vehicle Info Popup** (on marker click):
   ```
   ┌─────────────────────────────┐
   │ B 1234 ABC                  │
   │ Toyota Avanza 2020          │
   ├─────────────────────────────┤
   │ Driver: John Doe            │
   │ Status: Moving              │
   │ Speed: 45 km/h              │
   │ Last Update: 10 detik lalu  │
   ├─────────────────────────────┤
   │ [View Details] [Track]      │
   └─────────────────────────────┘
   ```

4. **Map Controls**:
   - Zoom in/out
   - Center on my location
   - Fullscreen mode
   - Layer toggle (traffic, geofences)
   - Vehicle cluster for zoomed-out view

5. **Filter Panel** (Sidebar):
   - Filter by status (checkboxes)
   - Filter by route
   - Filter by driver
   - Search specific vehicle
   - "Show all" / "Clear filters"

**Success Criteria:**
- [ ] Map loads in < 2 seconds
- [ ] Smooth marker updates (no flicker)
- [ ] Support for 1000+ vehicles without lag
- [ ] WebSocket updates every 30 seconds
- [ ] Mobile-responsive map controls

---

### 4.6 Analytics & Reporting UI

#### 4.6.1 Analytics Dashboard
**Priority**: P1 (High) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Fuel Analytics Page**:
   - Total fuel consumption chart (line graph, 30 days)
   - Cost breakdown (pie chart: by vehicle, by driver)
   - Top fuel-efficient drivers (leaderboard)
   - Top fuel-wasting vehicles (red flags)
   - Export to PDF/Excel

2. **Driver Performance Analytics**:
   - Performance distribution (histogram)
   - Driver ranking table (sortable)
   - Performance trends (line graph over time)
   - Violation breakdown (bar chart by type)

3. **Vehicle Utilization**:
   - Active hours per vehicle (bar chart)
   - Idle time analysis
   - Distance traveled per vehicle
   - Maintenance cost per vehicle

4. **Custom Report Builder** (Advanced):
   - Drag-and-drop interface
   - Select metrics (fuel, distance, violations, etc.)
   - Select time range
   - Select vehicles/drivers
   - Preview report
   - Export (PDF, Excel, CSV)

**Chart Library**: Recharts or Chart.js

**Success Criteria:**
- [ ] Charts render in < 1 second
- [ ] Interactive charts (tooltips, zoom)
- [ ] Export generates in < 5 seconds
- [ ] Mobile-responsive charts

---

### 4.7 Payment & Billing UI

#### 4.7.1 Invoice Management Page
**Priority**: P1 (High) | **Status**: 🚧 PLANNED

**Planned UI Components:**

1. **Invoice List**:
   - Table: Invoice #, Date, Amount, Tax (PPN 11%), Total, Status, Actions
   - Filter by status (unpaid, paid, overdue)
   - Search by invoice number

2. **Invoice Detail Page**:
   - Invoice header (company info, invoice #, date)
   - Line items (subscription plan, vehicle count)
   - Subtotal, tax (PPN 11%), total
   - Payment instructions (bank account details)
   - Upload payment proof (image/PDF)
   - Download invoice (PDF)

3. **Payment Confirmation Form**:
   - Upload proof of payment
   - Payment date
   - Amount paid
   - Bank account used
   - Notes
   - Submit for review

**Indonesian Invoice Format:**
```
┌──────────────────────────────────────┐
│ FAKTUR / INVOICE                     │
│ No: INV-2025-10-0001                 │
│ Tanggal: 10 Oktober 2025             │
├──────────────────────────────────────┤
│ Kepada: PT Fleet Management Indo     │
├──────────────────────────────────────┤
│ Paket Professional (50 kendaraan)    │
│ 50 × Rp 75.000 = Rp 3.750.000        │
│                                       │
│ Subtotal:        Rp 3.750.000         │
│ PPN 11%:         Rp   412.500         │
│ TOTAL:           Rp 4.162.500         │
└──────────────────────────────────────┘
```

**Success Criteria:**
- [ ] Invoice PDF generation in < 3 seconds
- [ ] Proper Indonesian currency formatting
- [ ] PPN 11% calculation accuracy
- [ ] Payment proof upload validation

---

## 5. Non-Functional Requirements - Frontend

### 5.1 Performance Requirements
**Target Metrics:**

- [ ] **Initial Page Load**: < 3 seconds (First Contentful Paint)
- [ ] **Time to Interactive**: < 5 seconds
- [ ] **Navigation Speed**: < 2 seconds between pages
- [ ] **UI Response Time**: < 100ms for user interactions
- [ ] **Lighthouse Score**: > 90 (Performance, Accessibility, Best Practices)
- [ ] **Bundle Size**: < 500KB (initial), < 200KB (lazy-loaded chunks)

### 5.2 Usability Requirements

- [ ] **Multi-language Support**: Bahasa Indonesia (primary), English (secondary)
- [ ] **Mobile Responsiveness**: Works on tablets (iPad, Android) and mobile (iPhone, Android)
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] **Keyboard Navigation**: Full keyboard support for all features
- [ ] **Screen Reader Support**: Proper ARIA labels and semantic HTML

### 5.3 Design Requirements

- [ ] **Design System**: Consistent component library (shadcn/ui or custom)
- [ ] **Color Palette**: Professional, accessible colors (WCAG AA contrast)
- [ ] **Typography**: Readable fonts (Inter, Roboto, or Indonesian-friendly fonts)
- [ ] **Icons**: Consistent icon library (Lucide Icons or similar)
- [ ] **Spacing**: Consistent spacing system (Tailwind spacing scale)
- [ ] **Responsive Breakpoints**: Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px)

---

## 6. User Experience (UX) Requirements

### 6.1 Information Architecture

**Main Navigation Structure:**
```
FleetTracker Pro
├── Dashboard (Homepage)
├── Vehicles
│   ├── List
│   ├── Add New
│   └── Vehicle Detail
├── Drivers
│   ├── List
│   ├── Add New
│   └── Driver Performance
├── Trips
│   ├── Active Trips
│   ├── Completed Trips
│   └── Trip Analytics
├── Analytics
│   ├── Fuel Analytics
│   ├── Driver Performance
│   ├── Vehicle Utilization
│   └── Custom Reports
├── Payments
│   ├── Invoices
│   ├── Payment History
│   └── Subscription
└── Settings
    ├── Company Profile
    ├── User Management
    ├── Notifications
    └── Preferences
```

### 6.2 User Flows

#### Flow 1: Monitor Fleet in Real-Time
```
1. User logs in → Dashboard
2. View live map with all vehicles
3. Click vehicle marker → View vehicle details popup
4. (Optional) Click "Track" → Follow vehicle in real-time
5. (Optional) View recent alerts in sidebar
```

#### Flow 2: Add New Driver
```
1. Navigate to Drivers → Click "Add New"
2. Fill form: Name, NIK, SIM, Photo
3. Validate Indonesian compliance fields
4. Submit → Driver created
5. (Optional) Assign to vehicle immediately
```

#### Flow 3: Generate Fuel Report
```
1. Navigate to Analytics → Fuel Analytics
2. Select date range (last 30 days)
3. View fuel consumption chart
4. Click "Export to PDF"
5. Download report in < 5 seconds
```

---

## 7. Indonesian Localization Requirements

### 7.1 Language Support
- [ ] **Primary Language**: Bahasa Indonesia
- [ ] **Secondary Language**: English
- [ ] **Language Switcher**: Top navigation bar
- [ ] **Persistent Selection**: Save language preference in localStorage

### 7.2 Date & Time Formatting
- [ ] **Date Format**: DD/MM/YYYY (e.g., 10/10/2025)
- [ ] **Time Format**: 24-hour (e.g., 14:30 WIB)
- [ ] **Timezone**: WIB (Western Indonesian Time), WITA, WIT
- [ ] **Relative Time**: "5 menit yang lalu", "2 jam yang lalu"

### 7.3 Currency Formatting
- [ ] **Currency**: Indonesian Rupiah (IDR)
- [ ] **Format**: Rp 1.000.000,00 (dot for thousands, comma for decimals)
- [ ] **Large Numbers**: Rp 1,5 juta (1.5 million), Rp 10 juta (10 million)

### 7.4 Number Formatting
- [ ] **Thousands Separator**: Dot (.) - e.g., 1.000.000
- [ ] **Decimal Separator**: Comma (,) - e.g., 1.500,50
- [ ] **Distance**: Kilometers (km)
- [ ] **Speed**: km/h

---

## 8. Frontend Development Roadmap

### 8.1 🚧 IN PLANNING: Phase 1 - Core UI (Weeks 1-4)
**Timeline**: 4 weeks

**Planned Features:**
- 🚧 Project setup (Vite, TypeScript, Tailwind, TanStack Query)
- 🚧 Authentication UI (login, password change, session management)
- 🚧 Dashboard layout (header, sidebar, main content)
- 🚧 Main dashboard with KPI cards
- 🚧 Basic navigation structure
- 🚧 API service layer setup

### 8.2 🚧 IN PLANNING: Phase 2 - Fleet Management (Weeks 5-6)
**Timeline**: 2 weeks

**Planned Features:**
- 🚧 Live fleet map with Leaflet/Google Maps
- 🚧 Vehicle list page (table view, filters)
- 🚧 Add/edit vehicle forms with Indonesian validation
- 🚧 Driver list page (table view, filters)
- 🚧 Add/edit driver forms with Indonesian validation
- 🚧 Real-time updates via WebSocket

### 8.3 🚧 IN PLANNING: Phase 3 - Analytics & Reporting (Weeks 7-8)
**Timeline**: 2 weeks

**Planned Features:**
- 🚧 Fuel analytics dashboard with charts
- 🚧 Driver performance analytics with charts
- 🚧 Vehicle utilization reports
- 🚧 Export functionality (PDF, CSV, Excel)
- 🚧 Custom report builder

### 8.4 🚧 IN PLANNING: Phase 4 - Payments & Admin (Weeks 9-10)
**Timeline**: 2 weeks

**Planned Features:**
- 🚧 Invoice list and detail pages
- 🚧 Payment confirmation workflow
- 🚧 Admin panel (user management, company settings)
- 🚧 Notification center
- 🚧 Profile settings

### 8.5 🚧 IN PLANNING: Phase 5 - Polish & Testing (Weeks 11-12)
**Timeline**: 2 weeks

**Planned Tasks:**
- 🚧 Mobile responsive optimization
- 🚧 Accessibility testing and fixes
- 🚧 Performance optimization (code splitting, lazy loading)
- 🚧 Cross-browser testing
- 🚧 User acceptance testing
- 🚧 Bug fixes and polish

**Total Timeline**: 12 weeks (3 months)

---

## 9. Success Metrics - Frontend

### 9.1 User Experience Metrics
**Targets:**
- [ ] User satisfaction score: > 95%
- [ ] Task completion rate: > 90%
- [ ] Average session duration: > 15 minutes
- [ ] Bounce rate: < 5%
- [ ] Return user rate: > 80%

### 9.2 Performance Metrics
**Targets:**
- [ ] Lighthouse Performance score: > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Cumulative Layout Shift: < 0.1

### 9.3 Adoption Metrics
**Targets:**
- [ ] Feature utilization rate: > 80%
- [ ] Mobile usage: > 30%
- [ ] Daily active users: > 70% of total users
- [ ] Average logins per user: > 5 per week

---

## 10. Risk Assessment - Frontend

### 10.1 Technical Risks

#### Risk 1: Map Performance with 1000+ Vehicles
**Impact**: High | **Probability**: Medium | **Status**: 🚧 PLANNING MITIGATION

**Mitigation Plan:**
- [ ] Use marker clustering for zoomed-out view
- [ ] Implement virtualization for large lists
- [ ] Lazy load map tiles
- [ ] Use React.memo for vehicle markers
- [ ] Implement debouncing for real-time updates

#### Risk 2: WebSocket Connection Stability
**Impact**: Medium | **Probability**: Medium | **Status**: 🚧 PLANNING MITIGATION

**Mitigation Plan:**
- [ ] Automatic reconnection with exponential backoff
- [ ] Fallback to HTTP polling if WebSocket fails
- [ ] Connection status indicator in UI
- [ ] Queue messages during disconnection

### 10.2 UX Risks

#### Risk 1: User Resistance to New Interface
**Impact**: Medium | **Probability**: Low | **Status**: 🚧 PLANNING MITIGATION

**Mitigation Plan:**
- [ ] User testing with pilot customers before launch
- [ ] Built-in tutorial/onboarding flow
- [ ] Help documentation in Bahasa Indonesia
- [ ] Gradual rollout with feedback collection

---

## 11. Appendices - Frontend

### 11.1 Technology Stack
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 5.x
- **Framework**: React 18.x
- **State Management**: TanStack Query (server state), Zustand (client state)
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui or custom components
- **Maps**: React Leaflet or Google Maps Platform
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide Icons
- **Date/Time**: date-fns or Day.js
- **HTTP Client**: Axios
- **WebSocket**: native WebSocket API

### 11.2 Design Resources
- **Figma Files**: [Link to designs]
- **Style Guide**: [Link to style guide]
- **Component Library**: [Link to Storybook]
- **Icon Library**: Lucide Icons
- **Color Palette**: [Link to color palette]

### 11.3 Integration Points with Backend
- **API Base URL**: `http://localhost:8080/api/v1` (dev), `https://api.fleettracker.id/api/v1` (prod)
- **WebSocket URL**: `ws://localhost:8080/ws` (dev), `wss://api.fleettracker.id/ws` (prod)
- **Swagger Documentation**: `http://localhost:8080/swagger/index.html`
- **Authentication**: JWT Bearer tokens in Authorization header
- **Request Format**: JSON
- **Response Format**: JSON with standard format

---

**Document Approval:**
- Frontend Lead: [Name]
- UX/UI Designer: [Name]
- Product Manager: [Name]
- User Advocate: [Name]

**Last Updated**: October 10, 2025  
**Next Review**: November 2025  
**Status**: 🚧 **IN PLANNING - READY TO START DEVELOPMENT**

