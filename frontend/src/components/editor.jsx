import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL);

const EditorComponent = ({ user }) => {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
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
  const editorRef = useState(null)[0];
  const decorationsRef = useState({})[0]; // userName -> decorationIds
  const userColorsRef = useState({})[0];
  const [userInput, setUserInput] = useState("");
  const [role, setRole] = useState("editor"); // viewer disables edits

  // simple multi-file tabs
  const [files, setFiles] = useState([
    { id: "main", name: "main.js", language: "javascript", content: "// start code here" },
  ]);
  const [activeFileId, setActiveFileId] = useState("main");
  const activeFile = useMemo(() => files.find(f => f.id === activeFileId) || files[0], [files, activeFileId]);
  const [recentFiles, setRecentFiles] = useState(["main"]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Check for saved room on mount
  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const r = params.get('role');
    if (r === 'viewer' || r === 'editor') setRole(r);

    const savedRoomId = sessionStorage.getItem('roomId');
    const savedUserName = sessionStorage.getItem('userName');

    // Verify saved username matches current user
    if (savedRoomId && savedUserName === user.name) {
      setRoomId(savedRoomId);
      socket.emit("join", { roomId: savedRoomId, userName: user.name });
      setJoined(true);
    }
  }, [user]);

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
      setLogs((l) => [{ type: 'info', message: `Users online: ${users.length}`, timestamp: Date.now() }, ...l]);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (userName) => {
      setTyping(`${userName.slice(0, 15)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
    });

    socket.on("chatMessage", (msg) => {
      setChat((c) => [...c, msg]);
    });

    socket.on("chatTyping", ({ userName }) => {
      setTyping(`${userName.slice(0, 15)}... is Typing`);
      setTimeout(() => setTyping(""), 1500);
    });

    socket.on("sessionLog", (entry) => {
      setLogs((l) => [entry, ...l].slice(0, 100));
    });

    socket.on("cursorUpdate", ({ userName, position }) => {
      try {
        if (!editorRef) return;
        const monaco = editorRef._standaloneKeybindingService ? window.monaco : null;
        const model = editorRef.getModel();
        if (!model) return;
        if (!userColorsRef[userName]) {
          userColorsRef[userName] = `hsl(${Math.floor(Math.random()*360)} 70% 60%)`;
        }
        const color = userColorsRef[userName];
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
        const prev = decorationsRef[userName] || [];
        const next = editorRef.deltaDecorations(prev, deco);
        decorationsRef[userName] = next;
      } catch {}
    });

    socket.on("selectionUpdate", ({ userName, selection }) => {
      try {
        if (!editorRef) return;
        if (!userColorsRef[userName]) {
          userColorsRef[userName] = `hsl(${Math.floor(Math.random()*360)} 70% 60%)`;
        }
        const color = userColorsRef[userName];
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        };
        const deco = [{ range, options: { className: '', inlineClassName: '', isWholeLine: false, overviewRuler: { color, position: 4 } } }];
        const prev = decorationsRef[userName] || [];
        const next = editorRef.deltaDecorations(prev, deco);
        decorationsRef[userName] = next;
      } catch {}
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("chatMessage");
      socket.off("chatTyping");
      socket.off("sessionLog");
      socket.off("cursorUpdate");
      socket.off("selectionUpdate");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && user) {
      socket.emit("join", { roomId, userName: user.name });
      setJoined(true);
      sessionStorage.setItem('roomId', roomId);
      sessionStorage.setItem('userName', user.name);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
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
    if (role === 'viewer') return;
    setCode(newCode);
    setFiles((fs) => fs.map(f => f.id === activeFileId ? { ...f, content: newCode, language } : f));
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName: user.name });
  };

  const handleEditorMount = (editor) => {
    // store ref
    // eslint-disable-next-line no-unused-expressions
    (editorRef = editor);
    editor.onDidChangeCursorPosition((e) => {
      socket.emit('cursorMove', { roomId, userName: user.name, position: e.position });
    });
    editor.onDidChangeCursorSelection((e) => {
      const s = e.selection;
      socket.emit('selectionChange', { roomId, userName: user.name, selection: {
        startLineNumber: s.startLineNumber,
        startColumn: s.startColumn,
        endLineNumber: s.endLineNumber,
        endColumn: s.endColumn,
      }});
    });
  };

  const sendChat = () => {
    const message = chatInput.trim();
    if (!message) return;
    socket.emit('chatMessage', { roomId, userName: user.name, message });
    setChatInput('');
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    if (role === 'viewer') return;
    socket.emit("compileCode", {
      code,
      roomId,
      language,
      version,
      input: userInput,
    });
    socket.emit('runExecuted', { roomId, userName: user.name });
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
    if (!isNaN(n) && editorRef) {
      editorRef.revealLineInCenter(n);
      editorRef.setPosition({ lineNumber: n, column: 1 });
      editorRef.focus();
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
            Welcome, {user.name}!
          </p>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={createRoomId}>Create New Room</button>
          <button onClick={joinRoom} disabled={!roomId}>
            Join Room
          </button>
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
            {user.name}
          </p>
          <div style={{ marginTop: 6, color: '#bdc3c7' }}>Role: <strong>{role}</strong></div>
        </div>

        <h3>Users in Room ({users.length}):</h3>
        <ul>
          {users.map((userName, index) => (
            <li key={index}>
              {userName}
              {userName === user.name && (
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

      <div className="editor-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          height={"60%"}
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
              {chat.map((m, idx) => (
                <div key={idx} style={{ marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#66c2ff' }}>{m.userName}</span>
                  <span style={{ color: '#7f8c8d', marginLeft: 6 }}>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  <div>{m.message}</div>
                </div>
              ))}
              {chat.length === 0 && <div style={{ color: '#7f8c8d', fontSize: 12 }}>No messages yet</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); else socket.emit('chatTyping', { roomId, userName: user.name }); }} placeholder="Type a message..." style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#ecf0f1' }} />
              <button onClick={sendChat} className="copy-button">Send</button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <h4 style={{ margin: 0, color: '#ecf0f1' }}>Session Logs</h4>
            <div style={{ height: 180, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, background: 'rgba(255,255,255,0.05)' }}>
              {logs.map((e, idx) => (
                <div key={idx} style={{ fontSize: 12, marginBottom: 4, color: '#bdc3c7' }}>
                  <span style={{ color: '#7f8c8d' }}>[{new Date(e.timestamp || Date.now()).toLocaleTimeString()}]</span>
                  <span style={{ marginLeft: 6 }}>
                    {e.type === 'run' && `${e.user} executed code`}
                    {e.type === 'chat' && `${e.user}: ${e.message}`}
                    {e.type === 'leave' && `${e.user} left the room`}
                    {!e.type && e.message}
                  </span>
                </div>
              ))}
              {logs.length === 0 && <div style={{ color: '#7f8c8d' }}>No activity yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;