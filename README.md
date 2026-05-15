# TuxedoPOS 🎩

> **The complete Point-of-Sale & Rental Management platform for US formal wear businesses.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)](./backend)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5201
```

### Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env   # configure secrets
npm run dev
# → http://localhost:3000/api/v1
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Owner | `admin@tuxedopos.com` | `password` |
| Manager | `manager@tuxedopos.com` | `password` |
| Cashier | `cashier@tuxedopos.com` | `123456` (PIN) |

---

## 📦 Project Structure

```
Universal-POS/
├── frontend/                # React 19 + Vite + Tailwind
│   └── src/
│       ├── app/             # Router + App shell
│       ├── pages/           # All page components
│       ├── layouts/         # AppLayout (protected route wrapper)
│       ├── components/      # Reusable UI components
│       ├── contexts/        # Auth context
│       └── index.css        # Design system (navy/gold)
│
└── backend/                 # NestJS 11 API
    └── src/
        ├── auth/            # JWT + PIN authentication
        ├── users/           # User management
        ├── products/        # Product catalog
        ├── customers/       # Customer profiles
        ├── orders/          # POS orders
        ├── rentals/         # Rental management
        └── inventory/       # Stock tracking
```

---

## 🏗️ Tech Stack

| Styling | Tailwind CSS 4 (Custom Premium Theme) |
| Backend | NestJS 11, TypeScript |
| Auth | JWT + Passport.js |
| ORM | Drizzle ORM (PostgreSQL) |
| Database | PostgreSQL 16 |

---

## 🚀 Development & Seeding

### 1. Database Setup
Ensure you have a PostgreSQL instance running. Update `backend/.env` with your `DATABASE_URL`.

### 2. Seeding Data
To populate the system with comprehensive sample data (last 30 days of orders, rentals, inventory, etc.):
```bash
cd backend
npx ts-node src/db/seed.ts
```

---

---

## 🗺️ Roadmap & Progress

### Phase 1: Foundation (Completed)
- [x] Multi-tenant architecture & Store isolation
- [x] Premium Design System (Tuxedo Navy & Gold)
- [x] Secure JWT-based Authentication (Email & PIN)
- [x] Basic CRUD for Products, Customers, and Orders

### Phase 2: Modernization & Stabilization (Completed)
- [x] **Tailwind CSS 4 Migration**: Global transition to utility-first styling.
- [x] **Reactive Stock Sync**: Resolved POS inventory reporting race conditions.
- [x] **Full API Synchronization**: Eliminated all mock data.
- [x] **Reporting Suite**: Real-time revenue and sales analytics.
- [x] **Loading States**: Integrated high-fidelity skeletons and shimmer effects.

### Phase 3: Advanced Features (Upcoming)
- [ ] **Offline Mode**: Seamless operation during internet outages using IndexedDB (Dexie.js).
- [ ] **Predictive Analytics**: Demand forecasting for rental inventory.
- [ ] **Customer Portal**: Self-service measurements and booking tracking.
- [ ] **Hardware Integration**: Direct printing (Zebra/Star) and Barcode scanner native support.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19 (Stable)
- **Tooling**: Vite 6, TypeScript 5.9
- **Styling**: Tailwind CSS 4 with @theme directives
- **State Management**: TanStack Query v5 + Zustand
- **Charts**: Recharts (Optimized for performance)

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM (Type-safe SQL builder)
- **Auth**: Passport.js + JWT Strategy

---

## 📡 Core API Reference

### System Health & Monitoring
- `GET /api/v1/dashboard/alerts`: Active system/rental warnings.
- `GET /api/v1/admin/stats`: Global MRR and terminal health.

### Transactional
- `POST /api/v1/orders`: Mixed Sale/Rental checkout.
- `POST /api/v1/returns`: Process partial or full order returns.
- `PATCH /api/v1/rentals/:id/checkin`: Rental return with condition tracking.

---

*Built with ❤️ for the US formal wear rental industry. Optimized for performance and scale.*