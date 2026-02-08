import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2, Lock, Unlock, User, Users } from 'lucide-react';
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
  deleteDoc,
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

// --- HELPER: GET COLOR FROM NAME ---
// Assigns a consistent color to a username so "John" is always Red, etc.
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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('chat_username'));
  const dummy = useRef();

  // 1. Connect
  useEffect(() => {
    signInAnonymously(auth).catch(() => setUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9) }));
    onAuthStateChanged(auth, (u) => { if(u) setUser(u); });

    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, []);

  // 2. Send
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: username || "Anonymous",
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.uid}`
      });
      setNewMessage("");
    } catch (e) { console.error(e); }
  };

  // 3. Delete
  const handleDelete = async (id) => {
    if (isAdmin && confirm("Delete message?")) {
      try { await deleteDoc(doc(db, "messages", id)); } catch (e) {}
    }
  };

  // 4. Name Setup
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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
              {username ? ` You are: ${username}` : ' Online'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowNameModal(true)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100" title="Change Name">
            <User size={20}/>
          </button>
          <button onClick={toggleAdmin} className={`p-2 rounded-full ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
            {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isMe = user && msg.uid === user.uid;
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group/message`}>
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[60%]`}>
                
                {/* --- THE DIFFERENTIATOR --- */}
                {/* If it's NOT me, show their name in a specific color above the bubble */}
                {!isMe && (
                  <span className={`text-[11px] font-bold ml-12 mb-1 ${getNameColor(msg.displayName || 'Anonymous')}`}>
                    {msg.displayName || "Anonymous"}
                  </span>
                )}

                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <img src={msg.photoURL} alt="avatar" className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 shadow-sm mb-1 object-cover"/>
                  
                  {/* Message Bubble */}
                  <div className="relative">
                    <div className={`
                      px-5 py-3 shadow-sm text-[15px] leading-relaxed break-words
                      ${isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none'
                      }
                    `}>
                      {msg.text}
                    </div>

                    {/* Delete Button (Admin Only) */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 opacity-0 group-hover/message:opacity-100 transition-opacity`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={dummy}></div>
      </main>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join the Chat</h2>
            <p className="text-gray-500 mb-6 text-sm">Pick a username so others know who you are.</p>
            
            <form onSubmit={handleSaveName}>
              <input 
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: IronMan, Sarah, Guest..."
                maxLength={15}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 mb-4 outline-none transition-all font-bold text-center text-lg text-gray-800 placeholder:font-normal"
              />
              <button type="submit" disabled={!username.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95">
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}