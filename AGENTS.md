# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
FleetTracker Pro is a fleet management SaaS for Indonesian logistics. The backend lives in `backend/` (a git submodule, Go). The frontend lives in `frontend/` (a separate git repo, Vite + React + TypeScript + Tailwind v4). See `backend/Makefile` for backend commands.

### Required system dependencies
- **Go 1.24+** (the `go.mod` specifies `go 1.24.0`)
- **Docker + Docker Compose** for PostgreSQL/PostGIS (port 5432), TimescaleDB (port 5433), and Redis (port 6379)

### Starting infrastructure services
```
cd backend && sudo docker compose up -d postgres timescaledb redis
```
Wait ~15s for health checks to pass before starting the backend.

### Database schema gotcha
The SQL migrations in `backend/migrations/` do **not** fully match the GORM models in `backend/pkg/models/`. Several columns referenced by GORM (e.g. `deleted_at`, `username`, `first_name`, `last_name`, `refresh_token` on sessions, and others) are missing from the SQL schema. After running `make migrate-up`, you must add these missing columns manually or run GORM AutoMigrate. Key fixes needed:
- `users` table: rename `password_hash` to `password`, add `deleted_at`, `username`, `first_name`, `last_name`, `avatar`, `address`, `city`, `province`, `postal_code`, `permissions`, `status`, `is_verified`, `last_login_at`, `failed_login_attempts`, `locked_until`, `email_verified_at`, `email_verification_token`, `preferences`, `two_factor_enabled`, `two_factor_secret`, `password_changed_at`
- `sessions` table: add `refresh_token`, `updated_at`; change `ip_address` type from `inet` to `varchar(45)`
- Several tables (`companies`, `vehicles`, `drivers`, `payments`, `vehicle_history`, `invoices`, `subscriptions`): add `deleted_at` column

### Vehicle creation validation bug
The `CreateVehicleRequest` struct tag uses `oneof=gasoline diesel electric hybrid` for `FuelType`, but the handler also calls `ValidateFuelType()` which only accepts Indonesian fuel names (`pertalite`, `pertamax`, `solar`, etc.). These conflict, making vehicle creation impossible without a code fix.

### Running the backend
```
cd backend && go run cmd/server/main.go
```
The server starts on port 8080. Key endpoints: `/health`, `/health/ready`, `/swagger/index.html`, `/api/v1/...`.

### Running tests
- **Unit tests** (no DB needed): `cd backend && go test ./internal/common/health/... ./internal/common/logging/... ./internal/common/validators/... -v`
- **All tests**: `cd backend && go test ./... -short` (integration tests may fail due to schema mismatches between GORM AutoMigrate and existing SQL-based schema)
- See `make test-unit` and `make test` in the Makefile

### Lint
- `cd backend && go vet ./...` passes cleanly
- `cd backend && gofmt -l .` reports formatting issues (pre-existing)

### Seeding data
After migrations, seed a company and super-admin user via SQL (`INSERT INTO companies ...`, `INSERT INTO users ...`). Default test password: `Password123!` (bcrypt hashed at cost 10). The rate limiter is aggressive (5 req/min on login); flush Redis (`redis-cli FLUSHALL`) if you get rate-limited during testing.

### Gzip compression
All API responses are gzip-compressed. Use `curl --compressed` or add `Accept-Encoding: gzip` header.

### Frontend development
- **Install deps**: `cd frontend && npm install`
- **Dev server**: `cd frontend && npm run dev` (port 5173, proxies `/api` to backend on 8080)
- **Build**: `cd frontend && npm run build`
- **Lint**: `cd frontend && npm run lint`
- **Type check**: `cd frontend && npx tsc --noEmit`
- The frontend uses `@` path aliases (`@/` maps to `src/`). Configured in both `tsconfig.json` and `vite.config.ts`.
- Unauthenticated API calls return 401, which the Axios interceptor redirects to `/login`. To test dashboard/pages with authentication, log in via the login page or set `localStorage.setItem('access_token', '<token>')` in the browser console.
- Test login credentials: `admin@fleettracker.id` / `Password123!` (if backend + DB are seeded).
