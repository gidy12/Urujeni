# URUJENI Management System - Deployment Guide

## Option 1: Free Cloud Deployment (Recommended)

### Step 1: Database - MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/atlas → Sign up for free
2. Create a **Free Shared Cluster** (M0)
3. Under **Security → Database Access** → Add a database user (username + password)
4. Under **Security → Network Access** → Add IP: `0.0.0.0/0` (allow all)
5. Click **Connect** → **Drivers** → Copy the connection string
   - Example: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/urujeni?retryWrites=true&w=majority`
   - Replace `<user>` and `<password>` with your database user credentials

---

### Step 2: Backend - Render (Free)

1. Go to https://render.com → Sign up with GitHub
2. Push this repo to GitHub
3. In Render dashboard → **New +** → **Web Service**
4. Connect your GitHub repo
5. Fill in:
   - **Name:** `urujeni-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *(your MongoDB Atlas connection string)* |
| `JWT_SECRET` | *(any random string, e.g. `my-secret-key-2024`)* |
| `JWT_EXPIRE` | `30d` |
| `FRONTEND_URL` | *(your Vercel URL from Step 3)* |

7. Click **Create Web Service**
8. After deploy, copy your URL: `https://urujeni-backend.onrender.com`

---

### Step 3: Frontend - Vercel (Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New → Project** → Import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `build`
4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://urujeni-backend.onrender.com/api` |

5. Click **Deploy**
6. Copy your URL: `https://urujeni.vercel.app`

---

### Step 4: Update Backend CORS

Go back to Render → Environment → Edit `FRONTEND_URL` to your Vercel URL:
```
FRONTEND_URL=https://urujeni.vercel.app
```
Then **Manual Deploy → Clear build cache & deploy**

---

### Step 5: Seed the Database

In Render dashboard → your backend service → **Shell** tab, run:
```
npm run seed
```

Or locally using MongoDB Compass / mongosh.

---

### Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@urujeni.com | admin123 |
| Manager | manager@urujeni.com | manager123 |
| Viewer | viewer@urujeni.com | viewer123 |

> Or register a new account at `/register` and select the Admin role.

---

## Option 2: Local Deployment

### Prerequisites
- Node.js v18+
- MongoDB installed locally (https://www.mongodb.com/try/download/community)

### Steps

```bash
# 1. Start MongoDB
mongod

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Seed demo data
cd backend && npm run seed

# 4. Start both servers (in two terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

Open http://localhost:3000

---

## File Structure after Deployment

```
URUJENI/
├── backend/          → Deployed on Render
├── frontend/         → Deployed on Vercel
├── DEPLOYMENT.md     ← You are here
└── README.md
```
