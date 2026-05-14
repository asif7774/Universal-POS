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

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript |
| Styling | Vanilla CSS (custom design system) |
| State | Zustand + TanStack Query *(coming soon)* |
| Backend | NestJS 11, TypeScript |
| Auth | JWT + Passport.js |
| ORM | Drizzle ORM *(coming soon)* |
| Database | PostgreSQL 16 *(coming soon)* |

---

## ✅ Week 1 Features

- [x] Premium login (email + PIN modes)
- [x] Role-based navigation (Owner / Manager / Cashier)
- [x] Dashboard with stats, alerts, fleet status
- [x] POS Terminal with cart, rentals, tax, checkout
- [x] Rental Management (status tracking, overdue detection)
- [x] Customer Profiles + Measurements
- [x] Tailoring Jobs (Kanban + List view)
- [x] Inventory with size-grid availability
- [x] NestJS API with Auth + Products endpoints
- [ ] PostgreSQL + Drizzle ORM (Day 3)
- [ ] Appointments calendar (Day 3)
- [ ] Reports & Analytics (Day 4)

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Email + password login |
| POST | `/api/v1/auth/login/pin` | Cashier PIN login |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Logout |

### Products *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/products/categories` | Get categories |
| GET | `/api/v1/products/:id` | Get product |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Deactivate product |

---

*Built with ❤️ for the US formal wear rental industry.*