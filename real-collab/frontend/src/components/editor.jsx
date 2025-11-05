import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5001";

const EditorComponent = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState([]); // {userName, message, timestamp}
  const [logs, setLogs] = useState([]); // session logs
  const editorRef = useRef(null);
  const decorationsRef = useRef({}); // userName -> decorationIds
  const userColorsRef = useRef({});
  const chatUserColorsRef = useRef({}); // userName -> chat color
  const [userInput, setUserInput] = useState("");
  const [role, setRole] = useState("editor"); // viewer disables edits
  // Use user's login name directly, no editing allowed
  const name = user?.name || "";

  // simple multi-file tabs
  const [files, setFiles] = useState([
    { id: "main", name: "main.js", language: "javascript", content: "// start code here" },
  ]);
  const [activeFileId, setActiveFileId] = useState("main");
  const activeFile = useMemo(() => files.find(f => f.id === activeFileId) || files[0], [files, activeFileId]);
  const [recentFiles, setRecentFiles] = useState(["main"]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Register event listeners immediately
    const handleUserJoined = (users) => {
      console.log('User joined event received:', users);
      if (Array.isArray(users)) {
        setUsers(users);
        
        // Add log entry for each user joining
        const currentUserList = users;
        setLogs((l) => {
          const newLog = { 
            type: 'info', 
            message: `Users in room: ${currentUserList.join(', ')} (${currentUserList.length} total)`, 
            timestamp: Date.now() 
          };
          return [newLog, ...l];
        });
      } else {
        console.error('Invalid users data received:', users);
      }
    };

    const handleChatMessage = (msg) => {
      console.log('Chat message received:', msg);
      setChat((c) => [...c, msg]);
    };

    const handleSessionLog = (entry) => {
      console.log('Session log received:', entry);
      setLogs((l) => [entry, ...l].slice(0, 100));
    };

    newSocket.on('userJoined', handleUserJoined);
    newSocket.on('chatMessage', handleChatMessage);
    newSocket.on('sessionLog', handleSessionLog);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      
      // Rejoin room if we were in one
      const savedRoomId = sessionStorage.getItem('roomId');
      const savedUserName = sessionStorage.getItem('userName');
      if (savedRoomId && savedUserName && user && savedUserName === user.name) {
        console.log('Rejoining room after reconnection:', savedRoomId);
        newSocket.emit("join", { roomId: savedRoomId, userName: user.name });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('userJoined', handleUserJoined);
      newSocket.off('chatMessage', handleChatMessage);
      newSocket.off('sessionLog', handleSessionLog);
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.close();
    };
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Check for saved room on mount
  useEffect(() => {
    if (!user || !socket) return;

    const params = new URLSearchParams(window.location.search);
    const r = params.get('role');
    if (r === 'viewer' || r === 'editor') setRole(r);

    const savedRoomId = sessionStorage.getItem('roomId');
    const savedUserName = sessionStorage.getItem('userName');

    // Verify saved username matches current user
    if (savedRoomId && savedUserName === user.name) {
      console.log('Restoring saved room:', savedRoomId);
      setRoomId(savedRoomId);
      
      // Wait for socket connection before joining
      const tryJoin = () => {
        if (socket.connected) {
          setJoined(true);
          socket.emit("join", { roomId: savedRoomId, userName: user.name });
          console.log('Rejoined saved room:', savedRoomId);
        } else {
          socket.once('connect', tryJoin);
        }
      };
      tryJoin();
    }
  }, [user, socket]);

  useEffect(() => {
    if (!socket) return;

    // Note: handleUserJoined is registered in socket initialization useEffect above
    
    const handleCodeUpdate = (newCode) => {
      setCode(newCode);
    };

    const handleUserTyping = (userName) => {
      setTyping(`${userName.slice(0, 15)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    };

    const handleLanguageUpdate = (newLanguage) => {
      setLanguage(newLanguage);
    };

    const handleCodeResponse = (response) => {
      console.log('Code execution response:', response);
      if (response && response.run) {
        const output = response.run.output || 'No output';
        setOutPut(output);
        console.log('Output set to:', output);
      } else {
        setOutPut('Error: Invalid response from server');
        console.error('Invalid response structure:', response);
      }
    };

    // Note: handleChatMessage and handleSessionLog are registered in socket initialization useEffect above
    
    const handleChatTyping = ({ userName }) => {
      setTyping(`${userName.slice(0, 15)}... is Typing`);
      setTimeout(() => setTyping(""), 1500);
    };

    const handleCursorUpdate = ({ userName, position }) => {
      try {
        if (!editorRef.current) return;
        const monaco = editorRef.current._standaloneKeybindingService ? window.monaco : null;
        const model = editorRef.current.getModel();
        if (!model) return;
        if (!userColorsRef.current[userName]) {
          userColorsRef.current[userName] = `hsl(${Math.floor(Math.random()*360)} 70% 60%)`;
        }
        const color = userColorsRef.current[userName];
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
        };
        const options = {
          className: '',
          isWholeLine: false,
          inlineClassName: '',
          overviewRuler: { color, position: 4 },
          afterContentClassName: '',
        };
        const deco = [{ range, options: { inlineClassName: '', className: '', overviewRuler: { color, position: 4 } } }];
        const prev = decorationsRef.current[userName] || [];
        const next = editorRef.current.deltaDecorations(prev, deco);
        decorationsRef.current[userName] = next;
      } catch {}
    };

    const handleSelectionUpdate = ({ userName, selection }) => {
      try {
        if (!editorRef.current) return;
        if (!userColorsRef.current[userName]) {
          userColorsRef.current[userName] = `hsl(${Math.floor(Math.random()*360)} 70% 60%)`;
        }
        const color = userColorsRef.current[userName];
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        };
        const deco = [{ range, options: { className: '', inlineClassName: '', isWholeLine: false, overviewRuler: { color, position: 4 } } }];
        const prev = decorationsRef.current[userName] || [];
        const next = editorRef.current.deltaDecorations(prev, deco);
        decorationsRef.current[userName] = next;
      } catch {}
    };

    // userJoined, chatMessage, and sessionLog are registered in socket initialization useEffect above
    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("userTyping", handleUserTyping);
    socket.on("languageUpdate", handleLanguageUpdate);
    socket.on("codeResponse", handleCodeResponse);
    socket.on("chatTyping", handleChatTyping);
    socket.on("cursorUpdate", handleCursorUpdate);
    socket.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      // userJoined, chatMessage, and sessionLog are cleaned up in socket initialization useEffect
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("userTyping", handleUserTyping);
      socket.off("languageUpdate", handleLanguageUpdate);
      socket.off("codeResponse", handleCodeResponse);
      socket.off("chatTyping", handleChatTyping);
      socket.off("cursorUpdate", handleCursorUpdate);
      socket.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [socket]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket) {
        socket.emit("leaveRoom");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket]);

  const joinRoom = () => {
    const effectiveName = (user?.name || "").trim();
    
    if (!roomId || !roomId.trim()) {
      alert('Please enter a room ID or create a new room');
      return;
    }
    
    if (!effectiveName || !user) {
      alert('User information is missing. Please log in again.');
      return;
    }
    
    if (!socket) {
      alert('Socket not initialized. Please wait and try again.');
      return;
    }
    
    console.log('Attempting to join room:', roomId, 'as user:', effectiveName, 'Socket connected:', socket.connected);
    
    // Wait for socket to be connected
    if (!socket.connected) {
      console.log('Waiting for socket connection...');
      let timeoutId = null;
      
      const connectHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        console.log('Socket connected, joining room now');
        // Retry joining after connection
        setTimeout(() => {
          joinRoom();
        }, 100);
      };
      
      timeoutId = setTimeout(() => {
        socket.off('connect', connectHandler);
        alert('Connection timeout. Please check your internet connection and try again.');
      }, 10000); // 10 second timeout
      
      socket.once('connect', connectHandler);
      
      // Also handle connection errors
      const errorHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        socket.off('connect', connectHandler);
        alert('Failed to connect to server. Please check your internet connection.');
      };
      
      socket.once('connect_error', errorHandler);
      
      return;
    }
    
    // Set joined immediately to show UI
    setJoined(true);
    sessionStorage.setItem('roomId', roomId.trim());
    sessionStorage.setItem('userName', effectiveName);
    
    // Emit join - socket is connected
    try {
      socket.emit("join", { roomId: roomId.trim(), userName: effectiveName });
      console.log('Join event emitted for room:', roomId.trim());
    } catch (error) {
      console.error('Error emitting join event:', error);
      setJoined(false);
      alert('Failed to join room. Please try again.');
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit("leaveRoom");
    }
    setJoined(false);
    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('userName');
    navigate('/');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    if (role === 'viewer' || !socket) return;
    setCode(newCode);
    setFiles((fs) => fs.map(f => f.id === activeFileId ? { ...f, content: newCode, language } : f));
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName: user?.name || '' });
  };

  const handleEditorMount = (editor) => {
    // store ref
    editorRef.current = editor;
    if (!socket) return;
    
    editor.onDidChangeCursorPosition((e) => {
      if (socket) {
        socket.emit('cursorMove', { roomId, userName: user?.name || '', position: e.position });
      }
    });
    editor.onDidChangeCursorSelection((e) => {
      if (!socket) return;
      const s = e.selection;
      socket.emit('selectionChange', { roomId, userName: user?.name || '', selection: {
        startLineNumber: s.startLineNumber,
        startColumn: s.startColumn,
        endLineNumber: s.endLineNumber,
        endColumn: s.endColumn,
      }});
    });
  };

  // Get consistent color for a user (for chat)
  const getUserChatColor = (userName) => {
    if (!chatUserColorsRef.current[userName]) {
      // Generate a color based on username hash for consistency
      let hash = 0;
      for (let i = 0; i < userName.length; i++) {
        hash = userName.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Generate bright, vibrant colors
      const hue = Math.abs(hash) % 360;
      chatUserColorsRef.current[userName] = `hsl(${hue}, 70%, 65%)`;
    }
    return chatUserColorsRef.current[userName];
  };

  const sendChat = () => {
    const message = chatInput.trim();
    if (!message || !socket) return;
    socket.emit('chatMessage', { roomId, userName: user?.name || '', message });
    setChatInput('');
  };

  // Sample code templates for each language - Simple versions that work
  const getSampleCode = (lang) => {
    const samples = {
      javascript: `// Simple JavaScript Example
console.log("Hello, World!");
console.log("2 + 3 =", 2 + 3);
console.log("Code executed successfully!");`,

      python: `# Simple Python Example
print("Hello, World!")
print("2 + 3 =", 2 + 3)
print("Code executed successfully!")`,

      java: `// Simple Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("2 + 3 = " + (2 + 3));
        System.out.println("Code executed successfully!");
    }
}`,

      cpp: `// Simple C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "2 + 3 = " << (2 + 3) << endl;
    cout << "Code executed successfully!" << endl;
    return 0;
}`,

      c: `// Simple C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("2 + 3 = %d\\n", 2 + 3);
    printf("Code executed successfully!\\n");
    return 0;
}`,

      typescript: `// Simple TypeScript Example
console.log("Hello, World!");
console.log("2 + 3 =", 2 + 3);
console.log("Code executed successfully!");`,

      go: `// Simple Go Example
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("2 + 3 =", 2 + 3)
    fmt.Println("Code executed successfully!")
}`,

      rust: `// Simple Rust Example
fn main() {
    println!("Hello, World!");
    println!("2 + 3 = {}", 2 + 3);
    println!("Code executed successfully!");
}`,

      ruby: `# Simple Ruby Example
puts "Hello, World!"
puts "2 + 3 = #{2 + 3}"
puts "Code executed successfully!"`,

      php: `<?php
// Simple PHP Example
echo "Hello, World!" . PHP_EOL;
echo "2 + 3 = " . (2 + 3) . PHP_EOL;
echo "Code executed successfully!" . PHP_EOL;
?>`,
    };
    
    return samples[lang] || samples.javascript;
  };

  const loadSampleCode = () => {
    if (role === 'viewer') {
      alert('Viewers cannot load sample code');
      return;
    }
    
    const sampleCode = getSampleCode(language);
    setCode(sampleCode);
    
    // Update the active file
    setFiles((fs) => fs.map(f => 
      f.id === activeFileId 
        ? { ...f, content: sampleCode, language } 
        : f
    ));
    
    // Emit code change to sync with other users
    if (socket && roomId) {
      socket.emit("codeChange", { roomId, code: sampleCode });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (socket) {
      socket.emit("languageChange", { roomId, language: newLanguage });
    }
  };

  const runCode = () => {
    if (role === 'viewer') {
      alert('Viewers cannot execute code');
      return;
    }
    
    if (!socket) {
      alert('Not connected to server. Please wait for connection...');
      return;
    }
    
    if (!socket.connected) {
      alert('Socket not connected. Please wait for connection to establish...');
      // Try to wait for connection
      socket.once('connect', () => {
        runCode();
      });
      return;
    }

    if (!roomId) {
      alert('Please join a room first');
      return;
    }

    if (!code || code.trim() === '') {
      alert('Please write some code first');
      return;
    }

    console.log('Executing code:', { 
      language, 
      roomId, 
      codeLength: code.length,
      codePreview: code.substring(0, 100),
      socketConnected: socket.connected
    });
    setOutPut('Executing...');
    
    try {
      socket.emit("compileCode", {
        code,
        roomId,
        language,
        version,
        input: userInput,
      });
      socket.emit('runExecuted', { roomId, userName: user?.name || '' });
    } catch (error) {
      console.error('Error emitting compileCode:', error);
      setOutPut('Error: Failed to send code execution request');
    }
  };

  // Tabs helpers
  const newFile = () => {
    const id = Math.random().toString(36).slice(2, 9);
    const name = prompt('New file name:', `file-${files.length + 1}.js`);
    if (!name) return;
    const lang = name.endsWith('.py') ? 'python' : name.endsWith('.java') ? 'java' : (name.endsWith('.cpp')||name.endsWith('.cc')) ? 'cpp' : 'javascript';
    const f = { id, name, language: lang, content: '' };
    setFiles((fs) => [...fs, f]);
    setActiveFileId(id);
    setLanguage(lang);
    setCode('');
    setRecentFiles((r) => [id, ...r.filter(x => x !== id)].slice(0, 10));
  };

  const openFile = (id) => {
    setActiveFileId(id);
    const f = files.find(x => x.id === id);
    if (f) {
      setLanguage(f.language);
      setCode(f.content);
      setRecentFiles((r) => [id, ...r.filter(x => x !== id)].slice(0, 10));
    }
  };

  const closeFile = (id) => {
    if (files.length === 1) return;
    setFiles((fs) => fs.filter(f => f.id !== id));
    if (activeFileId === id) {
      const next = files.find(f => f.id !== id) || files[0];
      setActiveFileId(next.id);
      setLanguage(next.language);
      setCode(next.content);
    }
    setRecentFiles((r) => r.filter(x => x !== id));
  };

  const goToLine = () => {
    const n = parseInt(prompt('Go to line:') || '');
    if (!isNaN(n) && editorRef.current) {
      editorRef.current.revealLineInCenter(n);
      editorRef.current.setPosition({ lineNumber: n, column: 1 });
      editorRef.current.focus();
    }
  };

  const createRoomId = () => {
    const newRoomId = 'room-' + Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  // Show loading if user is not available yet
  if (!user) {
    return null;
  }

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Join as {user?.name || 'User'}
          </p>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Your Name</label>
            <div style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>{user?.name || 'User'}</div>
          </div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && roomId && socket) {
                joinRoom();
              }
            }}
            style={{ marginBottom: '0.5rem' }}
          />
          <button onClick={createRoomId} style={{ marginBottom: '0.5rem' }}>Create New Room</button>
          <button 
            onClick={joinRoom} 
            disabled={!roomId || !roomId.trim() || !user}
            style={{
              opacity: (!roomId || !roomId.trim() || !user) ? 0.5 : 1,
              cursor: (!roomId || !roomId.trim() || !user) ? 'not-allowed' : 'pointer'
            }}
          >
            {socket && socket.connected ? 'Join Room' : socket ? 'Connecting...' : 'Initializing...'}
          </button>
          {socket && !socket.connected && (
            <p style={{ color: '#ffa500', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Waiting for server connection...
            </p>
          )}
          {!socket && (
            <p style={{ color: '#ffa500', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Initializing connection...
            </p>
          )}
          <button 
            onClick={() => navigate('/')}
            style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Room ID
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        
        <div style={{
          padding: '0.75rem',
          background: 'rgba(52, 152, 219, 0.1)',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid rgba(52, 152, 219, 0.3)'
        }}>
          <p style={{ 
            color: '#3498db', 
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.25rem'
          }}>
            Logged in as:
          </p>
          <p style={{ 
            color: '#ecf0f1', 
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            {user?.name || 'User'}
          </p>
          <div style={{ marginTop: 6, color: '#bdc3c7' }}>Role: <strong>{role}</strong></div>
        </div>

        <h3>Users in Room ({users.length}):</h3>
        <ul>
          {users.map((userName, index) => (
            <li key={index}>
              {userName}
              {userName === (user?.name || '') && (
                <span style={{ 
                  marginLeft: '0.5rem', 
                  color: '#2ecc71',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  (You)
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>
        <div style={{ margin: '10px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="copy-button" onClick={newFile}>New Tab</button>
          <button className="copy-button" onClick={goToLine}>Go to line</button>
          <button className="copy-button" onClick={() => { const url = `${window.location.origin}/editor?role=viewer`; navigator.clipboard.writeText(url); alert('Viewer invite link copied'); }}>Copy Viewer Link</button>
          <button className="copy-button" onClick={() => { const url = `${window.location.origin}/editor?role=editor`; navigator.clipboard.writeText(url); alert('Editor invite link copied'); }}>Copy Editor Link</button>
        </div>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button 
          className="copy-button" 
          onClick={loadSampleCode}
          style={{ marginTop: '0.75rem', width: '100%' }}
          title="Load sample code for the selected language"
        >
          📝 Load Sample Code
        </button>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>

        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: 0, color: '#ecf0f1' }}>Recent</h4>
          <ul>
            {recentFiles.map((id) => {
              const f = files.find(x => x.id === id);
              if (!f) return null;
              return (
                <li key={id} style={{ cursor: 'pointer' }} onClick={() => openFile(id)}>{f.name}</li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="editor-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#bdc3c7', fontSize: 12 }}>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="language-selector">
              <option value="vs-dark">Dark</option>
              <option value="light">Light</option>
            </select>
            <label style={{ color: '#bdc3c7', fontSize: 12 }}>Font</label>
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="language-selector">
              {[12,13,14,15,16,18].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>

          {/* Tabs bar */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 6, marginBottom: 6, overflowX: 'auto' }}>
            {files.map((f) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, background: f.id===activeFileId?'rgba(255,255,255,0.1)':'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }} onClick={() => openFile(f.id)}>
                <span>{f.name}</span>
                {files.length>1 && (
                  <button className="copy-button" style={{ padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); closeFile(f.id); }}>x</button>
                )}
              </div>
            ))}
          </div>
        <Editor
          height={"500px"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme={theme}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
          }}
        />
        <textarea
          className="input-console"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter input here..."
        />
        <button className="run-btn" onClick={runCode}>
          Execute Code
        </button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output will appear here..."
        />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <h4 style={{ margin: 0, color: '#ecf0f1' }}>Chat</h4>
            <div style={{ height: 180, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, background: 'rgba(255,255,255,0.05)' }}>
              {chat.map((m, idx) => {
                const userColor = getUserChatColor(m.userName);
                const messageColor = `hsl(${userColor.match(/\d+/)?.[0] || 200}, 70%, 75%)`;
                return (
                  <div key={idx} style={{ marginBottom: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ 
                        color: userColor, 
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        {m.userName}
                      </span>
                      <span style={{ color: '#7f8c8d', fontSize: '11px' }}>
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ 
                      color: messageColor, 
                      marginLeft: 4,
                      wordWrap: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {m.message}
                    </div>
                  </div>
                );
              })}
              {chat.length === 0 && <div style={{ color: '#7f8c8d', fontSize: 12 }}>No messages yet</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); else if (socket) socket.emit('chatTyping', { roomId, userName: user?.name || '' }); }} placeholder="Type a message..." style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#ecf0f1' }} />
              <button onClick={sendChat} className="copy-button">Send</button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <h4 style={{ margin: 0, color: '#ecf0f1' }}>Session Logs</h4>
            <div style={{ height: 180, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, background: 'rgba(255,255,255,0.05)' }}>
              {logs.map((e, idx) => {
                const logUserColor = e.user ? getUserChatColor(e.user) : '#bdc3c7';
                return (
                  <div key={idx} style={{ fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#7f8c8d' }}>[{new Date(e.timestamp || Date.now()).toLocaleTimeString()}]</span>
                    <span style={{ marginLeft: 6 }}>
                      {e.type === 'run' && (
                        <span style={{ color: '#bdc3c7' }}>
                          <span style={{ color: logUserColor, fontWeight: '600' }}>{e.user}</span> executed code
                        </span>
                      )}
                      {e.type === 'chat' && (
                        <span>
                          <span style={{ color: logUserColor, fontWeight: '600' }}>{e.user}</span>
                          <span style={{ color: '#bdc3c7' }}>: {e.message}</span>
                        </span>
                      )}
                      {e.type === 'leave' && (
                        <span style={{ color: '#bdc3c7' }}>
                          <span style={{ color: logUserColor, fontWeight: '600' }}>{e.user}</span> left the room
                        </span>
                      )}
                      {!e.type && <span style={{ color: '#bdc3c7' }}>{e.message}</span>}
                    </span>
                  </div>
                );
              })}
              {logs.length === 0 && <div style={{ color: '#7f8c8d' }}>No activity yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;