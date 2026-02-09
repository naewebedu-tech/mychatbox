import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2, Lock, Unlock, User, Users, XCircle, Clock, Fingerprint, Check, CheckCheck, Eye } from 'lucide-react';
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
  setDoc, // Added setDoc
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

// --- HELPER: DEVICE FINGERPRINT ---
const getDeviceId = () => {
  let id = localStorage.getItem('chat_device_id');
  if (!id) {
    id = "dev_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36);
    localStorage.setItem('chat_device_id', id);
  }
  return id;
};

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
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || '');
  const [deviceId] = useState(getDeviceId());
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]); // List of people typing
  const [newMessage, setNewMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('chat_username'));
  const [, setTick] = useState(0); 
  const dummy = useRef();
  const typingTimeoutRef = useRef(null); // Ref to manage typing debounce

  useEffect(() => {
    signInAnonymously(auth).catch(() => setUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9) }));
    onAuthStateChanged(auth, (u) => { if(u) setUser(u); });

    // 1. MESSAGES LISTENER
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubMsg = onSnapshot(q, (snapshot) => {
      const loadedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(loadedMsgs);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      // Auto-read logic
      if (username) {
        snapshot.docs.forEach((docSnapshot) => {
            const msgData = docSnapshot.data();
            if (msgData.deviceId !== deviceId) {
                const alreadyRead = msgData.readBy?.some(reader => reader.deviceId === deviceId);
                if (!alreadyRead) {
                    updateDoc(docSnapshot.ref, {
                        readBy: arrayUnion({ deviceId: deviceId, name: username, readAt: Date.now() })
                    }).catch(err => console.log("Read receipt error:", err));
                }
            }
        });
      }
    });

    // 2. TYPING STATUS LISTENER
    // We listen to the "typing" collection to see who is active
    const unsubTyping = onSnapshot(collection(db, "typing"), (snapshot) => {
      const now = Date.now();
      const activeTypers = [];
      
      snapshot.forEach(doc => {
        // Don't show myself typing
        if (doc.id !== deviceId) {
          const data = doc.data();
          // Only show if the typing signal is fresh (less than 5 seconds old)
          if (now - data.timestamp < 5000) {
            activeTypers.push(data.displayName || "Someone");
          }
        }
      });
      setTypingUsers(activeTypers);
      if(activeTypers.length > 0) {
         setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => { unsubMsg(); unsubTyping(); clearInterval(timer); };
  }, [username, deviceId]);

  // --- HANDLERS ---

  const getMessageTime = (createdAt) => {
    if (!createdAt) return "Sending...";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!user || !username) return;

    // 1. Update Firestore to say "I am typing"
    setDoc(doc(db, "typing", deviceId), {
      displayName: username,
      timestamp: Date.now()
    });

    // 2. Clear previous timeout to prevent premature deletion
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 3. Set a timeout to remove "typing" status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      deleteDoc(doc(db, "typing", deviceId));
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    // Clear typing status immediately upon sending
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    deleteDoc(doc(db, "typing", deviceId));

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        deviceId: deviceId,
        displayName: username || "Anonymous",
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${deviceId}`,
        readBy: []
      });
      setNewMessage("");
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

  const handleSaveName = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('chat_username', username);
      setShowNameModal(false);
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
            <h1 className="text-xl font-bold text-gray-800 leading-none">Group Chat</h1>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
              <Fingerprint size={12} className="inline mr-1" />
              {username ? `Logged in as ${username}` : 'Guest Mode'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={() => setShowNameModal(true)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100" title="Change Name">
            <User size={20}/>
          </button>
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
          const isMe = msg.deviceId === deviceId;
          const readCount = msg.readBy ? msg.readBy.length : 0;
          const readNames = msg.readBy ? msg.readBy.map(r => r.name).join(", ") : "";
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group/message`}>
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[60%]`}>
                
                {!isMe && (
                  <span className={`text-[11px] font-bold ml-12 mb-1 ${getNameColor(msg.displayName || 'Anonymous')}`}>
                    {msg.displayName || "Anonymous"}
                  </span>
                )}

                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img 
                    src={msg.photoURL} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 shadow-sm mb-1 object-cover"
                  />
                  
                  <div className="relative">
                    {/* Message Bubble */}
                    <div className={`
                      px-5 py-3 shadow-sm text-[15px] leading-relaxed break-words
                      ${isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none'
                      }
                    `}>
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

                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 opacity-0 group-hover/message:opacity-100 transition-opacity`}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* --- TYPING INDICATOR --- */}
        {typingUsers.length > 0 && (
          <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                   <span className="animate-pulse text-gray-400">...</span>
                </div>
                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex items-center gap-2">
                     <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                     </div>
                     <span className="text-xs text-gray-500 font-medium">
                        {typingUsers.join(", ")} is typing...
                     </span>
                  </div>
                </div>
             </div>
          </div>
        )}

        <div ref={dummy}></div>
      </main>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
          <input
            value={newMessage}
            onChange={handleTyping} // Changed from setNewMessage to handleTyping
            placeholder={`Message as ${username}...`}
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-white"
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all">
            <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
          </button>
        </form>
      </div>

      {/* NAME MODAL */}
      {showNameModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join the Chat</h2>
            <p className="text-gray-500 text-sm mb-4">We've recognized your device!</p>
            <form onSubmit={handleSaveName}>
              <input 
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: IronMan, Sarah..."
                maxLength={15}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 mb-4 outline-none font-bold text-center text-lg text-gray-800"
              />
              <button type="submit" disabled={!username.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg">
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}