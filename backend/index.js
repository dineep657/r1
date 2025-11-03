import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import authRoutes from "./routes/auth.js";
import db from "./config/database.js";

dotenv.config();

const app = express();

// Get allowed origins from environment variable or use defaults
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production');
    if (!isAllowed) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
// Routes
app.use("/api/auth", authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('CORS policy violation'), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Track room users
const roomIdToUsers = new Map(); // roomId -> Set(userName)

io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUserName = null;

  socket.on('join', ({ roomId, userName }) => {
    if (!roomId || !userName) return;

    currentRoomId = roomId;
    currentUserName = userName;

    socket.join(roomId);

    const users = roomIdToUsers.get(roomId) || new Set();
    users.add(userName);
    roomIdToUsers.set(roomId, users);

    io.to(roomId).emit('userJoined', Array.from(users));
  });

  socket.on('leaveRoom', () => {
    if (!currentRoomId) return;

    socket.leave(currentRoomId);

    const users = roomIdToUsers.get(currentRoomId);
    if (users) {
      users.delete(currentUserName);
      roomIdToUsers.set(currentRoomId, users);
      io.to(currentRoomId).emit('userJoined', Array.from(users));
    }

    currentRoomId = null;
    currentUserName = null;
  });

  socket.on('disconnect', () => {
    if (!currentRoomId) return;

    const users = roomIdToUsers.get(currentRoomId);
    if (users) {
      users.delete(currentUserName);
      roomIdToUsers.set(currentRoomId, users);
      io.to(currentRoomId).emit('userJoined', Array.from(users));
      io.to(currentRoomId).emit('sessionLog', { type: 'leave', user: currentUserName, timestamp: Date.now() });
    }
  });

  socket.on('codeChange', ({ roomId, code }) => {
    if (!roomId) return;
    socket.to(roomId).emit('codeUpdate', code);
  });

  socket.on('typing', ({ roomId, userName }) => {
    if (!roomId) return;
    socket.to(roomId).emit('userTyping', userName);
  });

  socket.on('languageChange', ({ roomId, language }) => {
    if (!roomId) return;
    socket.to(roomId).emit('languageUpdate', language);
  });

  // Presence cursors and selections
  socket.on('cursorMove', ({ roomId, userName, position }) => {
    if (!roomId) return;
    socket.to(roomId).emit('cursorUpdate', { userName, position });
  });

  socket.on('selectionChange', ({ roomId, userName, selection }) => {
    if (!roomId) return;
    socket.to(roomId).emit('selectionUpdate', { userName, selection });
  });

  // Chat
  socket.on('chatMessage', ({ roomId, userName, message }) => {
    if (!roomId || !message) return;
    const payload = { userName, message, timestamp: Date.now() };
    io.to(roomId).emit('chatMessage', payload);
    io.to(roomId).emit('sessionLog', { type: 'chat', user: userName, message, timestamp: Date.now() });
  });

  socket.on('chatTyping', ({ roomId, userName }) => {
    if (!roomId) return;
    socket.to(roomId).emit('chatTyping', { userName });
  });

  // Run executed (analytics)
  socket.on('runExecuted', ({ roomId, userName }) => {
    if (!roomId) return;
    io.to(roomId).emit('sessionLog', { type: 'run', user: userName, timestamp: Date.now() });
  });
});

// Start HTTP server with resilient port binding
function startServer(initialPort, maxAttempts = 5) {
  let currentPort = Number(initialPort) || 5000;
  let attemptsLeft = maxAttempts;

  function tryListen() {
    server.listen(currentPort, () => {
      console.log(`🚀 Server running on http://localhost:${currentPort}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.error(`Port ${currentPort} in use, retrying on ${currentPort + 1}...`);
        attemptsLeft -= 1;
        currentPort += 1;
        setTimeout(() => {
          try {
            server.close(() => tryListen());
          } catch (_) {
            tryListen();
          }
        }, 150);
      } else {
        console.error('Server failed to start:', err);
      }
    });
  }

  tryListen();
}

// Global handlers to avoid hard crashes on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

startServer(process.env.PORT || 5000);