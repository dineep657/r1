# 🚀 Quick Deployment Reference Card

## 📋 URLs You'll Need

### Sign Up for These Services:
1. **Railway** (Database): https://railway.app
2. **Render** (Backend): https://render.com  
3. **Vercel** (Frontend): https://vercel.com

---

## 🗄️ Railway (Database) - 5 minutes

1. Login → New Project → Provision MySQL
2. Click MySQL → Variables tab
3. **Copy these values:**
   - MYSQLHOST
   - MYSQLPORT
   - MYSQLUSER
   - MYSQLPASSWORD
   - MYSQLDATABASE

---

## ⚙️ Render (Backend) - 10 minutes

### Settings:
- **Repository**: `dineep657/r1`
- **Root Directory**: `real-collab`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

### Environment Variables:
```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRE=7d

# From Railway:
MYSQLHOST=<from-railway>
MYSQLPORT=<from-railway>
MYSQLUSER=<from-railway>
MYSQLPASSWORD=<from-railway>
MYSQLDATABASE=<from-railway>
```

**Generate JWT_SECRET** (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**After Deploy**: Copy your backend URL (e.g., `https://xxx.onrender.com`)

---

## 🎨 Vercel (Frontend) - 5 minutes

### Settings:
- **Repository**: `dineep657/r1`
- **Framework**: Vite
- **Root Directory**: `real-collab/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables:
```bash
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

**After Deploy**: Copy your frontend URL (e.g., `https://xxx.vercel.app`)

---

## 🔄 Final Step: Update CORS

1. Go back to Render
2. Environment tab
3. Edit `FRONTEND_URL`
4. Set to your Vercel URL: `https://your-app.vercel.app`
5. Save (auto-redeploys)

---

## ✅ Test Checklist

- [ ] Backend health: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Sign up works
- [ ] Login works
- [ ] Create room works
- [ ] Code execution works
- [ ] Two users can see each other in same room

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 404 errors | Check `VITE_API_URL` has `/api` at end |
| Socket not connecting | Check `VITE_SOCKET_URL` (no `/api`) |
| CORS errors | Update `FRONTEND_URL` in Render |
| Slow first load | Normal - Render free tier spins down |
| Database errors | Verify all MYSQL* variables from Railway |

---

## 📱 Share Your App

**Your live URL**: `https://your-app.vercel.app`

Anyone can access it! No installation needed! 🎉

---

## 🔄 Future Updates

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```
3. Vercel and Render auto-deploy! ✨

---

**Total Time**: ~20 minutes  
**Total Cost**: $0/month 💰

