# 🚀 Free Deployment Guide

This guide will help you deploy your real-time code editor for FREE using:
- **Railway.app** (Backend + Database) - Free tier with $5 credit/month
- **Vercel** (Frontend) - Completely free

## 📋 Prerequisites

1. GitHub account (free)
2. Railway.app account (free) - https://railway.app
3. Vercel account (free) - https://vercel.com

---

## 🗄️ Step 1: Deploy Database (Railway)

1. Go to https://railway.app and sign up/login
2. Click **"New Project"**
3. Click **"Provision MySQL"** (or search for MySQL)
4. Wait for the database to be created
5. Click on the MySQL service
6. Go to **"Variables"** tab
7. Note down these values:
   - `MYSQLHOST` (database host)
   - `MYSQLPORT` (usually 3306)
   - `MYSQLUSER` (database user)
   - `MYSQLPASSWORD` (database password)
   - `MYSQLDATABASE` (database name)

---

## ⚙️ Step 2: Deploy Backend (Railway)

1. In Railway, click **"New"** → **"Empty Service"**
2. Click **"Connect GitHub"** and select your repository
3. Railway will detect your project
4. In the **Settings** tab:
   - **Root Directory**: Leave empty (or set to project root)
   - **Build Command**: Leave default (uses `railway.json` with `npm ci` - faster!)
   - **Start Command**: Leave default (uses `railway.json` with `npm start`)
   - **Watch Paths**: Leave default

5. Go to **"Variables"** tab and add these environment variables:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
DB_HOST=<MYSQLHOST from database>
DB_PORT=3306
DB_USER=<MYSQLUSER from database>
DB_PASSWORD=<MYSQLPASSWORD from database>
DB_NAME=<MYSQLDATABASE from database>
JWT_SECRET=<generate a random long string>
JWT_EXPIRE=7d
```

**Important**: 
- Replace `<MYSQLHOST>` etc. with actual values from your database
- Generate `JWT_SECRET` using: `openssl rand -base64 32` or any random string generator

6. Railway will automatically deploy your backend
7. Once deployed, go to **"Settings"** → **"Generate Domain"** to get your backend URL
8. Copy the backend URL (e.g., `https://your-backend.railway.app`)

---

## 🎨 Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     VITE_SOCKET_URL=https://your-backend.railway.app
     ```
   - Replace `your-backend.railway.app` with your actual Railway backend URL

6. Click **"Deploy"**
7. Wait for deployment to complete
8. Copy your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

---

## 🔄 Step 4: Update Backend CORS

1. Go back to Railway backend service
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Replace with your actual Vercel frontend URL
4. Railway will automatically redeploy

---

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Create an account
3. Create/join a room
4. Test code execution
5. Share the link with others!

---

## 🔗 Alternative: Render.com (All-in-One)

If you prefer to use Render.com (which has a render.yaml file):

1. Go to https://render.com and sign up
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. **Note**: Render's free tier spins down after inactivity, but it's free!

### Update render.yaml for your needs:

The existing `render.yaml` should work, but you may need to:
- Remove the MySQL service if using an external database
- Or use Render's free PostgreSQL instead

---

## 💡 Tips for Free Deployment

1. **Database Options**:
   - Railway: Free MySQL (included)
   - PlanetScale: Free MySQL tier (500MB)
   - Neon: Free PostgreSQL tier (512MB)

2. **Keep Services Active**:
   - Railway: Services sleep after inactivity (wake on request)
   - Vercel: Always active (no sleep)

3. **Costs**:
   - Railway: Free $5/month credit (usually enough)
   - Vercel: Completely free
   - Total: **$0/month** 🎉

---

## 🐛 Troubleshooting

### Backend not connecting to database:
- Check database credentials in Railway variables
- Ensure database is running (check Railway dashboard)

### Frontend can't connect to backend:
- Verify `VITE_API_URL` points to your Railway backend
- Check CORS settings in backend
- Ensure `FRONTEND_URL` in backend matches your Vercel URL

### Socket.IO not working:
- Ensure `VITE_SOCKET_URL` is set correctly
- Check that Socket.IO is using the same URL as API

---

## 📝 Quick Checklist

- [ ] Database deployed on Railway
- [ ] Backend deployed on Railway with correct env vars
- [ ] Frontend deployed on Vercel with API URLs
- [ ] CORS configured correctly
- [ ] Tested signup/login
- [ ] Tested room creation
- [ ] Tested code execution
- [ ] Shared link works

---

**Your app will be live at**: `https://your-app.vercel.app`

Anyone can now access it via the link! 🎉

