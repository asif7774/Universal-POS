# TuxedoPOS API Documentation 📡

## 📌 Overview
The TuxedoPOS API is a RESTful service built with **NestJS 11** and **Drizzle ORM**. It serves the Universal POS frontend and manages multi-tenant retail operations.

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token

---

## 🔐 Authentication
Most endpoints require a valid JWT token in the `Authorization` header.

### 1. Login (Email)
`POST /auth/login`
- **Body**: `{ "email": "admin@tuxedopos.com", "password": "password" }`
- **Response**: `{ "access_token": "...", "user": { ... } }`

### 2. Login (PIN)
`POST /auth/login/pin`
- **Body**: `{ "pin": "123456" }`
- **Response**: `{ "access_token": "...", "user": { ... } }`

---

## 📦 Products
Manage the global product catalog.

- `GET /products`: List all products. Filter by `?category=`.
- `GET /products/categories`: Get unique product categories.
- `GET /products/:id`: Get detailed product info.
- `POST /products`: Create new product.
- `PUT /products/:id`: Update product.
- `DELETE /products/:id`: Deactivate product.

---

## 👥 Customers
Manage customer profiles, measurements, and loyalty.

- `GET /customers`: List customers. Search via `?search=`.
- `GET /customers/:id`: Get customer profile.
- `POST /customers`: Create customer.
- `PUT /customers/:id`: Update customer.
- `GET /customers/:id/measurements`: Get measurement history.
- `POST /customers/:id/loyalty`: Add loyalty points.
- `POST /loyalty/redeem`: Redeem points (requires `{ customerId, points }`).

---

## 🛒 Orders & Transactions
Handle sales and rentals.

- `GET /orders`: List all orders.
- `GET /orders/recent`: Get top 5 recent orders.
- `GET /orders/summary`: Get daily revenue summary.
- `POST /orders`: Create new order (Sale, Rental, or Mixed).
- `PATCH /orders/:id/status`: Update order status.

---

## 🎩 Rentals
Specialized rental tracking.

- `GET /rentals`: List rentals. Filter by `?status=`.
- `GET /rentals/stats`: Get KPI summary (Booked, Out, Overdue).
- `GET /rentals/overdue`: List all overdue rentals.
- `PATCH /rentals/:id/checkout`: Mark as picked up.
- `PATCH /rentals/:id/checkin`: Mark as returned (requires `{ condition, damageFee }`).

---

## 📊 Reports
Data for analytics dashboards.

- `GET /reports/revenue`: Revenue trend. Params: `?period=week|month`.
- `GET /reports/category-sales`: Sales by category.
- `GET /reports/payment-methods`: Sales by payment type.

---

## 🛠️ Operations
- **Inventory**: `GET /inventory` - Get stock availability grid.
- **Tailoring**: `GET /tailoring` - List tailoring jobs. `POST /tailoring` - Create job.
- **Appointments**: `GET /appointments` - List calendar events. `POST /appointments` - Create booking.
- **Dashboard**: `GET /dashboard/alerts` - Get active system alerts.

---

## 🛡️ Admin & Settings
- **Settings**: `GET /settings` - Get store configuration. `PUT /settings` - Update settings.
- **Staff**: `GET /staff` - List store personnel. `POST /staff` - Add team member.
- **Admin**: `GET /admin/tenants` - System-wide tenant list. `GET /admin/stats` - Platform health KPIs.

---

## ⚠️ Error Handling
Standard HTTP status codes are used:
- `200/201`: Success
- `400`: Bad Request (Validation failed)
- `401`: Unauthorized (Missing/expired token)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
