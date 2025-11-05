import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
// Auth and database are optional. When DISABLE_AUTH=true, we skip importing them
let authRoutes = null;

dotenv.config();

const app = express();

// Get allowed origins from environment variable or use defaults
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : process.env.NODE_ENV === 'production'
  ? [] // Will be set in production
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
// Conditionally enable auth endpoints to avoid database usage when disabled
(async () => {
  if (process.env.DISABLE_AUTH === 'true') {
    app.use('/api/auth', (_req, res) => {
      res.status(503).json({ success: false, message: 'Auth is disabled' });
    });
  } else {
    try {
      // Dynamic import to avoid loading DB modules when auth is disabled
      const authModule = await import('./routes/auth.js');
      authRoutes = authModule.default;
      app.use('/api/auth', authRoutes);
    } catch (error) {
      console.error('⚠️  Failed to load auth routes:', error.message);
      console.log('💡 Tip: Set DISABLE_AUTH=true to skip database authentication');
      app.use('/api/auth', (_req, res) => {
        res.status(503).json({ 
          success: false, 
          message: 'Authentication service unavailable. Please set DISABLE_AUTH=true or configure database.' 
        });
      });
    }
  }
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
// Routes already mounted above conditionally

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || 
                       allowedOrigins.length === 0 || // Allow all in production if no specific origins set
                       (process.env.NODE_ENV !== 'production');
      if (!isAllowed) {
        console.log('Socket.IO CORS blocked origin:', origin);
        return callback(new Error('CORS policy violation'), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Track room users - Map of roomId -> Map of socketId -> userName
const roomIdToUsers = new Map(); // roomId -> Map(socketId -> userName)

io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUserName = null;

  console.log(`Socket connected: ${socket.id}`);

  socket.on('join', ({ roomId, userName }) => {
    if (!roomId || !userName) {
      console.log('Join rejected: missing roomId or userName', { roomId, userName });
      return;
    }

    console.log(`User ${userName} (socket: ${socket.id}) joining room ${roomId}`);

    // Leave previous room if any
    if (currentRoomId && currentRoomId !== roomId) {
      socket.leave(currentRoomId);
      const prevUsers = roomIdToUsers.get(currentRoomId);
      if (prevUsers) {
        prevUsers.delete(socket.id);
        if (prevUsers.size > 0) {
          const userList = Array.from(new Set(prevUsers.values()));
          io.to(currentRoomId).emit('userJoined', userList);
          console.log(`Updated users in room ${currentRoomId}:`, userList);
        } else {
          roomIdToUsers.delete(currentRoomId);
        }
      }
    }

    currentRoomId = roomId;
    currentUserName = userName;

    socket.join(roomId);

    // Get or create user map for this room
    if (!roomIdToUsers.has(roomId)) {
      roomIdToUsers.set(roomId, new Map());
    }
    const usersMap = roomIdToUsers.get(roomId);
    usersMap.set(socket.id, userName);

    // Get unique user names
    const userList = Array.from(new Set(usersMap.values()));
    console.log(`Room ${roomId} now has users:`, userList, `(${usersMap.size} connections)`);

    // Emit to all users in the room (including the one who just joined)
    io.to(roomId).emit('userJoined', userList);
  });

  socket.on('leaveRoom', () => {
    if (!currentRoomId) return;

    console.log(`User ${currentUserName} (socket: ${socket.id}) leaving room ${currentRoomId}`);
    socket.leave(currentRoomId);

    const usersMap = roomIdToUsers.get(currentRoomId);
    if (usersMap) {
      usersMap.delete(socket.id);
      if (usersMap.size > 0) {
        const userList = Array.from(new Set(usersMap.values()));
        io.to(currentRoomId).emit('userJoined', userList);
        console.log(`Updated users in room ${currentRoomId}:`, userList);
      } else {
        roomIdToUsers.delete(currentRoomId);
        console.log(`Room ${currentRoomId} is now empty`);
      }
    }

    currentRoomId = null;
    currentUserName = null;
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (!currentRoomId) return;

    const usersMap = roomIdToUsers.get(currentRoomId);
    if (usersMap) {
      usersMap.delete(socket.id);
      if (usersMap.size > 0) {
        const userList = Array.from(new Set(usersMap.values()));
        io.to(currentRoomId).emit('userJoined', userList);
        io.to(currentRoomId).emit('sessionLog', { type: 'leave', user: currentUserName, timestamp: Date.now() });
        console.log(`User ${currentUserName} disconnected from room ${currentRoomId}. Remaining users:`, userList);
      } else {
        roomIdToUsers.delete(currentRoomId);
        console.log(`Room ${currentRoomId} is now empty after disconnect`);
      }
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

  // Code execution
  socket.on('compileCode', async ({ code, language, input, roomId }) => {
    if (!code || !language || !roomId) {
      console.log('Code execution rejected: missing parameters');
      return;
    }

    console.log(`Executing ${language} code in room ${roomId}`);
    console.log('Code snippet:', code.substring(0, 100) + '...');
    
    try {
      // Map language names to Piston API language IDs
      const languageMap = {
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c++': 'cpp',
        'c': 'c',
        'typescript': 'typescript',
        'go': 'go',
        'rust': 'rust',
        'ruby': 'ruby',
        'php': 'php',
      };

      const pistonLanguage = languageMap[language.toLowerCase()] || 'javascript';
      
      // Prepare files array - Java needs a filename
      let files = [];
      if (pistonLanguage === 'java') {
        // Extract class name from code or default to Main
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : 'Main';
        files = [{
          name: `${className}.java`,
          content: code
        }];
        console.log(`Java file prepared: ${className}.java`);
      } else {
        files = [{
          content: code
        }];
      }
      
      const requestBody = {
        language: pistonLanguage,
        version: '*',
        files: files,
        stdin: input || '',
      };
      
      console.log('Sending request to Piston API:', JSON.stringify(requestBody, null, 2));
      
      // Execute code using Piston API (free, no API key needed)
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', requestBody, {
        timeout: 15000, // 15 second timeout for compilation
      });

      console.log('Piston API full response:', JSON.stringify(response.data, null, 2));

      // Check response structure
      const compileOutput = response.data.compile || {};
      const runOutput = response.data.run || {};
      
      console.log('Compile output:', compileOutput);
      console.log('Run output:', runOutput);

      // Handle compilation errors
      if (compileOutput.stderr) {
        console.log(`Compilation error for room ${roomId}:`, compileOutput.stderr);
        io.to(roomId).emit('codeResponse', {
          run: {
            output: `Compilation Error:\n${compileOutput.stderr}`,
            exitCode: compileOutput.code || 1,
          }
        });
        return;
      }

      // Get output from multiple possible locations
      let output = '';
      if (runOutput.stdout) {
        output = runOutput.stdout;
      } else if (runOutput.stderr) {
        output = runOutput.stderr;
      } else if (runOutput.output) {
        output = runOutput.output;
      } else if (compileOutput.stdout) {
        output = compileOutput.stdout;
      } else {
        output = 'No output received from execution';
      }

      const exitCode = runOutput.code !== undefined ? runOutput.code : (compileOutput.code !== undefined ? compileOutput.code : 0);

      console.log(`Code execution result for room ${roomId}:`, {
        exitCode: exitCode,
        hasOutput: !!output,
        outputLength: output?.length || 0,
        outputPreview: output.substring(0, 100)
      });
      
      // Emit result back to the room
      io.to(roomId).emit('codeResponse', {
        run: {
          output: output.trim() || 'Code executed but produced no visible output.',
          exitCode: exitCode,
        }
      });
    } catch (error) {
      console.error('Code execution error:', error.message);
      console.error('Error details:', error.response?.data || error.stack);
      
      // Emit error to the room
      io.to(roomId).emit('codeResponse', {
        run: {
          output: `Execution Error: ${error.message || 'Failed to execute code. Please try again.'}\n${error.response?.data ? JSON.stringify(error.response.data) : ''}`,
          exitCode: 1,
        }
      });
    }
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


