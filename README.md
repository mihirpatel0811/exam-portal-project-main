# 🎓 ExamPortal — Full Stack Exam Management System

A complete, production-ready Exam Portal with **three role-based dashboards** for Students, Teachers, and Admins.

---

## 📸 Features

| Role | Capabilities |
|------|-------------|
| **Student** | View & attempt timed exams, see results with answer review |
| **Teacher** | Create/edit/delete exams, add MCQ/T-F/short-answer questions, publish/unpublish |
| **Admin** | Manage all users (activate/deactivate/change role), view full analytics |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios, Context API |
| Backend | Node.js, Express 5, JWT, Bcrypt |
| Database | MongoDB with Mongoose |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`)

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Copy the example environment file and edit it:
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your configuration:
- Set a strong random `JWT_SECRET`
- Update `MONGO_URI` if your MongoDB is not on localhost
- Adjust `CORS_ORIGIN` if your frontend runs on a different port

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates demo accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@exam.com | admin123 | Admin |
| teacher@exam.com | teacher123 | Teacher |
| student@exam.com | student123 | Student |

### 4. Start the servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

Open **http://localhost:5173** and log in with any demo account.

---

## 🗂 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route logic
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── examController.js
│   │   │   ├── questionController.js
│   │   │   └── attemptController.js
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Exam.js
│   │   │   ├── Question.js
│   │   │   └── Attempt.js
│   │   ├── routes/           # Express routers
│   │   ├── middleware/        # Auth, error handler
│   │   ├── seed.js           # DB seeder
│   │   └── app.js            # Entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/        # Sidebar, Layout
        ├── context/           # AuthContext
        ├── pages/             # All page components
        ├── routes/            # ProtectedRoute
        ├── services/api/      # Axios client + API funcs
        ├── App.jsx            # Router setup
        ├── main.jsx
        └── index.css          # Design system
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |

### Exams
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/exams` | Auth |
| POST | `/api/exams` | Teacher/Admin |
| GET | `/api/exams/:id` | Auth |
| PUT | `/api/exams/:id` | Teacher/Admin |
| DELETE | `/api/exams/:id` | Teacher/Admin |

### Questions
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/questions` | Teacher/Admin |
| PUT | `/api/questions/:id` | Teacher/Admin |
| DELETE | `/api/questions/:id` | Teacher/Admin |

### Attempts
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/attempts/start` | Student |
| POST | `/api/attempts/submit` | Student |
| GET | `/api/attempts/:id` | Auth |

### Results
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/results` | Teacher/Admin |
| GET | `/api/results/me` | Student |
| GET | `/api/results/:userId` | Auth |

### Users (Admin only)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users` | Admin |
| PUT | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens with configurable expiration
- Role-based access control on every route
- **Helmet** HTTP headers
- **Rate limiting** (200 req / 15 min)
- CORS restricted to frontend origin

---

## 📝 Exam Question Types

| Type | Description | Auto-Graded |
|------|-------------|-------------|
| **MCQ** | Multiple choice, single answer | ✅ Yes |
| **True/False** | Binary choice | ✅ Yes |
| **Short Answer** | Free text | ❌ Manual |
"# Exam-Portal-Project" 
