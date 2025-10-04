# 🚀 Git Submodule Setup Commands - FleetTracker Pro

## 📋 Quick Setup Guide

This guide provides the exact commands to set up git submodules for your FleetTracker Pro project.

## 🎯 Prerequisites

1. **Git repository initialized** ✅ (Already done)
2. **Remote repository created** (GitHub/GitLab)
3. **Team access configured**

## 🚀 Step-by-Step Setup

### Step 1: Create Remote Repositories

First, create these repositories on your Git platform (GitHub/GitLab):

```bash
# Repository URLs (replace 'your-org' with your organization)
https://github.com/tobangado69/fleettracker-backend.git
https://github.com/tobangado69/fleettracker-frontend.git
https://github.com/tobangado69/fleettracker-infrastructure.git
https://github.com/tobangado69/fleettracker-docs.git
https://github.com/tobangado69/fleettracker-shared.git
```

### Step 2: Add Submodules to Main Repository

```bash
# Navigate to your main project directory
cd C:\Users\Administrator\Ticketku

# Add backend submodule
git submodule add https://github.com/tobangado69/fleettracker-backend.git backend

# Add frontend submodule
git submodule add https://github.com/tobangado69/fleettracker-frontend.git frontend

# Add infrastructure submodule
git submodule add https://github.com/tobangado69/fleettracker-infrastructure.git infrastructure

# Add docs submodule (move existing docs)
git submodule add https://github.com/tobangado69/fleettracker-docs.git docs-new
# Note: You'll need to move existing docs/ content to the submodule

# Add shared submodule
git submodule add https://github.com/tobangado69/fleettracker-shared.git shared
```

### Step 3: Configure Submodule Branches

```bash
# Set default branches for submodules
git config -f .gitmodules submodule.backend.branch main
git config -f .gitmodules submodule.frontend.branch main
git config -f .gitmodules submodule.infrastructure.branch main
git config -f .gitmodules submodule.docs.branch main
git config -f .gitmodules submodule.shared.branch main
```

### Step 4: Initialize and Update Submodules

```bash
# Initialize submodules
git submodule init

# Update submodules
git submodule update

# Or do both in one command
git submodule update --init --recursive
```

### Step 5: Commit Submodule Configuration

```bash
# Add .gitmodules file
git add .gitmodules

# Commit submodule setup
git commit -m "feat: add git submodules for modular architecture

- Add backend submodule for Go application
- Add frontend submodule for TypeScript/React app
- Add infrastructure submodule for Docker/K8s configs
- Add docs submodule for documentation
- Add shared submodule for shared libraries

This enables:
- Independent development of components
- Separate CI/CD pipelines
- Team-specific access control
- Easier maintenance and scaling"
```

## 🔧 Development Commands

### Working with Submodules

```bash
# Clone repository with all submodules
git clone --recursive https://github.com/tobangado69/fleettracker-pro.git

# Update all submodules to latest commits
git submodule update --remote

# Update specific submodule
git submodule update --remote backend

# Work in a submodule
cd backend
git checkout -b feature/new-backend-feature
# Make changes...
git add .
git commit -m "feat: add new backend feature"
git push origin feature/new-backend-feature

# Update main repository with submodule changes
cd ..
git add backend
git commit -m "chore: update backend submodule to latest"
git push origin main
```

### Useful Submodule Commands

```bash
# Check submodule status
git submodule status

# Show submodule summary
git submodule summary

# Deinitialize a submodule (if needed)
git submodule deinit backend

# Remove a submodule completely
git submodule deinit backend
git rm backend
rm -rf .git/modules/backend
```

## 📁 Directory Structure After Setup

```
Ticketku/                           # Main repository
├── .gitmodules                     # Submodule configuration
├── backend/                        # Backend submodule
│   ├── cmd/
│   ├── internal/
│   ├── go.mod
│   └── ...
├── frontend/                       # Frontend submodule
│   ├── src/
│   ├── package.json
│   └── ...
├── infrastructure/                 # Infrastructure submodule
│   ├── docker/
│   ├── kubernetes/
│   └── ...
├── docs-new/                       # Docs submodule
│   ├── api/
│   ├── deployment/
│   └── ...
├── shared/                         # Shared submodule
│   ├── types/
│   ├── utils/
│   └── ...
├── docs/                           # Existing docs (to be moved)
├── specs/                          # Existing specs
├── README.md
└── SUBMODULE_PLAN.md
```

## 🚨 Important Notes

### 1. **Move Existing Documentation**
```bash
# After creating docs submodule, move existing docs
cp -r docs/* docs-new/
git add docs-new/
git commit -m "chore: move existing docs to submodule"
```

### 2. **Team Collaboration**
- Each team member needs to run `git submodule update --init --recursive` after cloning
- Document submodule workflow in team README
- Set up CI/CD pipelines for each submodule

### 3. **Indonesian Market Considerations**
- Ensure Indonesian payment integration is in the correct submodule
- Localization files should be in shared submodule
- Compliance documentation in docs submodule

## 🎯 Next Steps

1. **Create the remote repositories** on your Git platform
2. **Run the submodule setup commands** above
3. **Move existing code** to appropriate submodules
4. **Set up CI/CD pipelines** for each submodule
5. **Document the workflow** for your team
6. **Test the setup** with a small feature

## 🔗 Useful Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub Submodules Guide](https://github.blog/2016-02-01-working-with-submodules/)
- [GitLab Submodules Guide](https://docs.gitlab.com/ee/user/project/submodules/)

---

**Ready to set up your modular FleetTracker Pro architecture!** 🚀
