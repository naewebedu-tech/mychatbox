import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Users, Lock, Unlock, User, 
  XCircle, Eye, Reply, X, LogOut, Key, Hash, ArrowRight, ShieldCheck, Globe, ArrowLeft, Check
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

// --- COMPONENT: SWIPEABLE MESSAGE ITEM ---
// Handles touch and mouse logic for individual messages
const SwipeableMessage = ({ msg, isMe, username, isAdmin, onDelete, onReply, getMessageTime }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const readCount = msg.readBy ? msg.readBy.length : 0;
  const readNames = msg.readBy ? msg.readBy.map(r => r.name).join(", ") : "";

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e) => {
    setStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.targetTouches[0].clientX - startX;
    if (diff > 0 && diff < 120) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX > 60) onReply(msg);
    setCurrentX(0);
  };

  // --- MOUSE HANDLERS (For Desktop Swipe) ---
  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    const diff = e.clientX - startX;
    if (diff > 0 && diff < 120) {
      setCurrentX(diff);
    }
  };

  const handleMouseUp = () => {
    setIsSwiping(false);
    if (currentX > 60) onReply(msg);
    setCurrentX(0);
  };

  const handleMouseLeave = () => {
    if (isSwiping) {
        setIsSwiping(false);
        setCurrentX(0);
    }
  };

  return (
    <div 
      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group/message relative overflow-hidden select-none touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* BACKGROUND REPLY ICON (Visible during swipe) */}
      <div 
        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center transition-all duration-200 ease-out"
        style={{ 
          opacity: currentX > 20 ? 1 : 0, 
          transform: `translateY(-50%) scale(${currentX > 50 ? 1.2 : 0.8})` 
        }}
      >
        <Reply size={24} className="bg-gray-100 p-1 rounded-full text-blue-500 shadow-sm" />
      </div>

      {/* MOVABLE CONTENT CONTAINER */}
      <div 
        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[60%] transition-transform duration-200 ease-out`}
        style={{ transform: `translateX(${currentX}px)` }}
      >
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
            className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 shadow-sm mb-1 object-cover pointer-events-none"
          />
          
          <div className="relative">
            {/* HOVER REPLY BUTTON (Desktop fallback) */}
            <button 
              onClick={() => onReply(msg)}
              className={`
                hidden md:block absolute top-1/2 -translate-y-1/2 
                ${isMe ? '-left-10' : '-right-10'}
                p-2 bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover/message:opacity-100 transition-opacity z-10
              `}
              title="Reply"
            >
              <Reply size={16} />
            </button>

            {/* Admin Delete */}
            {isAdmin && (
              <button 
                onClick={() => onDelete(msg.id)}
                className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 opacity-0 group-hover/message:opacity-100 transition-opacity z-20`}
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
              {msg.replyTo && (
                <div className={`
                  mb-2 text-xs border-l-4 pl-2 py-1 rounded-r opacity-90
                  ${isMe ? 'border-blue-300 bg-blue-700/50 text-blue-100' : 'border-blue-500 bg-gray-100 text-gray-500'}
                  overflow-hidden
                `}>
                  <p className="font-bold opacity-100 mb-0.5">{msg.replyTo.displayName}</p>
                  <p 
                    className="opacity-80 break-words" 
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {msg.replyTo.text}
                  </p>
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
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomCode, setRoomCode] = useState(null); 
  const [roomInput, setRoomInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const dummy = useRef();
  const typingTimeoutRef = useRef(null);

  const getMessagesRef = () => {
    if (roomCode === 'brosis123') return collection(db, "messages");
    if (roomCode === 'public') return collection(db, "rooms", "public", "messages");
    return collection(db, "rooms", roomCode, "messages");
  };

  const getTypingRef = () => {
    if (roomCode === 'brosis123') return collection(db, "typing");
    if (roomCode === 'public') return collection(db, "rooms", "public", "typing");
    return collection(db, "rooms", roomCode, "typing");
  };

  useEffect(() => {
    signInAnonymously(auth)
      .catch((err) => {
        console.warn("Auth failed, falling back to guest mode:", err);
        setFirebaseUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9) });
      });

    onAuthStateChanged(auth, (u) => { if(u) setFirebaseUser(u); });

    const savedUser = localStorage.getItem('chat_app_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUsername(parsed.username);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;

    setMessages([]); 
    setTypingUsers([]);

    const q = query(getMessagesRef(), orderBy("createdAt"));
    const unsubMsg = onSnapshot(q, (snapshot) => {
      const loadedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(loadedMsgs);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      if (isLoggedIn && username) {
        snapshot.docs.forEach((docSnapshot) => {
            const msgData = docSnapshot.data();
            if (msgData.senderName !== username) {
                const alreadyRead = msgData.readBy?.some(reader => reader.name === username);
                if (!alreadyRead) {
                    updateDoc(docSnapshot.ref, {
                        readBy: arrayUnion({ name: username, readAt: Date.now() })
                    }).catch(err => console.log("Read error:", err));
                }
            }
        });
      }
    });

    const unsubTyping = onSnapshot(getTypingRef(), (snapshot) => {
      const now = Date.now();
      const activeTypers = [];
      snapshot.forEach(doc => {
        if (doc.id !== username) { 
          const data = doc.data();
          if (now - data.timestamp < 3000) activeTypers.push(data.displayName);
        }
      });
      setTypingUsers(activeTypers);
    });

    return () => { unsubMsg(); unsubTyping(); };
  }, [username, isLoggedIn, roomCode]);

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
      const userDocRef = doc(db, "chat_users", cleanName.toLowerCase());
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === cleanPass) completeLogin(cleanName);
        else setLoginError("Incorrect password.");
      } else {
        await setDoc(userDocRef, {
          username: cleanName,
          password: cleanPass,
          createdAt: serverTimestamp()
        });
        completeLogin(cleanName);
      }
    } catch (err) {
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
    setRoomCode(null);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if(roomInput.trim()) setRoomCode(roomInput.trim().toLowerCase());
  };

  const joinPublicRoom = () => setRoomCode('public');

  const exitRoom = () => {
    setRoomCode(null);
    setMessages([]);
    setRoomInput("");
  };

  const getMessageTime = (createdAt) => {
    if (!createdAt) return "Sending...";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isLoggedIn || !username || !roomCode) return;

    const typingDocRef = doc(getTypingRef(), username);
    setDoc(typingDocRef, { displayName: username, timestamp: Date.now() });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { deleteDoc(typingDocRef); }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !firebaseUser || !isLoggedIn || !roomCode) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    deleteDoc(doc(getTypingRef(), username));

    try {
      await addDoc(getMessagesRef(), {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderName: username,
        displayName: username,
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
      try { await deleteDoc(doc(getMessagesRef(), id)); } catch (e) {}
    }
  };

  const clearChat = async () => {
    if (!isAdmin && confirm("⚠️ Clear ALL messages in this room?")) {
      const q = query(getMessagesRef());
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => deleteDoc(doc.ref));
    }
  };

  const toggleAdmin = () => {
    if (isAdmin) setIsAdmin(false);
    else if (prompt("Admin Password:") === "admin123") setIsAdmin(true);
    else alert("Wrong password");
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Login</h2>
          <p className="text-gray-500 text-sm mb-6">Enter a name and password to start.</p>
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
    );
  }

  if (!roomCode) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secret Code Entry</h2>
          <p className="text-gray-500 text-sm mb-6">Welcome, <span className="font-bold text-gray-800">{username}</span>.</p>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="relative">
              <Hash className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                autoFocus
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter Chat Code..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl pl-12 pr-4 py-3 outline-none font-bold text-lg text-gray-800"
              />
            </div>
            <button type="submit" disabled={!roomInput.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Enter Secret Room <ArrowRight size={18} />
            </button>
            <p className="text-[10px] text-gray-400">Use <span className="font-mono bg-gray-100 px-1 rounded">brosis123</span> for old history</p>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">OR</p>
            <button onClick={joinPublicRoom} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Globe size={18} /> Join Open Public Chat
            </button>
            <button onClick={handleLogout} className="mt-4 text-xs text-red-400 hover:text-red-600 underline">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-blue-200 shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-none">Global Chat</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-purple-200">
                 <Hash size={10} /> {roomCode === 'brosis123' ? 'Private History' : roomCode}
               </span>
               <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {username}
               </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={exitRoom} className="text-xs bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg font-bold transition-colors border border-gray-200">Get Out</button>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50" title="Logout"><LogOut size={20}/></button>
          {isAdmin && <button onClick={clearChat} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 mr-1" title="Clear All"><Trash2 size={20} /></button>}
          <button onClick={toggleAdmin} className={`p-2 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>{isAdmin ? <Unlock size={20} /> : <Lock size={20} />}</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <SwipeableMessage 
            key={msg.id} 
            msg={msg} 
            isMe={msg.senderName === username} 
            username={username}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onReply={setReplyingTo}
            getMessageTime={getMessageTime}
          />
        ))}
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

      <div className="bg-white border-t border-gray-200">
        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 animate-in slide-in-from-bottom-2">
            <div className="flex-1 border-l-4 border-blue-500 pl-3 py-1 min-w-0">
              <p className="text-xs font-bold text-blue-600 truncate">Replying to {replyingTo.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{replyingTo.text}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18} /></button>
          </div>
        )}
        <div className="p-4">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              value={newMessage}
              onChange={handleTyping}
              placeholder={replyingTo ? "Type your reply..." : `Message #${roomCode} as ${username}...`}
              className="flex-1 bg-gray-100 text-gray-800 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-white"
            />
            <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all">
              <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}