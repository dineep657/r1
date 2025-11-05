# 🚀 Complete Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will help you deploy your real-time collaborative code editor with:
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free tier)
- **Database**: Railway MySQL (Free) - replacing your local XAMPP database

---

## 📋 Prerequisites

1. ✅ GitHub account (you already have this)
2. ✅ Your code pushed to GitHub (done!)
3. 🆕 Render account - https://render.com (sign up with GitHub)
4. 🆕 Vercel account - https://vercel.com (sign up with GitHub)
5. 🆕 Railway account - https://railway.app (for free MySQL database)

---

## 🗄️ STEP 1: Setup Cloud Database (Railway)

Since your XAMPP database is local, we need to create a cloud database.

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click **"Login with GitHub"**
3. Authorize Railway

### 1.2 Create MySQL Database
1. Click **"New Project"**
2. Select **"Provision MySQL"**
3. Wait for database to be created (takes ~30 seconds)
4. Click on the **MySQL** service card

### 1.3 Get Database Credentials
1. Click on **"Variables"** tab
2. You'll see these variables (copy them somewhere safe):
   ```
   MYSQLHOST=containers-us-west-xxx.railway.app
   MYSQLPORT=6379
   MYSQLUSER=root
   MYSQLPASSWORD=xxxxxxxxxx
   MYSQLDATABASE=railway
   ```

### 1.4 (Optional) Export Your Local Database
If you have existing users in your XAMPP database:

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select your `codecollab` database
3. Click **"Export"** tab
4. Choose **"Quick"** export method
5. Click **"Go"** to download the SQL file

**Note**: The backend automatically creates the `users` table, so you only need to export if you have existing data.

---

## ⚙️ STEP 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** to connect your GitHub
3. Find and select your repository: `dineep657/r1`
4. Click **"Connect"**

### 2.3 Configure Service
Fill in these settings:

**Basic Settings:**
- **Name**: `realtime-code-backend` (or any name you like)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `master`
- **Root Directory**: `real-collab` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (this is important!)

### 2.4 Add Environment Variables
Scroll down to **"Environment Variables"** section and add these:

Click **"Add Environment Variable"** for each:

```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-super-secret-random-string-here-make-it-long
JWT_EXPIRE=7d
```

**Database Variables** (use values from Railway Step 1.3):
```bash
MYSQLHOST=<your-railway-host>
MYSQLPORT=<your-railway-port>
MYSQLUSER=<your-railway-user>
MYSQLPASSWORD=<your-railway-password>
MYSQLDATABASE=<your-railway-database>
```

**How to generate JWT_SECRET:**
- Open PowerShell and run: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
- Or use any random string generator online (make it at least 32 characters)

**Important**: Don't click "Create Web Service" yet! We'll update FRONTEND_URL later.

### 2.5 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (takes 3-5 minutes)
3. Once deployed, you'll see a URL like: `https://realtime-code-backend.onrender.com`
4. **Copy this URL** - you'll need it for frontend!

### 2.6 Test Backend
1. Visit: `https://your-backend-url.onrender.com/api/health`
2. You should see: `{"status":"ok","message":"Server is running",...}`

---

## 🎨 STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your repository: `dineep657/r1`
3. Click **"Import"**

### 3.3 Configure Project
**Framework Preset**: Vite (should auto-detect)

**Root Directory**: 
- Click **"Edit"**
- Enter: `real-collab/frontend`
- Click **"Continue"**

**Build Settings** (should auto-fill):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3.4 Add Environment Variables
Click **"Environment Variables"** and add:

**Variable 1:**
- Key: `VITE_API_URL`
- Value: `https://your-backend-url.onrender.com/api`
- (Replace with your actual Render backend URL from Step 2.5)

**Variable 2:**
- Key: `VITE_SOCKET_URL`
- Value: `https://your-backend-url.onrender.com`
- (Same backend URL, but without `/api`)

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment (takes 2-3 minutes)
3. Once done, you'll get a URL like: `https://your-app.vercel.app`
4. **Copy this URL**

---

## 🔄 STEP 4: Update Backend CORS Settings

Now we need to tell the backend to accept requests from your Vercel frontend.

### 4.1 Update Render Environment Variable
1. Go back to Render dashboard
2. Click on your backend service
3. Go to **"Environment"** tab
4. Find the `FRONTEND_URL` variable
5. Click **"Edit"**
6. Update value to: `https://your-app.vercel.app` (your actual Vercel URL)
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 1-2 minutes)

---

## ✅ STEP 5: Test Your Deployment

### 5.1 Test Backend
1. Visit: `https://your-backend-url.onrender.com/api/health`
2. Should return: `{"status":"ok",...}`

### 5.2 Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the home page

### 5.3 Test Full Flow
1. Click **"Sign Up"**
2. Create a new account (name, email, password)
3. After signup, you should be redirected to home
4. Click **"Open Editor"**
5. Create a new room
6. Try typing some code
7. Click **"Execute Code"** to test code execution

### 5.4 Test Collaboration
1. Open your app in a different browser (or incognito)
2. Sign up with a different account
3. Join the same room using the Room ID
4. Both users should see each other in the "Users in Room" list
5. Type in one browser - the other should see the changes in real-time!

---

## 🐛 Troubleshooting

### Issue: "Request failed with status code 404"
**Solution**: 
- Check that `VITE_API_URL` in Vercel includes `/api` at the end
- Verify backend is running: visit `https://your-backend.onrender.com/api/health`

### Issue: "Waiting for server connection..."
**Solution**:
- Check that `VITE_SOCKET_URL` in Vercel is correct (without `/api`)
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly

### Issue: "Database connection failed"
**Solution**:
- Verify all MySQL environment variables in Render are correct
- Check Railway database is running (green status)
- Make sure you copied the values exactly from Railway

### Issue: Backend is slow to respond
**Solution**:
- Render free tier "spins down" after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds to wake up
- This is normal for free tier - subsequent requests are fast

### Issue: "CORS policy violation"
**Solution**:
- Make sure `FRONTEND_URL` in Render backend matches your Vercel URL exactly
- Include `https://` in the URL
- No trailing slash at the end

---

## 💰 Cost Breakdown

- **Railway MySQL**: Free (500MB storage, enough for thousands of users)
- **Render Backend**: Free (750 hours/month, spins down after inactivity)
- **Vercel Frontend**: Free (unlimited bandwidth for personal projects)

**Total Cost**: $0/month 🎉

---

## 📝 Deployment Checklist

- [ ] Railway MySQL database created
- [ ] Database credentials copied
- [ ] Backend deployed to Render
- [ ] Backend environment variables configured
- [ ] Backend health check working
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] CORS updated with Vercel URL
- [ ] Signup/Login tested
- [ ] Room creation tested
- [ ] Code execution tested
- [ ] Real-time collaboration tested

---

## 🔗 Your Live URLs

After deployment, save these URLs:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Railway (internal connection)

Share your frontend URL with anyone to collaborate! 🚀

---

## 🎯 Next Steps

1. **Custom Domain** (Optional):
   - Vercel: Add custom domain in project settings (free)
   - Render: Custom domains available on paid plans

2. **Monitoring**:
   - Render: Check logs in dashboard
   - Vercel: Check deployment logs and analytics

3. **Updates**:
   - Push to GitHub `master` branch
   - Vercel auto-deploys frontend
   - Render auto-deploys backend

---

## 💡 Pro Tips

1. **Keep Backend Alive**: 
   - Use a service like UptimeRobot (free) to ping your backend every 5 minutes
   - This prevents it from spinning down

2. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always use platform environment variables

3. **Database Backups**:
   - Railway provides automatic backups
   - Export your database periodically from Railway dashboard

4. **Logs**:
   - Check Render logs if something goes wrong
   - Check Vercel deployment logs for frontend issues

---

**Need Help?** 
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

Good luck with your deployment! 🚀

