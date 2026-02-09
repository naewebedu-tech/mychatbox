import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, MessageCircle, Trash2, Lock, Unlock, User, Users, 
  XCircle, Clock, Fingerprint, Check, Eye, Reply, X, LogOut, Key
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  getDocs,
  doc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBsdPXnfvUy78GjvS8Fq6R38iVVhlYuNtI",
  authDomain: "pvtbox-8f03a.firebaseapp.com",
  projectId: "pvtbox-8f03a",
  storageBucket: "pvtbox-8f03a.firebasestorage.app",
  messagingSenderId: "278360357776",
  appId: "1:278360357776:web:864c6443f5df751063d115",
  measurementId: "G-M4H1G18EFB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER: COLORS ---
const getNameColor = (name) => {
  const colors = [
    'text-red-600', 'text-orange-600', 'text-amber-600', 
    'text-green-600', 'text-emerald-600', 'text-teal-600', 
    'text-cyan-600', 'text-blue-600', 'text-indigo-600', 
    'text-violet-600', 'text-purple-600', 'text-fuchsia-600', 'text-pink-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function App() {
  // Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  // App User State (The Chat Identity)
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Data State
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // UI State
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Login Form State
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const dummy = useRef();
  const typingTimeoutRef = useRef(null);

  // 1. INITIALIZATION
  useEffect(() => {
    // Authenticate with Firebase for database access
    // Added Fallback: If auth fails (e.g. config error), create a local fallback user so app still works
    signInAnonymously(auth)
      .catch((err) => {
        console.warn("Auth failed, falling back to guest mode:", err);
        setFirebaseUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9) });
      });

    onAuthStateChanged(auth, (u) => { 
      if(u) setFirebaseUser(u); 
    });

    // Check Local Storage for persistent login
    const savedUser = localStorage.getItem('chat_app_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUsername(parsed.username);
      setIsLoggedIn(true);
    }

    // 2. MESSAGES LISTENER
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubMsg = onSnapshot(q, (snapshot) => {
      const loadedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(loadedMsgs);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // Auto-read logic
      if (isLoggedIn && username) {
        snapshot.docs.forEach((docSnapshot) => {
            const msgData = docSnapshot.data();
            // If message is not from me
            if (msgData.senderName !== username) {
                const alreadyRead = msgData.readBy?.some(reader => reader.name === username);
                if (!alreadyRead) {
                    updateDoc(docSnapshot.ref, {
                        readBy: arrayUnion({ name: username, readAt: Date.now() })
                    }).catch(err => console.log("Read receipt error:", err));
                }
            }
        });
      }
    });

    // 3. TYPING STATUS LISTENER
    const unsubTyping = onSnapshot(collection(db, "typing"), (snapshot) => {
      const now = Date.now();
      const activeTypers = [];
      snapshot.forEach(doc => {
        if (doc.id !== username) { // Don't show myself
          const data = doc.data();
          if (now - data.timestamp < 3000) activeTypers.push(data.displayName);
        }
      });
      setTypingUsers(activeTypers);
    });

    return () => { unsubMsg(); unsubTyping(); };
  }, [username, isLoggedIn]);

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    const cleanName = loginName.trim();
    const cleanPass = loginPass.trim();

    if (!cleanName || !cleanPass) {
      setLoginError("Please enter both name and password.");
      return;
    }

    try {
      // Check if user exists in our custom 'users' collection
      const userDocRef = doc(db, "chat_users", cleanName.toLowerCase());
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User exists, check password
        const userData = userDoc.data();
        if (userData.password === cleanPass) {
          // Success: Login
          completeLogin(cleanName);
        } else {
          setLoginError("Incorrect password for this user.");
        }
      } else {
        // User doesn't exist, Create new account
        await setDoc(userDocRef, {
          username: cleanName,
          password: cleanPass, // In a real app, hash this!
          createdAt: serverTimestamp()
        });
        completeLogin(cleanName);
      }
    } catch (err) {
      console.error(err);
      setLoginError("Connection error. Try again.");
    }
  };

  const completeLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem('chat_app_user', JSON.stringify({ username: name }));
    setLoginName("");
    setLoginPass("");
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_app_user');
    setIsLoggedIn(false);
    setUsername("");
  };

  // --- MESSAGING LOGIC ---
  const getMessageTime = (createdAt) => {
    if (!createdAt) return "Sending...";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isLoggedIn || !username) return;

    setDoc(doc(db, "typing", username), { displayName: username, timestamp: Date.now() });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { deleteDoc(doc(db, "typing", username)); }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !firebaseUser || !isLoggedIn) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    deleteDoc(doc(db, "typing", username));

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderName: username, // The unique ID for this message
        displayName: username,
        // Unique Avatar based on username
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
        readBy: [],
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          displayName: replyingTo.displayName
        } : null
      });
      setNewMessage("");
      setReplyingTo(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (isAdmin && confirm("Delete message?")) {
      try { await deleteDoc(doc(db, "messages", id)); } catch (e) {}
    }
  };

  const clearChat = async () => {
    if (!isAdmin) return;
    if (confirm("⚠️ Clear ALL messages?")) {
      const q = query(collection(db, "messages"));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => deleteDoc(doc.ref));
    }
  };

  const toggleAdmin = () => {
    if (isAdmin) setIsAdmin(false);
    else if (prompt("Admin Password:") === "admin123") setIsAdmin(true);
    else alert("Wrong password");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-blue-200 shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-none">Global Chat</h1>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
              <Key size={12} className="inline mr-1" />
              {isLoggedIn ? `Logged in as ${username}` : 'Waiting for login...'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {isLoggedIn && (
            <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50" title="Logout">
              <LogOut size={20}/>
            </button>
          )}
          {isAdmin && (
            <button onClick={clearChat} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 mr-1" title="Clear All Messages">
                <Trash2 size={20} />
            </button>
          )}
          <button onClick={toggleAdmin} className={`p-2 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
            {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.senderName === username;
          const readCount = msg.readBy ? msg.readBy.length : 0;
          const readNames = msg.readBy ? msg.readBy.map(r => r.name).join(", ") : "";
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group/message`}>
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[60%]`}>
                
                {/* Name Label */}
                {!isMe && (
                  <span className={`text-[11px] font-bold ml-12 mb-1 ${getNameColor(msg.displayName || 'Anonymous')}`}>
                    {msg.displayName || "Anonymous"}
                  </span>
                )}

                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <img 
                    src={msg.photoURL} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 shadow-sm mb-1 object-cover"
                  />
                  
                  <div className="relative">
                    {/* REPLY BUTTON */}
                    {isLoggedIn && (
                      <button 
                        onClick={() => setReplyingTo(msg)}
                        className={`
                          absolute top-1/2 -translate-y-1/2 
                          ${isMe ? '-left-10' : '-right-10'}
                          p-2 bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover/message:opacity-100 transition-opacity z-10
                        `}
                        title="Reply"
                      >
                        <Reply size={16} />
                      </button>
                    )}

                    {/* Admin Delete */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 opacity-0 group-hover/message:opacity-100 transition-opacity`}
                      >
                        <XCircle size={16} />
                      </button>
                    )}

                    {/* Message Bubble */}
                    <div className={`
                      px-5 py-3 shadow-sm text-[15px] leading-relaxed break-words relative
                      ${isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none'
                      }
                    `}>
                      {/* QUOTED MESSAGE */}
                      {msg.replyTo && (
                        <div className={`
                          mb-2 text-xs border-l-4 pl-2 py-1 rounded-r opacity-90
                          ${isMe ? 'border-blue-300 bg-blue-700/50 text-blue-100' : 'border-blue-500 bg-gray-100 text-gray-500'}
                        `}>
                          <p className="font-bold opacity-100 mb-0.5">{msg.replyTo.displayName}</p>
                          <p className="truncate opacity-80">{msg.replyTo.text}</p>
                        </div>
                      )}

                      {msg.text}
                    </div>
                    
                    {/* INFO ROW */}
                    <div className={`flex items-center gap-1.5 mt-1 text-[10px] opacity-60 font-medium ${isMe ? 'flex-row-reverse text-gray-500' : 'flex-row text-gray-400'}`}>
                        <span>{getMessageTime(msg.createdAt)}</span>
                        {isMe && (
                            <div className="flex items-center gap-1" title={readCount > 0 ? `Read by: ${readNames}` : "Sent"}>
                                {readCount > 0 ? (
                                    <>
                                        <span className="text-blue-500 font-bold">{readCount > 2 ? `${readCount} read` : readNames}</span>
                                        <Eye size={12} className="text-blue-500"/>
                                    </>
                                ) : (
                                    <Check size={12} />
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* TYPING INDICATOR */}
        {typingUsers.length > 0 && (
          <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                   <span className="animate-pulse text-gray-400">...</span>
                </div>
                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                  <span className="text-xs text-gray-500 font-medium">{typingUsers.join(", ")} is typing...</span>
                </div>
             </div>
          </div>
        )}

        <div ref={dummy}></div>
      </main>

      {/* INPUT AREA (Only if logged in) */}
      {isLoggedIn ? (
        <div className="bg-white border-t border-gray-200">
          
          {/* REPLY PREVIEW BAR */}
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 animate-in slide-in-from-bottom-2">
              <div className="flex-1 border-l-4 border-blue-500 pl-3 py-1">
                <p className="text-xs font-bold text-blue-600">Replying to {replyingTo.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{replyingTo.text}</p>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="p-4">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
              <input
                value={newMessage}
                onChange={handleTyping}
                placeholder={replyingTo ? "Type your reply..." : `Message as ${username}...`}
                className="flex-1 bg-gray-100 text-gray-800 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-white"
              />
              <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all">
                <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-500 text-sm">
          Please login to send messages.
        </div>
      )}

      {/* LOGIN/REGISTER MODAL */}
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Login</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter a name and password. <br/>
              <span className="text-xs opacity-80">(New names are automatically registered)</span>
            </p>
            
            <form onSubmit={handleLogin} className="space-y-3">
              <input 
                autoFocus
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 outline-none font-bold text-center text-lg text-gray-800"
              />
              <input 
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Password"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 outline-none text-center text-lg text-gray-800"
              />
              
              {loginError && <p className="text-red-500 text-xs font-bold">{loginError}</p>}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95">
                Login / Register
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}