# 🚀 Real-Time Collaborative Code Editor

A real-time collaborative code editor where multiple users can code together, execute code, and chat simultaneously.

## ✨ Features

- 🔐 User Authentication (Signup/Login)
- 👥 Real-time Collaboration
- 💻 Multi-language Support (JavaScript, Python, Java, C++, etc.)
- 🏃 Code Execution (via Piston API)
- 💬 Real-time Chat
- 🎨 Color-coded Users
- 📝 Sample Code Templates
- 🔄 Live Code Synchronization

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Monaco Editor, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MySQL
- **Authentication**: JWT

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- MySQL 8+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/realtime-code-editor.git
cd realtime-code-editor
```

2. Install dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

3. Set up environment variables

Create `nodemon.json` (already exists) or `.env` file in root:
```json
{
  "env": {
    "PORT": "5001",
    "DB_HOST": "localhost",
    "DB_PORT": "3306",
    "DB_USER": "root",
    "DB_PASSWORD": "your_password",
    "DB_NAME": "collab_coding",
    "JWT_SECRET": "your-secret-key",
    "FRONTEND_URL": "http://localhost:5173"
  }
}
```

4. Start MySQL database

5. Start the backend
```bash
npm run dev
```

6. Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

7. Open http://localhost:5173

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

1. **Railway + Vercel** (Recommended - Free)
   - Backend + Database: Railway.app
   - Frontend: Vercel.com

2. **Render.com** (Free tier available)
   - Use the included `render.yaml` file

## 📝 License

ISC

