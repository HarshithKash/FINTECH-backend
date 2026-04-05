# Zorvyn Finance - Financial Management System

Zorvyn Finance is a backend system built using Node.js and Express to manage financial records with role-based access control (RBAC).

The project focuses on API design, data handling, and enforcing access control across different user roles.

---

## Quick Start Guide

Setting up and running the project is simple. Follow these 3 steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Populate the Database (10 Fresh Records)
Our built-in seed script fills the database with 10 diverse income and expense entries instantly.
```bash
node seed.js
```

### 3. Start the Server
```bash
npm start
```
Access the Control Panel at http://localhost:3000/ to interact with the system live.

---

## Core Tech Stack
-   Runtime: Node.js
-   Framework: Express.js
-   Database: SQLite (Perfect for portable deployment)
-   ORM: Prisma (Ensures type-safety and data consistency)
-   Logging: Morgan (Real-time request tracking)

---

## Secure Authorization Model
The system uses a custom-built security middleware to validate every incoming request against a defined role-permission matrix.

| Role | Access Level | Actions |
| :--- | :--- | :--- |
| **Viewer** | Summary Level | Dashboard Summary Only (Totals & Balance) |
| **Analyst** | Analytical Level | Detailed Insights + All Financial Records |
| **Admin** | Operational Level | Complete Access + Create, Update, and Delete |

---

## Testing the API Security
The home page provides a built-in Interface Demo:
1.  **Switch Roles**: Toggle between Viewer, Analyst, and Admin to simulate user login.
2.  **Verify Access**: Try updating a record while in Analyst mode — the backend will reject the request with a 403 Forbidden status, proving the security is active.

---

## Project Architecture
-   index.js: The central core containing API Routes, RBAC Middleware, and the Dynamic UI.
-   prisma/schema.prisma: Defines the robust data models (User and FinancialRecord).
-   seed.js: Automatically handles initial data population for quick testing.

---

## Engineering Focus
This project emphasizes Security, Data Consistency, and Maintainability. Every endpoint handles errors gracefully to ensure a smooth enterprise-ready experience. Built with quality and precision.
