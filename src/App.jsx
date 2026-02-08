import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
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
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION (Inlined for stability) ---
const firebaseConfig = {
  apiKey: "AIzaSyBsdPXnfvUy78GjvS8Fq6R38iVVhlYuNtI",
  authDomain: "pvtbox-8f03a.firebaseapp.com",
  projectId: "pvtbox-8f03a",
  storageBucket: "pvtbox-8f03a.firebasestorage.app",
  messagingSenderId: "278360357776",
  appId: "1:278360357776:web:864c6443f5df751063d115",
  measurementId: "G-M4H1G18EFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const dummy = useRef();

  // 1. Connect to Firebase & Load Messages
  useEffect(() => {
    // Auto-login with Fallback
    signInAnonymously(auth).catch(err => {
      console.warn("Auth mode disabled or failed, falling back to Guest mode.", err);
      // Fallback: Create a local guest user so the app still works
      setUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9) });
    });

    // Listen for login status
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });

    // Listen for new messages
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubMsg = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Auto-scroll to bottom
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error("Chat sync error:", error);
    });

    return () => { unsubAuth(); unsubMsg(); };
  }, []);

  // 2. Send Message Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        // Generate a cool consistent avatar based on User ID
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.uid}`
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send. Please check your internet or Firebase rules.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-blue-200 shadow-lg">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-none">Global Chat</h1>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isMe = user && msg.uid === user.uid;
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[60%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar Image */}
                <img 
                  src={msg.photoURL} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full bg-gray-200 border border-gray-200 shadow-sm mb-1"
                />
                
                {/* Message Bubble */}
                <div className={`
                  px-5 py-3 shadow-sm text-[15px] leading-relaxed relative group break-words
                  ${isMe 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm'
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {/* Invisible element to scroll to */}
        <div ref={dummy}></div>
      </main>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all border border-transparent focus:border-blue-200 placeholder:text-gray-400"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3.5 rounded-full transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
          </button>
        </form>
      </div>

    </div>
  );
}