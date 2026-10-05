# College Project & IEEE Paper Review Management System (PaperTracker)

A modern, production-grade academic SaaS platform for managing college engineering projects, IEEE conference paper drafting cycles, multi-parameter rubric evaluations, semester presentation defenses, and real-time mentor-student collaboration.

---

## 🌟 Key Features

* **Single Admin Provisioning**: Secure environment variable-driven initial admin creation with zero dummy or mock accounts.
* **IEEE 26-Parameter Matrix**: Standardized evaluation rubrics across Research Quality, Writing Quality, Technical Quality, and Conference Readiness.
* **Presentation Defense Scoring**: 12-parameter rubric matrix for semester milestones (Review 1, Review 2, Final Defense).
* **Institutional Scoring Formula**: Automatic merit calculation ($70\%\text{ Paper Score} + 30\%\text{ Presentation Score}$).
* **Version Iteration Tracking**: Full version archiving ($V1 \rightarrow V2 \rightarrow V3$) with PDF downloads, external links, and changelog diffs.
* **AI Abstract Validator**: Heuristic analysis tool evaluating word counts, research background, problem statement, quantitative metrics, and IEEE guidelines.
* **Real-time Discussions & Notifications**: Socket.io-powered guide-team chat channel with file attachment support and activity alerts.
* **Master Institutional Leaderboard**: Transparent ranking table with academic session filters, department filters, and CSV report export.
* **Modern Academic SaaS Interface**: Minimalist light aesthetic inspired by Linear, Notion, Stripe, and GitHub with 90% neutral palette and 10% sky blue accent.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons, Canvas Confetti, Axios, Socket.io-client.
* **Backend**: Node.js, Express.js (ES Modules), Mongoose, MongoDB (MongoDB Atlas or embedded In-Memory Mongo for instant zero-config startup), Socket.io, Multer, Bcrypt.js, JSON Web Tokens (JWT).

---

## 🚀 Local Development Setup

### 1. Prerequisites
* Node.js (v18 or higher)
* npm

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend server will run on `http://localhost:5000` with API at `http://localhost:5000/api`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend application will run on `http://localhost:5173`.

---

## 🔐 Default Initial Administrator Credentials

When starting the application with default `.env` variables:
* **Email**: `admin@institution.edu`
* **Password**: `AdminSecurePassword@2026`
* **Role**: Institutional Administrator

*Note: You can configure custom admin credentials by modifying `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before launching.*

---

## 🌐 Production Cloud Deployment Guide

### Deploy Backend on Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository: `https://github.com/jamesyuvaraj27/papertracker.git`.
3. Configure the service:
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add **Environment Variables** in Render Dashboard:
   * `NODE_ENV`: `production`
   * `JWT_SECRET`: `<your-secure-jwt-secret>`
   * `ADMIN_NAME`: `Institutional Administrator`
   * `ADMIN_EMAIL`: `admin@institution.edu`
   * `ADMIN_PASSWORD`: `<your-secure-admin-password>`
   * `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
5. Deploy the service and note your Render backend URL (e.g. `https://papertracker-backend.onrender.com`).

---

### Deploy Frontend on Vercel

1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Configure Project Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
3. Add **Environment Variables** in Vercel Dashboard:
   * `VITE_API_URL`: `https://<your-render-backend-url>.onrender.com/api`
   * `VITE_SOCKET_URL`: `https://<your-render-backend-url>.onrender.com`
4. Click **Deploy**. SPA client routing is pre-configured via `vercel.json`.

---

## 📄 License
MIT License
