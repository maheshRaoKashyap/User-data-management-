# UserVault — Full-Stack User Management System

> A production-grade REST API + SPA built with Node.js, Express, and Vanilla JavaScript.  
> No frameworks. No databases. Just clean, professional engineering.

---

## Features

| Category | Details |
|----------|---------|
| **Backend** | Node.js · Express · RESTful API · File-based JSON store |
| **Frontend** | Vanilla JS SPA · Zero dependencies · Responsive |
| **CRUD** | Create · Read · Update · Delete (full lifecycle) |
| **Validation** | Client-side live validation + Server-side validation |
| **Search** | Real-time search by name, email, or job title |
| **Filtering** | Filter by gender · Sort by name or recency |
| **UI** | Dashboard with live stats · Edit modal · Delete confirmation |
| **UX** | Toast notifications · Loading states · Mobile responsive |
| **API** | JSON responses · Error handling · Duplicate detection |

---

## Project Structure

```
uservault/
├── server.js          # Express server — all API routes
├── MOCK_DATA.json     # JSON data store (acts as database)
├── package.json
├── .gitignore
└── public/            # Static frontend (served by Express)
    ├── index.html     # Single-page application shell
    ├── style.css      # Full design system (dark theme)
    └── app.js         # All frontend logic — routing, API, UI
```

---

## Quick Start

### Prerequisites
- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node)

### Installation

```bash
# 1. Clone or download the project
cd uservault

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open **http://localhost:8000** in your browser.

**Development mode** (auto-restarts on file changes):
```bash
npm run dev
```

---

## API Reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users (supports `?search=`, `?gender=`, `?sort=`) |
| `GET` | `/api/users/stats` | Dashboard metrics (total, genders, newest) |
| `GET` | `/api/users/:id` | Get single user by ID |
| `POST` | `/api/users` | Create new user |
| `PATCH` | `/api/users/:id` | Update user fields |
| `DELETE` | `/api/users/:id` | Delete user |

### Example: Create a User

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ada",
    "last_name": "Lovelace",
    "email": "ada@babbage.io",
    "gender": "Female",
    "job_title": "Computing Pioneer"
  }'
```

### Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "data": { ... },
  "message": "User created successfully."
}
```

Errors return:
```json
{
  "success": false,
  "errors": [
    { "field": "email", "msg": "Please provide a valid email address." }
  ]
}
```

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Store**: JSON flat file (`MOCK_DATA.json`)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ES2022)
- **Fonts**: Manrope · DM Mono (Google Fonts)

---

## Extending the Project

To add a real database, swap `MOCK_DATA.json` with:
- **MongoDB** using Mongoose: replace `readDB`/`writeDB` with Mongoose models
- **SQLite** using `better-sqlite3`: minimal changes, same structure
- **PostgreSQL** using `pg`: async queries drop into the same route handlers

---

## License

MIT — free to use, modify, and share.
