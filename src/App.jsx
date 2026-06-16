import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Lock, Unlock, User, XCircle, Eye, Reply, X, LogOut, Key,
  Hash, ArrowRight, ShieldCheck, Globe, ArrowLeft, Check, Download,
  Trash2, Video, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, setDoc, getDoc, updateDoc,
  arrayUnion, deleteDoc, getDocs, doc, query, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

/* ─────────────────── FIREBASE ─────────────────── */
const firebaseConfig = {
  apiKey: 'AIzaSyBsdPXnfvUy78GjvS8Fq6R38iVVhlYuNtI',
  authDomain: 'pvtbox-8f03a.firebaseapp.com',
  projectId: 'pvtbox-8f03a',
  storageBucket: 'pvtbox-8f03a.firebasestorage.app',
  messagingSenderId: '278360357776',
  appId: '1:278360357776:web:864c6443f5df751063d115',
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ─────────────────── HELPERS ─────────────────── */
const NAME_COLORS = ['#f87171','#fb923c','#fbbf24','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6','#818cf8'];
const getNameColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return NAME_COLORS[Math.abs(h) % NAME_COLORS.length];
};

const compressImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
      else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
  };
});

const downloadImage = (src, name = 'image.jpg') => {
  const a = document.createElement('a');
  a.href = src;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🤔','😮','😢','😡','🥺','👍','👎','❤️','🔥','✨','🎉','💯','😭','🙏','💪','👀','🤣','😅','🫡','💀','🤝','🫶','✅'];

/* ─────────────────── COMPONENTS ─────────────────── */

const EmojiPicker = ({ onSelect, onClose }) => (
  <div style={{
    position:'absolute', bottom:'calc(100% + 10px)', left:0, width:288,
    background:'rgba(16,16,26,0.98)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:18,
    padding:14, zIndex:60, display:'flex', flexWrap:'wrap', gap:4,
    boxShadow:'0 24px 64px rgba(0,0,0,0.7)',
    animation:'fadeScale .22s cubic-bezier(.34,1.56,.64,1) forwards'
  }}>
    {EMOJIS.map(e => (
      <button key={e} onClick={() => { onSelect(e); onClose(); }}
        style={{ width:36,height:36,fontSize:20,border:'none',borderRadius:9,cursor:'pointer',background:'transparent',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center' }}
        onMouseEnter={ev => { ev.currentTarget.style.background='rgba(139,92,246,.25)'; ev.currentTarget.style.transform='scale(1.2)'; }}
        onMouseLeave={ev => { ev.currentTarget.style.background='transparent'; ev.currentTarget.style.transform='scale(1)'; }}
      >{e}</button>
    ))}
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  const clr = { success:'#22c55e', error:'#ef4444', info:'#a78bfa', warning:'#fbbf24' };
  return (
    <div style={{
      position:'fixed', bottom:88, left:'50%', transform:'translateX(-50%)',
      zIndex:200, display:'flex', alignItems:'center', gap:9,
      padding:'9px 18px', borderRadius:13, fontSize:13, fontWeight:600, color:'#fff',
      background:'rgba(12,12,22,0.97)', backdropFilter:'blur(20px)',
      border:`1px solid ${clr[type]}50`, boxShadow:'0 8px 32px rgba(0,0,0,.5)',
      animation:'fadeScale .25s ease forwards', whiteSpace:'nowrap'
    }}>
      <span style={{ color:clr[type], fontSize:9 }}>⬤</span>{message}
    </div>
  );
};

/* ─── IMAGE FULL-SCREEN VIEWER ─── */
const ImageViewer = ({ src, onClose }) => (
  <div
    onClick={onClose}
    style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeScale .2s ease' }}
  >
    <button onClick={onClose} style={{ position:'absolute',top:16,right:16,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff' }}>
      <X size={18}/>
    </button>
    <button onClick={(e)=>{ e.stopPropagation(); downloadImage(src); }} style={{ position:'absolute',top:16,right:64,background:'rgba(139,92,246,.3)',border:'1px solid rgba(139,92,246,.5)',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#a78bfa' }} title="Download">
      <Download size={18}/>
    </button>
    <img src={src} alt="full" style={{ maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:12,boxShadow:'0 32px 80px rgba(0,0,0,.8)' }} onClick={e=>e.stopPropagation()}/>
  </div>
);

/* ─── CONTEXT MENU ─── */
const ContextMenu = ({ x, y, items, onClose }) => {
  useEffect(() => {
    const h = () => onClose();
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div style={{
      position:'fixed', top:y, left:x, zIndex:150,
      background:'rgba(18,18,28,0.98)', backdropFilter:'blur(30px)',
      border:'1px solid rgba(255,255,255,.1)', borderRadius:14,
      padding:6, minWidth:160,
      boxShadow:'0 16px 48px rgba(0,0,0,.6)',
      animation:'fadeScale .18s ease forwards'
    }}>
      {items.map((item, i) => item ? (
        <button key={i} onClick={() => { item.action(); onClose(); }} style={{
          display:'flex', alignItems:'center', gap:9, width:'100%', padding:'9px 12px',
          borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
          background:'transparent', color: item.danger ? '#f87171' : '#e2e0ff',
          fontFamily:'inherit', transition:'all .15s'
        }}
        onMouseEnter={ev => ev.currentTarget.style.background = item.danger ? 'rgba(239,68,68,.15)' : 'rgba(255,255,255,.07)'}
        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >
          {item.icon}<span>{item.label}</span>
        </button>
      ) : (
        <div key={i} style={{ height:1, background:'rgba(255,255,255,.07)', margin:'4px 8px' }}/>
      ))}
    </div>
  );
};

/* ─── MESSAGE BUBBLE ─── */
const MessageBubble = ({ msg, isMe, username, isAdmin, onDelete, onSoftDelete, onReply, getMessageTime, isNew }) => {
  const [sx, setSx] = useState(0);
  const [cx, setCx] = useState(0);
  const [sw, setSw] = useState(false);
  const [ctx, setCtx]   = useState(null); // context menu {x,y}
  const [imgView, setImgView] = useState(false);

  const reads    = msg.readBy ? msg.readBy.length : 0;
  const isImg    = !!msg.image;
  const isVid    = !!msg.video;
  const deleted  = !!msg.deleted;
  const deletedForMe = msg.deletedFor?.includes(username);

  const hStart = (x) => { setSx(x); setSw(true); };
  const hMove  = (x) => { if (!sw) return; const d = x - sx; if (d > 0 && d < 100) setCx(d); };
  const hEnd   = () => { setSw(false); if (cx > 55) onReply(msg); setCx(0); };

  const handleContextMenu = (e) => {
    e.preventDefault(); e.stopPropagation();
    const vpW = window.innerWidth, vpH = window.innerHeight;
    let x = e.clientX, y = e.clientY;
    if (x + 180 > vpW) x = vpW - 185;
    if (y + 200 > vpH) y = vpH - 210;
    setCtx({ x, y });
  };

  const bubbleMe   = { background:'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow:'0 4px 20px rgba(109,40,217,.35)' };
  const bubbleThem = { background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.09)' };

  if (deletedForMe) return null; // hidden for self

  /* ─ DELETED FOR ALL ─ */
  if (deleted) {
    return (
      <div style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:14,
          background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
          maxWidth:'70%' }}>
          <AlertCircle size={13} style={{ color:'rgba(255,255,255,.3)', flexShrink:0 }}/>
          <span style={{ fontSize:13, fontStyle:'italic', color:'rgba(255,255,255,.35)' }}>
            {isMe ? 'You deleted this message' : 'This message was deleted'}
          </span>
        </div>
      </div>
    );
  }

  /* ─ CONTEXT MENU ITEMS ─ */
  const menuItems = [
    { icon:<Reply size={14}/>, label:'Reply',      action: () => onReply(msg) },
    isImg || isVid ? { icon:<Download size={14}/>, label:'Download', action: () => isImg ? downloadImage(msg.image, 'chat-image.jpg') : downloadVideo(msg.video) } : null,
    null,
    isMe ? { icon:<Trash2 size={14}/>, label:'Delete for me',       danger:false, action: () => onSoftDelete(msg.id, 'forMe')   } : null,
    isMe ? { icon:<Trash2 size={14}/>, label:'Delete for everyone', danger:true,  action: () => onSoftDelete(msg.id, 'forAll')  } : null,
    isAdmin && !isMe ? { icon:<XCircle size={14}/>, label:'Admin delete', danger:true, action: () => onDelete(msg.id) } : null,
  ].filter(Boolean);

  return (
    <div
      className={isNew ? 'animate-msg-in' : ''}
      style={{ display:'flex', width:'100%', justifyContent: isMe ? 'flex-end' : 'flex-start', position:'relative', userSelect:'none' }}
      onTouchStart={e => hStart(e.targetTouches[0].clientX)}
      onTouchMove={e  => hMove(e.targetTouches[0].clientX)}
      onTouchEnd={hEnd}
      onMouseDown={e  => hStart(e.clientX)}
      onMouseMove={e  => { if (e.buttons === 1) hMove(e.clientX); }}
      onMouseUp={hEnd}
      onMouseLeave={() => { setSw(false); setCx(0); }}
      onContextMenu={handleContextMenu}
    >
      {/* SWIPE HINT */}
      <div style={{ position:'absolute', left:8, top:'50%', transform:`translateY(-50%) scale(${cx>50?1.2:.85})`, opacity: cx > 20 ? 1 : 0, transition:'all .2s', pointerEvents:'none' }}>
        <div style={{ padding:6, borderRadius:'50%', background:'rgba(139,92,246,.2)', border:'1px solid rgba(139,92,246,.4)', display:'flex' }}>
          <Reply size={14} style={{ color:'#a78bfa' }}/>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems: isMe?'flex-end':'flex-start', maxWidth:'82%', transform:`translateX(${cx}px)`, transition:'transform .2s ease' }}>
        {!isMe && (
          <span style={{ fontSize:11, fontWeight:700, marginLeft:40, marginBottom:3, color: getNameColor(msg.displayName||'User') }}>
            {msg.displayName||'Anonymous'}
          </span>
        )}

        <div style={{ display:'flex', alignItems:'flex-end', gap:8, flexDirection: isMe?'row-reverse':'row' }}>
          <img src={msg.photoURL} alt="av" style={{ width:30,height:30,borderRadius:'50%',objectFit:'cover',marginBottom:4,flexShrink:0, boxShadow:'0 0 0 2px rgba(139,92,246,.4)' }}/>

          <div
            style={{
              fontSize:14, lineHeight:1.6, wordBreak:'break-word', position:'relative',
              ...(isImg||isVid ? {} : { ...( isMe ? bubbleMe : bubbleThem), padding:'9px 14px', borderRadius:18, borderBottomRightRadius: isMe?4:18, borderBottomLeftRadius: isMe?18:4 }),
              cursor:'context-menu'
            }}
            onContextMenu={handleContextMenu}
          >
            {/* REPLY QUOTE */}
            {msg.replyTo && (
              <div style={{ marginBottom:8, padding:'5px 10px', borderLeft:'3px solid #7c3aed', background:'rgba(124,58,237,.1)', borderRadius:'0 8px 8px 0', fontSize:12 }}>
                <p style={{ fontWeight:700, color:'#a78bfa', margin:0,marginBottom:2 }}>{msg.replyTo.displayName}</p>
                <p style={{ opacity:.6, margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{msg.replyTo.text||'📷 Media'}</p>
              </div>
            )}

            {/* IMAGE */}
            {isImg && (
              <div style={{ borderRadius:16, overflow:'hidden', position:'relative', cursor:'pointer' }} onClick={() => setImgView(true)}>
                <img src={msg.image} alt="shared" style={{ maxHeight:280, width:'100%', objectFit:'cover', display:'block' }}/>
                {/* Download overlay */}
                <button onClick={(e)=>{ e.stopPropagation(); downloadImage(msg.image,'chat-image.jpg'); }}
                  style={{ position:'absolute',top:8,right:8, background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', border:'none',borderRadius:8,padding:'5px 7px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}>
                  <Download size={12}/> Save
                </button>
                {!msg.text && (
                  <div style={{ position:'absolute',bottom:8,right:8,display:'flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',fontSize:10,color:'#fff',fontWeight:500 }}>
                    {getMessageTime(msg.createdAt)}
                    {isMe && (reads>0 ? <Eye size={10}/> : <Check size={10}/>)}
                  </div>
                )}
              </div>
            )}

            {/* VIDEO */}
            {isVid && (
              <div style={{ borderRadius:16, overflow:'hidden', position:'relative', maxWidth:300 }}>
                <video src={msg.video} controls style={{ width:'100%', maxHeight:260, borderRadius:16, display:'block', background:'#000' }}/>
                <button onClick={()=>{ const a=document.createElement('a'); a.href=msg.video; a.download='chat-video.mp4'; a.click(); }}
                  style={{ position:'absolute',top:8,right:8,background:'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',border:'none',borderRadius:8,padding:'5px 7px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}>
                  <Download size={12}/> Save
                </button>
              </div>
            )}

            {/* TEXT */}
            {msg.text && (
              <div style={{ ...(isImg||isVid ? { ...(isMe?bubbleMe:bubbleThem), padding:'8px 14px', borderRadius:13, marginTop:5, wordBreak:'break-word' } : {}) }}>
                <span style={{ color: isMe?'#fff':'#e2e0ff' }}>{msg.text}</span>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4, fontSize:10, opacity:.5, justifyContent: isMe?'flex-end':'flex-start', color: isMe?'#c4b5fd':'#9ca3af' }}>
                  {getMessageTime(msg.createdAt)}
                  {isMe && (reads>0 ? <><Eye size={11} style={{ color:'#c4b5fd' }}/>{reads>1&&<span style={{ color:'#c4b5fd' }}>{reads}</span>}</> : <Check size={11}/>)}
                </div>
              </div>
            )}

            {/* Timestamp if image/video only */}
            {(isImg||isVid) && !msg.text && null}
          </div>
        </div>

        {/* Plain text timestamp (outside bubble, below) */}
        {!isImg && !isVid && !msg.text===false && !msg.text && null}
      </div>

      {/* CONTEXT MENU */}
      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={menuItems} onClose={() => setCtx(null)}/>}

      {/* IMAGE VIEWER */}
      {imgView && <ImageViewer src={msg.image} onClose={() => setImgView(false)}/>}
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [username, setUsername]         = useState('');
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [roomCode, setRoomCode]         = useState(null);
  const [roomInput, setRoomInput]       = useState('');
  const [pendingRoom, setPendingRoom]   = useState(null);
  const [messages, setMessages]         = useState([]);
  const [typingUsers, setTypingUsers]   = useState([]);
  const [newMessage, setNewMessage]     = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [replyingTo, setReplyingTo]     = useState(null);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [newMsgIds, setNewMsgIds]       = useState(new Set());
  const [showEmoji, setShowEmoji]       = useState(false);
  const [toast, setToast]               = useState(null);
  const [sending, setSending]           = useState(false);
  const [screen, setScreen]             = useState('login');
  const [loginName, setLoginName]       = useState('');
  const [loginPass, setLoginPass]       = useState('');
  const [loginError, setLoginError]     = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const dummy    = useRef();
  const typRef   = useRef(null);
  const fileRef  = useRef(null);
  const vidRef   = useRef(null);
  const inputRef = useRef(null);
  const prevLen  = useRef(0);

  /* ── FIRESTORE PATHS ── */
  const getMsgsRef = (rc = roomCode) => {
    if (rc === 'brosis123') return collection(db, 'messages');
    if (rc === 'public')    return collection(db, 'rooms', 'public', 'messages');
    return collection(db, 'rooms', rc, 'messages');
  };
  const getTypRef = (rc = roomCode) => {
    if (rc === 'brosis123') return collection(db, 'typing');
    if (rc === 'public')    return collection(db, 'rooms', 'public', 'typing');
    return collection(db, 'rooms', rc, 'typing');
  };

  /* ── INIT ── */
  useEffect(() => {
    signInAnonymously(auth).catch(() => setFirebaseUser({ uid: 'guest_' + Math.random().toString(36).substr(2,9) }));
    onAuthStateChanged(auth, u => { if (u) setFirebaseUser(u); });
    const saved = localStorage.getItem('chat_app_user');
    if (saved) {
      const { username: u } = JSON.parse(saved);
      setUsername(u); setIsLoggedIn(true); setScreen('rooms');
    }
  }, []);

  /* ── MESSAGES SUBSCRIPTION ── */
  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;
    setMessages([]); setTypingUsers([]); prevLen.current = 0;

    const q = query(getMsgsRef(), orderBy('createdAt'));
    const unMsg = onSnapshot(q, snap => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (loaded.length > prevLen.current) {
        const ids = loaded.slice(prevLen.current).map(m => m.id);
        setNewMsgIds(prev => new Set([...prev, ...ids]));
        setTimeout(() => setNewMsgIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; }), 700);
      }
      prevLen.current = loaded.length;
      setMessages(loaded);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior:'smooth' }), 80);
      if (username) {
        snap.docs.forEach(ds => {
          const d = ds.data();
          if (d.senderName !== username && !d.readBy?.some(r => r.name === username) && !d.deleted)
            updateDoc(ds.ref, { readBy: arrayUnion({ name:username, readAt:Date.now() }) }).catch(()=>{});
        });
      }
    });

    const unTyp = onSnapshot(getTypRef(), snap => {
      const now = Date.now(), active = [];
      snap.forEach(d => { if (d.id !== username) { const dd = d.data(); if (now - dd.timestamp < 3000) active.push(dd.displayName); } });
      setTypingUsers(active);
    });

    return () => { unMsg(); unTyp(); };
  }, [username, isLoggedIn, roomCode]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── AUTH ── */
  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    const name = loginName.trim(), pass = loginPass.trim();
    if (!name || !pass) { setLoginError('Please fill in both fields.'); return; }
    setLoginLoading(true);
    try {
      const ref = doc(db, 'chat_users', name.toLowerCase());
      const snap = await getDoc(ref);
      if (snap.exists()) {
        if (snap.data().password === pass) completeLogin(name);
        else setLoginError('Incorrect password.');
      } else {
        await setDoc(ref, { username:name, password:pass, createdAt:serverTimestamp() });
        completeLogin(name);
      }
    } catch { setLoginError('Connection error. Please retry.'); }
    finally { setLoginLoading(false); }
  };

  const completeLogin = (name) => {
    setUsername(name); setIsLoggedIn(true);
    localStorage.setItem('chat_app_user', JSON.stringify({ username:name }));
    setLoginName(''); setLoginPass('');
    if (pendingRoom) { setRoomCode(pendingRoom); setPendingRoom(null); setScreen('chat'); }
    else setScreen('rooms');
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_app_user');
    setIsLoggedIn(false); setUsername(''); setRoomCode(null); setScreen('login');
  };

  /* ── ROOMS ── */
  const handleJoinRoom = (e) => {
    e.preventDefault();
    const code = roomInput.trim().toLowerCase(); if (!code) return;
    if (!isLoggedIn) { setPendingRoom(code); return; }
    setRoomCode(code); setScreen('chat');
  };
  const joinPublicRoom = () => {
    if (!isLoggedIn) { setPendingRoom('public'); return; }
    setRoomCode('public'); setScreen('chat');
  };
  const exitRoom = () => { setRoomCode(null); setMessages([]); setRoomInput(''); setScreen('rooms'); };

  /* ── UTILS ── */
  const getMessageTime = (ts) => {
    if (!ts) return '···';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isLoggedIn || !username || !roomCode) return;
    const ref = doc(getTypRef(), username);
    setDoc(ref, { displayName:username, timestamp:Date.now() });
    if (typRef.current) clearTimeout(typRef.current);
    typRef.current = setTimeout(() => deleteDoc(ref), 2000);
  };

  /* ── MEDIA ── */
  const handleImageSelect = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 10000000) { showToast('Max 10MB image', 'error'); return; }
    try {
      const c = await compressImage(file);
      if (c.length > 1000000) { showToast('Image too large even compressed', 'error'); return; }
      setImagePreview(c); setVideoPreview(null);
    } catch { showToast('Failed to load image', 'error'); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 15000000) { showToast('Max 15MB video', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setVideoPreview(ev.target.result); setImagePreview(null); };
    reader.readAsDataURL(file);
    if (vidRef.current) vidRef.current.value = '';
  };

  /* ── SEND ── */
  const sendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if ((!text && !imagePreview && !videoPreview) || !firebaseUser || !isLoggedIn || !roomCode || sending) return;
    setSending(true);
    if (typRef.current) clearTimeout(typRef.current);
    deleteDoc(doc(getTypRef(), username));
    const t = newMessage, img = imagePreview, vid = videoPreview, rep = replyingTo;
    setNewMessage(''); setImagePreview(null); setVideoPreview(null); setReplyingTo(null);
    if (fileRef.current) fileRef.current.value = '';
    if (vidRef.current)  vidRef.current.value  = '';
    try {
      await addDoc(getMsgsRef(), {
        text: t, image: img || null, video: vid || null,
        createdAt: serverTimestamp(),
        senderName: username, displayName: username,
        photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
        readBy: [], deleted: false, deletedFor: [],
        replyTo: rep ? { id:rep.id, text:rep.text||(rep.image?'📷 Photo':rep.video?'🎥 Video':'Message'), displayName:rep.displayName } : null
      });
    } catch {
      showToast('Failed to send', 'error');
      setNewMessage(t); setImagePreview(img); setVideoPreview(vid); setReplyingTo(rep);
    } finally { setSending(false); inputRef.current?.focus(); }
  };

  /* ── DELETE / SOFT DELETE ── */
  const handleAdminDelete = async (id) => {
    if (isAdmin && window.confirm('Permanently delete this message?'))
      try { await deleteDoc(doc(getMsgsRef(), id)); } catch { showToast('Delete failed','error'); }
  };

  const handleSoftDelete = async (id, mode) => {
    const ref = doc(getMsgsRef(), id);
    try {
      if (mode === 'forAll') {
        await updateDoc(ref, { deleted:true, text:'', image:null, video:null });
        showToast('Message deleted for everyone', 'info');
      } else {
        await updateDoc(ref, { deletedFor: arrayUnion(username) });
        showToast('Message hidden for you', 'info');
      }
    } catch { showToast('Could not delete', 'error'); }
  };

  const clearChat = async () => {
    if (!isAdmin || !window.confirm('Clear ALL messages?')) return;
    const snap = await getDocs(query(getMsgsRef()));
    snap.forEach(d => deleteDoc(d.ref));
    showToast('Chat cleared', 'info');
  };

  const toggleAdmin = () => {
    if (isAdmin) { setIsAdmin(false); showToast('Admin OFF','info'); return; }
    const pw = window.prompt('Admin password:');
    if (pw === 'admin123') { setIsAdmin(true); showToast('Admin ON 🔓','success'); }
    else if (pw !== null) showToast('Wrong password','error');
  };

  const addEmoji = (e) => { setNewMessage(prev => prev + e); inputRef.current?.focus(); };

  /* ─────────────────── SHARED STYLE TOKENS ─────────────────── */
  const T = {
    page: {
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100vh', padding:16, position:'relative', overflow:'hidden',
      background:'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(139,92,246,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(59,130,246,.08) 0%,transparent 60%),#0a0a0f'
    },
    card: {
      background:'rgba(255,255,255,.05)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
      border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:32, width:'100%', maxWidth:364,
      boxShadow:'0 32px 80px rgba(0,0,0,.55)', position:'relative', zIndex:10,
      animation:'fadeScale .35s cubic-bezier(.34,1.56,.64,1) forwards'
    },
    input: {
      background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
      borderRadius:12, padding:'11px 14px 11px 40px', color:'#f1f0ff',
      fontSize:14, fontFamily:'inherit', width:'100%', outline:'none', transition:'all .2s', boxSizing:'border-box'
    },
    btnPrimary: {
      background:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none', borderRadius:12,
      color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer',
      padding:'12px 16px', width:'100%', boxShadow:'0 4px 20px rgba(109,40,217,.4)',
      transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8
    },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'20px 0' },
    divLine: { flex:1, height:1, background:'rgba(255,255,255,.07)' },
  };

  const focusIn  = e => { e.target.style.borderColor='rgba(139,92,246,.6)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,.15)'; e.target.style.background='rgba(255,255,255,.08)'; };
  const focusOut = e => { e.target.style.borderColor='rgba(255,255,255,.1)';  e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,.05)'; };

  /* ══ SCREEN: LOGIN ══ */
  if (screen === 'login') return (
    <div style={T.page}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div style={{ position:'absolute',top:'22%',left:'50%',transform:'translate(-50%,-50%)',width:420,height:420,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 70%)',filter:'blur(40px)',pointerEvents:'none' }}/>
      <div style={T.card}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:62,height:62,borderRadius:17,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',boxShadow:'0 8px 32px rgba(109,40,217,.5)',animation:'floatY 3s ease-in-out infinite' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h1 style={{ color:'#fff',fontSize:22,fontWeight:800,margin:0 }}>Welcome Back</h1>
          <p style={{ color:'rgba(255,255,255,.4)',fontSize:13,marginTop:6 }}>Sign in or create an account instantly</p>
        </div>
        <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <div style={{ position:'relative' }}>
            <User size={15} style={{ position:'absolute',left:12,top:13,color:'rgba(255,255,255,.3)',pointerEvents:'none' }}/>
            <input autoFocus value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Username" style={T.input} onFocus={focusIn} onBlur={focusOut}/>
          </div>
          <div style={{ position:'relative' }}>
            <Key size={15} style={{ position:'absolute',left:12,top:13,color:'rgba(255,255,255,.3)',pointerEvents:'none' }}/>
            <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password" style={T.input} onFocus={focusIn} onBlur={focusOut}/>
          </div>
          {loginError && (
            <div style={{ padding:'8px 12px',borderRadius:9,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',fontSize:12,fontWeight:600 }}>{loginError}</div>
          )}
          <button type="submit" disabled={loginLoading} style={{ ...T.btnPrimary, opacity:loginLoading?.7:1 }}>
            {loginLoading ? <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'block' }}/> : <><ArrowRight size={15}/>Continue</>}
          </button>
        </form>
        <p style={{ textAlign:'center',fontSize:11,color:'rgba(255,255,255,.28)',marginTop:12 }}>New? Just pick a name & password — no sign-up needed.</p>
        <div style={T.divider}><div style={T.divLine}/><span style={{ fontSize:11,color:'rgba(255,255,255,.3)' }}>PRIVATE ROOM</span><div style={T.divLine}/></div>
        <form onSubmit={e=>{ e.preventDefault(); const c=roomInput.trim().toLowerCase(); if(c) setPendingRoom(c); }} style={{ display:'flex',gap:8 }}>
          <div style={{ position:'relative',flex:1 }}>
            <Hash size={13} style={{ position:'absolute',left:10,top:12,color:'rgba(255,255,255,.3)',pointerEvents:'none' }}/>
            <input value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Room code..." style={{ ...T.input,paddingLeft:30,paddingTop:10,paddingBottom:10,fontSize:13 }} onFocus={focusIn} onBlur={focusOut}/>
          </div>
          <button type="submit" style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)',border:'none',borderRadius:11,color:'#fff',padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center' }}>
            <ArrowRight size={15}/>
          </button>
        </form>
        {pendingRoom && (
          <div style={{ marginTop:8,padding:'8px 12px',borderRadius:9,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.2)',color:'#a78bfa',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:6 }}>
            <ShieldCheck size={12}/> Will join <b style={{ marginLeft:3 }}>#{pendingRoom}</b> after login
          </div>
        )}
      </div>
    </div>
  );

  /* ══ SCREEN: ROOMS ══ */
  if (screen === 'rooms') return (
    <div style={T.page}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div style={{ position:'absolute',top:'30%',right:'20%',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 70%)',filter:'blur(40px)',pointerEvents:'none' }}/>
      <div style={T.card}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
          <div>
            <h2 style={{ color:'#fff',fontSize:19,fontWeight:800,margin:0 }}>Choose a Room</h2>
            <p style={{ color:'rgba(255,255,255,.4)',fontSize:12,marginTop:4 }}>Hey, <span style={{ color:'#a78bfa',fontWeight:700 }}>{username}</span> 👋</p>
          </div>
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`} alt="av" style={{ width:44,height:44,borderRadius:'50%',boxShadow:'0 0 0 2px rgba(139,92,246,.5)' }}/>
        </div>
        <label style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',display:'flex',alignItems:'center',gap:6,marginBottom:8 }}><Lock size={11}/> PRIVATE ROOM</label>
        <form onSubmit={handleJoinRoom} style={{ display:'flex',gap:8,marginBottom:20 }}>
          <div style={{ position:'relative',flex:1 }}>
            <Hash size={14} style={{ position:'absolute',left:12,top:13,color:'rgba(255,255,255,.3)',pointerEvents:'none' }}/>
            <input autoFocus value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Enter secret code..." style={T.input} onFocus={focusIn} onBlur={focusOut}/>
          </div>
          <button type="submit" disabled={!roomInput.trim()} style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)',border:'none',borderRadius:12,color:'#fff',padding:'11px 16px',cursor:'pointer',boxShadow:'0 4px 16px rgba(109,40,217,.4)',display:'flex',alignItems:'center',opacity:roomInput.trim()?1:.45 }}>
            <ArrowRight size={16}/>
          </button>
        </form>
        <div style={T.divider}><div style={T.divLine}/><span style={{ fontSize:11,color:'rgba(255,255,255,.3)' }}>OR</span><div style={T.divLine}/></div>
        <button onClick={joinPublicRoom}
          style={{ width:'100%',padding:'14px 16px',borderRadius:16,display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:'rgba(59,130,246,.08)',border:'1px solid rgba(59,130,246,.2)',transition:'all .2s',marginBottom:12 }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(59,130,246,.15)'; e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(59,130,246,.08)'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          <div style={{ width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#3b82f6,#2563eb)',boxShadow:'0 4px 16px rgba(59,130,246,.3)',flexShrink:0 }}><Globe size={18} style={{ color:'#fff' }}/></div>
          <div style={{ textAlign:'left',flex:1 }}>
            <p style={{ color:'#fff',fontWeight:700,fontSize:14,margin:0 }}>Public Chat</p>
            <p style={{ color:'rgba(255,255,255,.4)',fontSize:12,marginTop:2 }}>Open to everyone</p>
          </div>
          <ArrowRight size={14} style={{ color:'rgba(255,255,255,.3)' }}/>
        </button>
        <button onClick={handleLogout}
          style={{ width:'100%',padding:'10px 16px',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.1)',color:'rgba(239,68,68,.7)',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,.13)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(239,68,68,.06)'; e.currentTarget.style.color='rgba(239,68,68,.7)'; }}
        >
          <LogOut size={14}/> Sign Out
        </button>
      </div>
    </div>
  );

  /* ══ SCREEN: CHAT ══ */
  const isPublic = roomCode === 'public';
  const hasMedia = !!imagePreview || !!videoPreview;

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'#0a0a0f',position:'relative' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'80%',height:'40%',background:'radial-gradient(ellipse,rgba(139,92,246,.05) 0%,transparent 70%)',filter:'blur(40px)',pointerEvents:'none',zIndex:0 }}/>

      {/* ── HEADER ── */}
      <header style={{ background:'rgba(10,10,15,.92)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'11px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:20,position:'relative' }}>
        <div style={{ display:'flex',alignItems:'center',gap:11 }}>
          <button onClick={exitRoom} style={{ width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',cursor:'pointer',transition:'all .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
          ><ArrowLeft size={15} style={{ color:'rgba(255,255,255,.7)' }}/></button>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:isPublic?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#7c3aed,#5b21b6)',boxShadow:isPublic?'0 4px 16px rgba(59,130,246,.3)':'0 4px 16px rgba(109,40,217,.3)' }}>
              {isPublic ? <Globe size={16} style={{ color:'#fff' }}/> : <Lock size={16} style={{ color:'#fff' }}/>}
            </div>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <h1 style={{ color:'#fff',fontSize:14,fontWeight:800,margin:0 }}>{isPublic?'Public Chat':roomCode==='brosis123'?'Private History':`#${roomCode}`}</h1>
                <span style={{ fontSize:10,padding:'2px 6px',borderRadius:6,fontWeight:700,background:'rgba(139,92,246,.15)',color:'#a78bfa',border:'1px solid rgba(139,92,246,.2)' }}>{isPublic?'PUBLIC':'PRIVATE'}</span>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:3 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 6px rgba(34,197,94,.6)',display:'inline-block' }}/>
                <span style={{ color:'#22c55e',fontSize:11,fontWeight:600 }}>{username}</span>
                <span style={{ color:'rgba(255,255,255,.3)',fontSize:11 }}>· {messages.filter(m=>!m.deleted&&!m.deletedFor?.includes(username)).length} msgs</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex',gap:7,alignItems:'center' }}>
          {isAdmin && <button onClick={clearChat} style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}><XCircle size={12}/>Clear</button>}
          <button onClick={toggleAdmin} style={{ width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s',background:isAdmin?'rgba(251,191,36,.15)':'rgba(255,255,255,.06)',border:isAdmin?'1px solid rgba(251,191,36,.3)':'1px solid rgba(255,255,255,.09)' }}>
            {isAdmin ? <Unlock size={14} style={{ color:'#fbbf24' }}/> : <Lock size={14} style={{ color:'rgba(255,255,255,.4)' }}/>}
          </button>
          <button onClick={handleLogout} style={{ width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.15)',cursor:'pointer' }}>
            <LogOut size={14} style={{ color:'#f87171' }}/>
          </button>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <main style={{ flex:1,overflowY:'auto',padding:'14px 12px',display:'flex',flexDirection:'column',gap:11,position:'relative',zIndex:1,background:'#0a0a0f' }}>
        {messages.length === 0 && (
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',paddingBottom:60,animation:'fadeUp .4s ease forwards' }}>
            <div style={{ width:62,height:62,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,background:'rgba(139,92,246,.08)',border:'1px solid rgba(139,92,246,.18)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p style={{ color:'#fff',fontWeight:700,fontSize:14,margin:0 }}>No messages yet</p>
            <p style={{ color:'rgba(255,255,255,.33)',fontSize:12,marginTop:6 }}>Say something! Right-click any message for options 💬</p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg}
            isMe={msg.senderName === username} username={username}
            isAdmin={isAdmin} onDelete={handleAdminDelete}
            onSoftDelete={handleSoftDelete} onReply={setReplyingTo}
            getMessageTime={getMessageTime} isNew={newMsgIds.has(msg.id)}
          />
        ))}
        {typingUsers.length > 0 && (
          <div style={{ display:'flex',justifyContent:'flex-start',animation:'fadeUp .3s ease' }}>
            <div style={{ display:'flex',alignItems:'flex-end',gap:8 }}>
              <div style={{ width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.06)' }}>
                <User size={13} style={{ color:'rgba(255,255,255,.4)' }}/>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:6,padding:'10px 14px',borderRadius:18,borderBottomLeftRadius:4,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display:'flex',gap:4 }}>
                  {[0,1,2].map(i=>(
                    <span key={i} style={{ width:7,height:7,borderRadius:'50%',background:'rgba(139,92,246,.7)',display:'block',animation:'typDot 1.4s ease infinite',animationDelay:`${i*.2}s` }}/>
                  ))}
                </div>
                <span style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginLeft:3 }}>{typingUsers.join(', ')} typing</span>
              </div>
            </div>
          </div>
        )}
        <div ref={dummy}/>
      </main>

      {/* ── FOOTER ── */}
      <div style={{ background:'rgba(10,10,15,.94)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:'1px solid rgba(255,255,255,.06)',position:'relative',zIndex:10 }}>
        {/* Media preview */}
        {hasMedia && (
          <div style={{ padding:'8px 14px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,.06)',animation:'slideUp .22s ease' }}>
            {imagePreview && <img src={imagePreview} alt="preview" style={{ width:50,height:50,borderRadius:10,objectFit:'cover',border:'1px solid rgba(255,255,255,.1)' }}/>}
            {videoPreview && (
              <div style={{ width:50,height:50,borderRadius:10,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Video size={20} style={{ color:'#a78bfa' }}/>
              </div>
            )}
            <div style={{ flex:1 }}>
              <p style={{ color:'#fff',fontSize:12,fontWeight:700,margin:0 }}>{imagePreview?'Image':'Video'} attached</p>
              <p style={{ color:'rgba(255,255,255,.4)',fontSize:11,marginTop:2 }}>Ready to send</p>
            </div>
            <button onClick={()=>{ setImagePreview(null); setVideoPreview(null); }} style={{ width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.08)',border:'none',cursor:'pointer' }}>
              <X size={13} style={{ color:'rgba(255,255,255,.6)' }}/>
            </button>
          </div>
        )}
        {/* Reply preview */}
        {replyingTo && (
          <div style={{ padding:'8px 14px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,.06)',animation:'slideUp .22s ease' }}>
            <div style={{ flex:1,paddingLeft:12,borderLeft:'3px solid #7c3aed',background:'rgba(124,58,237,.08)',borderRadius:'0 9px 9px 0',padding:'6px 10px 6px 12px' }}>
              <p style={{ color:'#a78bfa',fontSize:11,fontWeight:700,margin:0 }}>Replying to {replyingTo.displayName}</p>
              <p style={{ color:'rgba(255,255,255,.4)',fontSize:11,marginTop:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis' }}>{replyingTo.text||'📷 Media'}</p>
            </div>
            <button onClick={()=>setReplyingTo(null)} style={{ width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.08)',border:'none',cursor:'pointer' }}>
              <X size={13} style={{ color:'rgba(255,255,255,.6)' }}/>
            </button>
          </div>
        )}
        {/* Emoji picker */}
        {showEmoji && (
          <div style={{ position:'relative',padding:'0 14px' }}>
            <EmojiPicker onSelect={addEmoji} onClose={()=>setShowEmoji(false)}/>
          </div>
        )}
        <div style={{ padding:'10px 12px' }}>
          <form onSubmit={sendMessage} style={{ display:'flex',alignItems:'flex-end',gap:7,maxWidth:920,margin:'0 auto' }}>
            {/* Hidden inputs */}
            <input type="file" ref={fileRef} onChange={handleImageSelect} style={{ display:'none' }} accept="image/*"/>
            <input type="file" ref={vidRef}  onChange={handleVideoSelect} style={{ display:'none' }} accept="video/*"/>

            {/* Image btn */}
            <button type="button" onClick={()=>fileRef.current?.click()}
              style={{ width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',cursor:'pointer',flexShrink:0,transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
              title="Share Image"
            ><ImageIcon size={16} style={{ color:'rgba(255,255,255,.5)' }}/></button>

            {/* Video btn */}
            <button type="button" onClick={()=>vidRef.current?.click()}
              style={{ width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',cursor:'pointer',flexShrink:0,transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(139,92,246,.18)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
              title="Share Video"
            ><Video size={16} style={{ color:'rgba(255,255,255,.5)' }}/></button>

            {/* Emoji btn */}
            <button type="button" onClick={()=>setShowEmoji(v=>!v)}
              style={{ width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all .2s',background:showEmoji?'rgba(139,92,246,.2)':'rgba(255,255,255,.06)',border:showEmoji?'1px solid rgba(139,92,246,.4)':'1px solid rgba(255,255,255,.09)' }}
            ><span style={{ fontSize:18,lineHeight:1 }}>😊</span></button>

            {/* Text area */}
            <textarea ref={inputRef} value={newMessage} onChange={handleTyping}
              onKeyDown={e=>{ if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
              placeholder={replyingTo?`Reply to ${replyingTo.displayName}...`:`Message #${roomCode}...`}
              rows={1}
              style={{ flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:14,padding:'10px 14px',color:'#f1f0ff',fontSize:14,fontFamily:'inherit',resize:'none',maxHeight:100,outline:'none',transition:'all .2s',lineHeight:1.5,overflowY:'auto' }}
              onFocus={focusIn} onBlur={focusOut}
              onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
            />

            {/* Send btn */}
            <button type="submit" disabled={!newMessage.trim()&&!hasMedia}
              style={{ width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',cursor:(newMessage.trim()||hasMedia)?'pointer':'not-allowed',flexShrink:0,border:'none',transition:'all .25s',
                background:(newMessage.trim()||hasMedia)?'linear-gradient(135deg,#7c3aed,#5b21b6)':'rgba(255,255,255,.06)',
                boxShadow:(newMessage.trim()||hasMedia)?'0 4px 20px rgba(109,40,217,.5)':'none',
                transform:(newMessage.trim()||hasMedia)?'scale(1)':'scale(.94)' }}>
              {sending
                ? <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'block' }}/>
                : <Send size={16} style={{ color:(newMessage.trim()||hasMedia)?'#fff':'rgba(255,255,255,.3)',marginLeft:1 }}/>
              }
            </button>
          </form>
          <p style={{ textAlign:'center',fontSize:10,color:'rgba(255,255,255,.17)',marginTop:5 }}>Enter to send · Shift+Enter for new line · Right-click message for options</p>
        </div>
      </div>
    </div>
  );
}
