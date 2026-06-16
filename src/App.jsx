import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Lock, Unlock, User, XCircle, Eye, Reply, X, LogOut, Key,
  Hash, ArrowRight, ShieldCheck, Globe, ArrowLeft, Check, Download,
  Trash2, Video, Image as ImageIcon, AlertCircle, Sun, Moon, Palette,
  BookOpen, GraduationCap, Users, MessageSquare, Zap, Star
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, setDoc, getDoc, updateDoc,
  arrayUnion, deleteDoc, getDocs, doc, query, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

/* ─────────────── FIREBASE ─────────────── */
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

/* ─────────────── THEMES ─────────────── */
const THEMES = {
  dark: {
    name: 'Dark', icon: '🌙',
    bg: '#0a0a0f',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(139,92,246,.13) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(59,130,246,.08) 0%,transparent 60%),#0a0a0f',
    card: 'rgba(255,255,255,.05)',
    cardBorder: 'rgba(255,255,255,.1)',
    header: 'rgba(10,10,15,.92)',
    footer: 'rgba(10,10,15,.94)',
    text: '#f1f0ff',
    textMuted: 'rgba(255,255,255,.4)',
    accent: '#7c3aed',
    accentLight: '#a78bfa',
    accentGrad: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleMe: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleThem: 'rgba(255,255,255,.07)',
    bubbleThemBorder: 'rgba(255,255,255,.1)',
    inputBg: 'rgba(255,255,255,.05)',
    inputBorder: 'rgba(255,255,255,.1)',
    inputText: '#f1f0ff',
    placeholder: 'rgba(255,255,255,.3)',
    iconMuted: 'rgba(255,255,255,.4)',
    btnGlass: 'rgba(255,255,255,.06)',
    btnGlassBorder: 'rgba(255,255,255,.09)',
    divider: 'rgba(255,255,255,.07)',
    msgGlow: 'rgba(109,40,217,.35)',
  },
  light: {
    name: 'Light', icon: '☀️',
    bg: '#f8f7ff',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(139,92,246,.06) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(59,130,246,.04) 0%,transparent 60%),#f8f7ff',
    card: 'rgba(255,255,255,.9)',
    cardBorder: 'rgba(0,0,0,.1)',
    header: 'rgba(255,255,255,.95)',
    footer: 'rgba(255,255,255,.97)',
    text: '#1a1033',
    textMuted: 'rgba(0,0,0,.45)',
    accent: '#7c3aed',
    accentLight: '#6d28d9',
    accentGrad: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleMe: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleThem: '#f0eeff',
    bubbleThemBorder: 'rgba(109,40,217,.15)',
    inputBg: 'rgba(0,0,0,.04)',
    inputBorder: 'rgba(0,0,0,.12)',
    inputText: '#1a1033',
    placeholder: 'rgba(0,0,0,.35)',
    iconMuted: 'rgba(0,0,0,.4)',
    btnGlass: 'rgba(0,0,0,.04)',
    btnGlassBorder: 'rgba(0,0,0,.1)',
    divider: 'rgba(0,0,0,.08)',
    msgGlow: 'rgba(109,40,217,.2)',
  },
  ocean: {
    name: 'Ocean', icon: '🌊',
    bg: '#030d1a',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(6,182,212,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(59,130,246,.1) 0%,transparent 60%),#030d1a',
    card: 'rgba(6,182,212,.06)',
    cardBorder: 'rgba(6,182,212,.2)',
    header: 'rgba(3,13,26,.92)',
    footer: 'rgba(3,13,26,.94)',
    text: '#e0f7fa',
    textMuted: 'rgba(224,247,250,.4)',
    accent: '#0891b2',
    accentLight: '#22d3ee',
    accentGrad: 'linear-gradient(135deg,#0891b2,#0e7490)',
    bubbleMe: 'linear-gradient(135deg,#0891b2,#0e7490)',
    bubbleThem: 'rgba(6,182,212,.1)',
    bubbleThemBorder: 'rgba(6,182,212,.2)',
    inputBg: 'rgba(6,182,212,.06)',
    inputBorder: 'rgba(6,182,212,.2)',
    inputText: '#e0f7fa',
    placeholder: 'rgba(224,247,250,.3)',
    iconMuted: 'rgba(224,247,250,.4)',
    btnGlass: 'rgba(6,182,212,.08)',
    btnGlassBorder: 'rgba(6,182,212,.18)',
    divider: 'rgba(6,182,212,.1)',
    msgGlow: 'rgba(8,145,178,.3)',
  },
  forest: {
    name: 'Forest', icon: '🌿',
    bg: '#030f08',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 20% 20%,rgba(34,197,94,.1) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(16,185,129,.07) 0%,transparent 60%),#030f08',
    card: 'rgba(34,197,94,.05)',
    cardBorder: 'rgba(34,197,94,.18)',
    header: 'rgba(3,15,8,.92)',
    footer: 'rgba(3,15,8,.94)',
    text: '#dcfce7',
    textMuted: 'rgba(220,252,231,.4)',
    accent: '#16a34a',
    accentLight: '#4ade80',
    accentGrad: 'linear-gradient(135deg,#16a34a,#15803d)',
    bubbleMe: 'linear-gradient(135deg,#16a34a,#15803d)',
    bubbleThem: 'rgba(34,197,94,.09)',
    bubbleThemBorder: 'rgba(34,197,94,.18)',
    inputBg: 'rgba(34,197,94,.05)',
    inputBorder: 'rgba(34,197,94,.18)',
    inputText: '#dcfce7',
    placeholder: 'rgba(220,252,231,.3)',
    iconMuted: 'rgba(220,252,231,.4)',
    btnGlass: 'rgba(34,197,94,.07)',
    btnGlassBorder: 'rgba(34,197,94,.16)',
    divider: 'rgba(34,197,94,.1)',
    msgGlow: 'rgba(22,163,74,.3)',
  },
};

/* ─────────────── HELPERS ─────────────── */
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
    const img = new Image(); img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 900; let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX/w; w = MAX; } } else { if (h > MAX) { w *= MAX/h; h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
  };
});

const downloadFile = (src, name) => { const a = document.createElement('a'); a.href = src; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); };

const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🤔','😮','😢','😡','🥺','👍','👎','❤️','🔥','✨','🎉','💯','😭','🙏','💪','👀','🤣','😅','🫡','💀','🤝','🫶','✅'];

/* ─────────────── MINI COMPONENTS ─────────────── */

const EmojiPicker = ({ onSelect, onClose, th }) => (
  <div style={{ position:'absolute',bottom:'calc(100% + 10px)',left:0,width:288,background:th.card,backdropFilter:'blur(40px)',border:`1px solid ${th.cardBorder}`,borderRadius:18,padding:14,zIndex:60,display:'flex',flexWrap:'wrap',gap:4,boxShadow:'0 24px 64px rgba(0,0,0,.7)',animation:'fadeScale .22s cubic-bezier(.34,1.56,.64,1) forwards' }}>
    {EMOJIS.map(e => (
      <button key={e} onClick={() => { onSelect(e); onClose(); }}
        style={{ width:36,height:36,fontSize:20,border:'none',borderRadius:9,cursor:'pointer',background:'transparent',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center' }}
        onMouseEnter={ev => { ev.currentTarget.style.background=th.btnGlass; ev.currentTarget.style.transform='scale(1.2)'; }}
        onMouseLeave={ev => { ev.currentTarget.style.background='transparent'; ev.currentTarget.style.transform='scale(1)'; }}
      >{e}</button>
    ))}
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  const clr = { success:'#22c55e', error:'#ef4444', info:'#a78bfa', warning:'#fbbf24' };
  return (
    <div style={{ position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',zIndex:300,display:'flex',alignItems:'center',gap:9,padding:'9px 18px',borderRadius:13,fontSize:13,fontWeight:600,color:'#fff',background:'rgba(12,12,22,.97)',backdropFilter:'blur(20px)',border:`1px solid ${clr[type]}50`,boxShadow:'0 8px 32px rgba(0,0,0,.5)',animation:'fadeScale .25s ease forwards',whiteSpace:'nowrap' }}>
      <span style={{ color:clr[type],fontSize:9 }}>⬤</span>{message}
    </div>
  );
};

const ThemePicker = ({ current, onChange, onClose, th }) => (
  <div style={{ position:'fixed',top:60,right:12,zIndex:200,background:th.card,backdropFilter:'blur(40px)',border:`1px solid ${th.cardBorder}`,borderRadius:16,padding:10,boxShadow:'0 20px 60px rgba(0,0,0,.6)',animation:'fadeScale .2s ease forwards',minWidth:160 }}>
    <p style={{ color:th.textMuted,fontSize:10,fontWeight:700,margin:'0 4px 8px',letterSpacing:.5 }}>THEME</p>
    {Object.entries(THEMES).map(([key, t]) => (
      <button key={key} onClick={() => { onChange(key); onClose(); }}
        style={{ display:'flex',alignItems:'center',gap:9,width:'100%',padding:'8px 10px',borderRadius:10,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .15s',background: current===key ? th.accentGrad : 'transparent',color: current===key ? '#fff' : th.text }}
        onMouseEnter={ev => { if(current!==key) ev.currentTarget.style.background=th.btnGlass; }}
        onMouseLeave={ev => { if(current!==key) ev.currentTarget.style.background='transparent'; }}
      >
        <span style={{ fontSize:16 }}>{t.icon}</span>{t.name}
        {current===key && <span style={{ marginLeft:'auto',fontSize:10 }}>✓</span>}
      </button>
    ))}
  </div>
);

const ImageViewer = ({ src, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeScale .2s ease' }}>
    <button onClick={onClose} style={{ position:'absolute',top:16,right:16,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff' }}><X size={18}/></button>
    <button onClick={e=>{ e.stopPropagation(); downloadFile(src,'chat-image.jpg'); }} style={{ position:'absolute',top:16,right:64,background:'rgba(139,92,246,.3)',border:'1px solid rgba(139,92,246,.5)',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#a78bfa' }} title="Download"><Download size={18}/></button>
    <img src={src} alt="full" onClick={e=>e.stopPropagation()} style={{ maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:12,boxShadow:'0 32px 80px rgba(0,0,0,.8)' }}/>
  </div>
);

const ContextMenu = ({ x, y, items, onClose, th }) => {
  useEffect(() => { const h = () => onClose(); document.addEventListener('click',h); return () => document.removeEventListener('click',h); }, []);
  return (
    <div style={{ position:'fixed',top:y,left:x,zIndex:250,background:th.header,backdropFilter:'blur(30px)',border:`1px solid ${th.cardBorder}`,borderRadius:14,padding:6,minWidth:168,boxShadow:'0 16px 48px rgba(0,0,0,.6)',animation:'fadeScale .18s ease forwards' }}>
      {items.map((item,i) => item ? (
        <button key={i} onClick={()=>{ item.action(); onClose(); }}
          style={{ display:'flex',alignItems:'center',gap:9,width:'100%',padding:'9px 12px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:'transparent',color:item.danger?'#f87171':th.text,fontFamily:'inherit',transition:'all .15s' }}
          onMouseEnter={ev=>ev.currentTarget.style.background=item.danger?'rgba(239,68,68,.15)':th.btnGlass}
          onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
        >{item.icon}<span>{item.label}</span></button>
      ) : (
        <div key={i} style={{ height:1,background:th.divider,margin:'4px 8px' }}/>
      ))}
    </div>
  );
};

/* ─────────────── MESSAGE BUBBLE ─────────────── */
const MessageBubble = ({ msg, isMe, username, isAdmin, onDelete, onSoftDelete, onReply, getMessageTime, isNew, th }) => {
  const [sx,setSx]=useState(0); const [cx,setCx]=useState(0); const [sw,setSw]=useState(false);
  const [ctx,setCtx]=useState(null); const [imgView,setImgView]=useState(false);
  const reads = msg.readBy ? msg.readBy.length : 0;
  const isImg = !!msg.image; const isVid = !!msg.video;
  const deleted = !!msg.deleted;
  const deletedForMe = msg.deletedFor?.includes(username);
  const hStart=(x)=>{setSx(x);setSw(true);}; const hMove=(x)=>{if(!sw)return;const d=x-sx;if(d>0&&d<100)setCx(d);}; const hEnd=()=>{setSw(false);if(cx>55)onReply(msg);setCx(0);};
  const handleCtx=(e)=>{ e.preventDefault(); e.stopPropagation(); let x=e.clientX,y=e.clientY; if(x+180>window.innerWidth)x=window.innerWidth-185; if(y+200>window.innerHeight)y=window.innerHeight-210; setCtx({x,y}); };
  const bubbleMe={background:th.bubbleMe,boxShadow:`0 4px 20px ${th.msgGlow}`};
  const bubbleThem={background:th.bubbleThem,border:`1px solid ${th.bubbleThemBorder}`};
  if(deletedForMe) return null;
  if(deleted) return (
    <div style={{ display:'flex',justifyContent:isMe?'flex-end':'flex-start' }}>
      <div style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:14,background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}`,maxWidth:'72%' }}>
        <AlertCircle size={13} style={{ color:th.textMuted,flexShrink:0 }}/>
        <span style={{ fontSize:13,fontStyle:'italic',color:th.textMuted }}>{isMe?'You deleted this message':'This message was deleted'}</span>
      </div>
    </div>
  );
  const menuItems=[
    {icon:<Reply size={14}/>,label:'Reply',action:()=>onReply(msg)},
    isImg?{icon:<Download size={14}/>,label:'Download Image',action:()=>downloadFile(msg.image,'chat-image.jpg')}:null,
    isVid?{icon:<Download size={14}/>,label:'Download Video',action:()=>downloadFile(msg.video,'chat-video.mp4')}:null,
    null,
    isMe?{icon:<Trash2 size={14}/>,label:'Delete for Me',danger:false,action:()=>onSoftDelete(msg.id,'forMe')}:null,
    isMe?{icon:<Trash2 size={14}/>,label:'Delete for Everyone',danger:true,action:()=>onSoftDelete(msg.id,'forAll')}:null,
    isAdmin&&!isMe?{icon:<XCircle size={14}/>,label:'Admin Delete',danger:true,action:()=>onDelete(msg.id)}:null,
  ].filter(Boolean);

  return (
    <div className={isNew?'animate-msg-in':''} style={{ display:'flex',width:'100%',justifyContent:isMe?'flex-end':'flex-start',position:'relative',userSelect:'none' }}
      onTouchStart={e=>hStart(e.targetTouches[0].clientX)} onTouchMove={e=>hMove(e.targetTouches[0].clientX)} onTouchEnd={hEnd}
      onMouseDown={e=>hStart(e.clientX)} onMouseMove={e=>{if(e.buttons===1)hMove(e.clientX);}} onMouseUp={hEnd}
      onMouseLeave={()=>{setSw(false);setCx(0);}} onContextMenu={handleCtx}
    >
      <div style={{ position:'absolute',left:8,top:'50%',transform:`translateY(-50%) scale(${cx>50?1.2:.85})`,opacity:cx>20?1:0,transition:'all .2s',pointerEvents:'none' }}>
        <div style={{ padding:6,borderRadius:'50%',background:`${th.accent}30`,border:`1px solid ${th.accent}60`,display:'flex' }}><Reply size={14} style={{ color:th.accentLight }}/></div>
      </div>
      <div style={{ display:'flex',flexDirection:'column',alignItems:isMe?'flex-end':'flex-start',maxWidth:'82%',transform:`translateX(${cx}px)`,transition:'transform .2s ease' }}>
        {!isMe&&<span style={{ fontSize:11,fontWeight:700,marginLeft:40,marginBottom:3,color:getNameColor(msg.displayName||'User') }}>{msg.displayName||'Anonymous'}</span>}
        <div style={{ display:'flex',alignItems:'flex-end',gap:8,flexDirection:isMe?'row-reverse':'row' }}>
          <img src={msg.photoURL} alt="av" style={{ width:30,height:30,borderRadius:'50%',objectFit:'cover',marginBottom:4,flexShrink:0,boxShadow:`0 0 0 2px ${th.accent}60` }}/>
          <div onContextMenu={handleCtx} style={{ fontSize:14,lineHeight:1.6,wordBreak:'break-word',position:'relative',cursor:'context-menu',...(isImg||isVid?{}:{...(isMe?bubbleMe:bubbleThem),padding:'9px 14px',borderRadius:18,borderBottomRightRadius:isMe?4:18,borderBottomLeftRadius:isMe?18:4}) }}>
            {msg.replyTo&&<div style={{ marginBottom:8,padding:'5px 10px',borderLeft:`3px solid ${th.accent}`,background:`${th.accent}15`,borderRadius:'0 8px 8px 0',fontSize:12 }}><p style={{ fontWeight:700,color:th.accentLight,margin:0,marginBottom:2 }}>{msg.replyTo.displayName}</p><p style={{ opacity:.6,margin:0,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{msg.replyTo.text||'📷 Media'}</p></div>}
            {isImg&&(
              <div style={{ borderRadius:16,overflow:'hidden',position:'relative',cursor:'pointer' }} onClick={()=>setImgView(true)}>
                <img src={msg.image} alt="shared" style={{ maxHeight:280,width:'100%',objectFit:'cover',display:'block' }}/>
                <button onClick={e=>{e.stopPropagation();downloadFile(msg.image,'chat-image.jpg');}} style={{ position:'absolute',top:8,right:8,background:'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',border:'none',borderRadius:8,padding:'5px 7px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}><Download size={12}/> Save</button>
                {!msg.text&&<div style={{ position:'absolute',bottom:8,right:8,display:'flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',fontSize:10,color:'#fff',fontWeight:500 }}>{getMessageTime(msg.createdAt)}{isMe&&(reads>0?<Eye size={10}/>:<Check size={10}/>)}</div>}
              </div>
            )}
            {isVid&&(
              <div style={{ borderRadius:16,overflow:'hidden',position:'relative',maxWidth:300 }}>
                <video src={msg.video} controls style={{ width:'100%',maxHeight:260,borderRadius:16,display:'block',background:'#000' }}/>
                <button onClick={()=>downloadFile(msg.video,'chat-video.mp4')} style={{ position:'absolute',top:8,right:8,background:'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',border:'none',borderRadius:8,padding:'5px 7px',cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}><Download size={12}/> Save</button>
              </div>
            )}
            {msg.text&&(
              <div style={{ ...(isImg||isVid?{...(isMe?bubbleMe:bubbleThem),padding:'8px 14px',borderRadius:13,marginTop:5,wordBreak:'break-word'}:{}) }}>
                <span style={{ color:isMe?'#fff':th.text }}>{msg.text}</span>
                <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:4,fontSize:10,opacity:.5,justifyContent:isMe?'flex-end':'flex-start',color:isMe?th.accentLight:th.textMuted }}>{getMessageTime(msg.createdAt)}{isMe&&(reads>0?<><Eye size={11} style={{ color:th.accentLight }}/>{reads>1&&<span style={{ color:th.accentLight }}>{reads}</span>}</>:<Check size={11}/>)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {ctx&&<ContextMenu x={ctx.x} y={ctx.y} items={menuItems} onClose={()=>setCtx(null)} th={th}/>}
      {imgView&&<ImageViewer src={msg.image} onClose={()=>setImgView(false)}/>}
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function App() {
  const [firebaseUser,setFirebaseUser]=useState(null);
  const [username,setUsername]=useState('');
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [roomCode,setRoomCode]=useState(null);
  const [roomInput,setRoomInput]=useState('');
  const [pendingRoom,setPendingRoom]=useState(null);
  const [messages,setMessages]=useState([]);
  const [typingUsers,setTypingUsers]=useState([]);
  const [newMessage,setNewMessage]=useState('');
  const [imagePreview,setImagePreview]=useState(null);
  const [videoPreview,setVideoPreview]=useState(null);
  const [replyingTo,setReplyingTo]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [newMsgIds,setNewMsgIds]=useState(new Set());
  const [showEmoji,setShowEmoji]=useState(false);
  const [toast,setToast]=useState(null);
  const [sending,setSending]=useState(false);
  const [screen,setScreen]=useState('login');
  const [loginName,setLoginName]=useState('');
  const [loginPass,setLoginPass]=useState('');
  const [loginError,setLoginError]=useState('');
  const [loginLoading,setLoginLoading]=useState(false);
  const [themeName,setThemeName]=useState(() => localStorage.getItem('chat_theme')||'dark');
  const [showTheme,setShowTheme]=useState(false);

  const th = THEMES[themeName] || THEMES.dark;

  const dummy=useRef(); const typRef=useRef(null); const fileRef=useRef(null); const vidRef=useRef(null); const inputRef=useRef(null); const prevLen=useRef(0);

  /* ── PATHS ── */
  const getMsgsRef=(rc=roomCode)=>{ if(rc==='brosis123')return collection(db,'messages'); if(rc==='public')return collection(db,'rooms','public','messages'); return collection(db,'rooms',rc,'messages'); };
  const getTypRef=(rc=roomCode)=>{ if(rc==='brosis123')return collection(db,'typing'); if(rc==='public')return collection(db,'rooms','public','typing'); return collection(db,'rooms',rc,'typing'); };

  /* ── INIT ── */
  useEffect(()=>{
    signInAnonymously(auth).catch(()=>setFirebaseUser({uid:'guest_'+Math.random().toString(36).substr(2,9)}));
    onAuthStateChanged(auth,u=>{if(u)setFirebaseUser(u);});
    const saved=localStorage.getItem('chat_app_user');
    if(saved){const{username:u}=JSON.parse(saved);setUsername(u);setIsLoggedIn(true);setScreen('rooms');}
  },[]);

  /* ── MESSAGES ── */
  useEffect(()=>{
    if(!isLoggedIn||!roomCode)return;
    setMessages([]);setTypingUsers([]);prevLen.current=0;
    const q=query(getMsgsRef(),orderBy('createdAt'));
    const unMsg=onSnapshot(q,snap=>{
      const loaded=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(loaded.length>prevLen.current){const ids=loaded.slice(prevLen.current).map(m=>m.id);setNewMsgIds(prev=>new Set([...prev,...ids]));setTimeout(()=>setNewMsgIds(prev=>{const n=new Set(prev);ids.forEach(id=>n.delete(id));return n;}),700);}
      prevLen.current=loaded.length;setMessages(loaded);
      setTimeout(()=>dummy.current?.scrollIntoView({behavior:'smooth'}),80);
      if(username)snap.docs.forEach(ds=>{const d=ds.data();if(d.senderName!==username&&!d.readBy?.some(r=>r.name===username)&&!d.deleted)updateDoc(ds.ref,{readBy:arrayUnion({name:username,readAt:Date.now()})}).catch(()=>{});});
    });
    const unTyp=onSnapshot(getTypRef(),snap=>{const now=Date.now(),active=[];snap.forEach(d=>{if(d.id!==username){const dd=d.data();if(now-dd.timestamp<3000)active.push(dd.displayName);}});setTypingUsers(active);});
    return()=>{unMsg();unTyp();};
  },[username,isLoggedIn,roomCode]);

  const showToast=(msg,type='success')=>setToast({msg,type});

  const changeTheme=(key)=>{setThemeName(key);localStorage.setItem('chat_theme',key);};

  /* ── AUTH ── */
  const handleLogin=async(e)=>{
    e.preventDefault();setLoginError('');
    const name=loginName.trim(),pass=loginPass.trim();
    if(!name||!pass){setLoginError('Please fill in both fields.');return;}
    setLoginLoading(true);
    try{
      const ref=doc(db,'chat_users',name.toLowerCase());const snap=await getDoc(ref);
      if(snap.exists()){if(snap.data().password===pass)completeLogin(name);else setLoginError('Incorrect password.');}
      else{await setDoc(ref,{username:name,password:pass,createdAt:serverTimestamp()});completeLogin(name);}
    }catch{setLoginError('Connection error. Please retry.');}
    finally{setLoginLoading(false);}
  };

  const completeLogin=(name)=>{
    setUsername(name);setIsLoggedIn(true);
    localStorage.setItem('chat_app_user',JSON.stringify({username:name}));
    setLoginName('');setLoginPass('');
    if(pendingRoom){setRoomCode(pendingRoom);setPendingRoom(null);setScreen('chat');}else setScreen('rooms');
  };

  const handleLogout=()=>{localStorage.removeItem('chat_app_user');setIsLoggedIn(false);setUsername('');setRoomCode(null);setScreen('login');};

  const handleJoinRoom=(e)=>{e.preventDefault();const code=roomInput.trim().toLowerCase();if(!code)return;if(!isLoggedIn){setPendingRoom(code);return;}setRoomCode(code);setScreen('chat');};
  const joinPublicRoom=()=>{if(!isLoggedIn){setPendingRoom('public');return;}setRoomCode('public');setScreen('chat');};
  const exitRoom=()=>{setRoomCode(null);setMessages([]);setRoomInput('');setScreen('rooms');};

  const getMessageTime=(ts)=>{if(!ts)return '···';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});};

  const handleTyping=(e)=>{setNewMessage(e.target.value);if(!isLoggedIn||!username||!roomCode)return;const ref=doc(getTypRef(),username);setDoc(ref,{displayName:username,timestamp:Date.now()});if(typRef.current)clearTimeout(typRef.current);typRef.current=setTimeout(()=>deleteDoc(ref),2000);};

  const handleImageSelect=async(e)=>{const file=e.target.files[0];if(!file)return;if(file.size>10000000){showToast('Max 10MB','error');return;}try{const c=await compressImage(file);if(c.length>1000000){showToast('Image too complex','error');return;}setImagePreview(c);setVideoPreview(null);}catch{showToast('Failed to load image','error');}if(fileRef.current)fileRef.current.value='';};

  const handleVideoSelect=async(e)=>{const file=e.target.files[0];if(!file)return;if(file.size>15000000){showToast('Max 15MB video','error');return;}const reader=new FileReader();reader.onload=ev=>{setVideoPreview(ev.target.result);setImagePreview(null);};reader.readAsDataURL(file);if(vidRef.current)vidRef.current.value='';};

  const sendMessage=async(e)=>{
    e.preventDefault();const text=newMessage.trim();
    if((!text&&!imagePreview&&!videoPreview)||!firebaseUser||!isLoggedIn||!roomCode||sending)return;
    setSending(true);if(typRef.current)clearTimeout(typRef.current);deleteDoc(doc(getTypRef(),username));
    const t=newMessage,img=imagePreview,vid=videoPreview,rep=replyingTo;
    setNewMessage('');setImagePreview(null);setVideoPreview(null);setReplyingTo(null);
    if(fileRef.current)fileRef.current.value='';if(vidRef.current)vidRef.current.value='';
    try{await addDoc(getMsgsRef(),{text:t,image:img||null,video:vid||null,createdAt:serverTimestamp(),senderName:username,displayName:username,photoURL:`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,readBy:[],deleted:false,deletedFor:[],replyTo:rep?{id:rep.id,text:rep.text||(rep.image?'📷 Photo':rep.video?'🎥 Video':'Message'),displayName:rep.displayName}:null});}
    catch{showToast('Failed to send','error');setNewMessage(t);setImagePreview(img);setVideoPreview(vid);setReplyingTo(rep);}
    finally{setSending(false);inputRef.current?.focus();}
  };

  const handleAdminDelete=async(id)=>{if(isAdmin&&window.confirm('Permanently delete?'))try{await deleteDoc(doc(getMsgsRef(),id));}catch{showToast('Delete failed','error');}};
  const handleSoftDelete=async(id,mode)=>{const ref=doc(getMsgsRef(),id);try{if(mode==='forAll'){await updateDoc(ref,{deleted:true,text:'',image:null,video:null});showToast('Deleted for everyone','info');}else{await updateDoc(ref,{deletedFor:arrayUnion(username)});showToast('Hidden for you','info');}}catch{showToast('Could not delete','error');}};
  const clearChat=async()=>{if(!isAdmin||!window.confirm('Clear ALL messages?'))return;const snap=await getDocs(query(getMsgsRef()));snap.forEach(d=>deleteDoc(d.ref));showToast('Chat cleared','info');};
  const toggleAdmin=()=>{if(isAdmin){setIsAdmin(false);showToast('Admin OFF','info');return;}const pw=window.prompt('Admin password:');if(pw==='admin123'){setIsAdmin(true);showToast('Admin ON 🔓','success');}else if(pw!==null)showToast('Wrong password','error');};
  const addEmoji=(e)=>{setNewMessage(prev=>prev+e);inputRef.current?.focus();};

  /* ── STYLE HELPERS ── */
  const focusIn=e=>{e.target.style.borderColor=th.accent;e.target.style.boxShadow=`0 0 0 3px ${th.accent}25`;e.target.style.background=th.btnGlass;};
  const focusOut=e=>{e.target.style.borderColor=th.inputBorder;e.target.style.boxShadow='none';e.target.style.background=th.inputBg;};
  const T={
    page:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',padding:16,position:'relative',overflow:'hidden',background:th.bgGrad},
    card:{background:th.card,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',border:`1px solid ${th.cardBorder}`,borderRadius:24,padding:32,width:'100%',maxWidth:380,boxShadow:'0 32px 80px rgba(0,0,0,.5)',position:'relative',zIndex:10,animation:'fadeScale .35s cubic-bezier(.34,1.56,.64,1) forwards'},
    input:{background:th.inputBg,border:`1px solid ${th.inputBorder}`,borderRadius:12,padding:'11px 14px 11px 40px',color:th.inputText,fontSize:14,fontFamily:'inherit',width:'100%',outline:'none',transition:'all .2s',boxSizing:'border-box'},
    btnPrimary:{background:th.accentGrad,border:'none',borderRadius:12,color:'#fff',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',padding:'12px 16px',width:'100%',boxShadow:`0 4px 20px ${th.accent}40`,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8},
    divLine:{flex:1,height:1,background:th.divider},
  };

  /* ══ SCREEN: LOGIN — EDUCATIONAL DESIGN ══ */
  if (screen === 'login') return (
    <div style={{ ...T.page, justifyContent:'flex-start', paddingTop:0 }}>
      {toast&&<Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Theme toggle top-right */}
      <div style={{ position:'absolute',top:14,right:14,zIndex:50 }}>
        <button onClick={()=>setShowTheme(v=>!v)} style={{ width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:th.card,border:`1px solid ${th.cardBorder}`,cursor:'pointer',fontSize:18 }} title="Change Theme">{th.icon}</button>
        {showTheme&&<ThemePicker current={themeName} onChange={changeTheme} onClose={()=>setShowTheme(false)} th={th}/>}
      </div>

      {/* ── HERO HEADER ── */}
      <div style={{ width:'100%',background:th.accentGrad,padding:'32px 20px 60px',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-40,left:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.06)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-60,right:-30,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none' }}/>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12 }}>
          <div style={{ width:44,height:44,borderRadius:13,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',animation:'floatY 3s ease-in-out infinite' }}>
            <GraduationCap size={26} style={{ color:'#fff' }}/>
          </div>
          <span style={{ color:'rgba(255,255,255,.9)',fontSize:22,fontWeight:800,letterSpacing:-.5 }}>StudyBox</span>
        </div>
        <h1 style={{ color:'#fff',fontSize:26,fontWeight:800,margin:'0 0 8px',letterSpacing:-.5 }}>Your Study Hub 📚</h1>
        <p style={{ color:'rgba(255,255,255,.75)',fontSize:14,margin:0 }}>Connect, collaborate and chat with your study group</p>

        {/* Stats bar */}
        <div style={{ display:'flex',justifyContent:'center',gap:24,marginTop:20 }}>
          {[{icon:<Users size={14}/>,val:'1.2k',label:'Students'},{icon:<MessageSquare size={14}/>,val:'24/7',label:'Active'},{icon:<Star size={14}/>,val:'4.9★',label:'Rated'}].map((s,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ display:'flex',alignItems:'center',gap:4,color:'rgba(255,255,255,.8)',fontSize:11,justifyContent:'center',marginBottom:2 }}>{s.icon}<span style={{ fontWeight:700,fontSize:15 }}>{s.val}</span></div>
              <span style={{ color:'rgba(255,255,255,.55)',fontSize:10 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LOGIN CARD (overlapping) ── */}
      <div style={{ width:'100%',maxWidth:400,padding:'0 16px',marginTop:-30,zIndex:10,position:'relative' }}>
        <div style={{ background:th.card,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',border:`1px solid ${th.cardBorder}`,borderRadius:22,padding:'28px 24px',boxShadow:'0 24px 60px rgba(0,0,0,.4)',animation:'fadeScale .35s cubic-bezier(.34,1.56,.64,1) forwards' }}>
          <h2 style={{ color:th.text,fontSize:17,fontWeight:800,margin:'0 0 4px' }}>Sign in to StudyBox</h2>
          <p style={{ color:th.textMuted,fontSize:12,margin:'0 0 18px' }}>New here? Your account is created automatically.</p>
          <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <div style={{ position:'relative' }}>
              <User size={14} style={{ position:'absolute',left:12,top:13,color:th.placeholder,pointerEvents:'none' }}/>
              <input autoFocus value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Your name / Student ID" style={{ ...T.input,fontSize:13 }} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            <div style={{ position:'relative' }}>
              <Key size={14} style={{ position:'absolute',left:12,top:13,color:th.placeholder,pointerEvents:'none' }}/>
              <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Create or enter password" style={{ ...T.input,fontSize:13 }} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            {loginError&&<div style={{ padding:'8px 12px',borderRadius:9,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',fontSize:12,fontWeight:600 }}>{loginError}</div>}
            <button type="submit" disabled={loginLoading} style={{ ...T.btnPrimary,opacity:loginLoading?.7:1,fontSize:13 }}>
              {loginLoading?<span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'block' }}/>:<><Zap size={14}/>Enter StudyBox</>}
            </button>
          </form>

          {/* Features row */}
          <div style={{ display:'flex',gap:8,marginTop:14 }}>
            {[{emoji:'🔒',text:'Private rooms'},{emoji:'📸',text:'Share media'},{emoji:'⚡',text:'Instant'},{emoji:'🎨',text:'Themes'}].map((f,i)=>(
              <div key={i} style={{ flex:1,textAlign:'center',padding:'7px 4px',borderRadius:10,background:th.inputBg,border:`1px solid ${th.divider}` }}>
                <div style={{ fontSize:14 }}>{f.emoji}</div>
                <div style={{ color:th.textMuted,fontSize:9,fontWeight:600,marginTop:2 }}>{f.text}</div>
              </div>
            ))}
          </div>

          {/* Private room pre-fill */}
          <div style={{ marginTop:16,display:'flex',alignItems:'center',gap:10 }}><div style={T.divLine}/><span style={{ color:th.textMuted,fontSize:10,whiteSpace:'nowrap' }}>JOIN A STUDY ROOM</span><div style={T.divLine}/></div>
          <form onSubmit={e=>{e.preventDefault();const c=roomInput.trim().toLowerCase();if(c)setPendingRoom(c);}} style={{ display:'flex',gap:8,marginTop:10 }}>
            <div style={{ position:'relative',flex:1 }}>
              <Hash size={12} style={{ position:'absolute',left:10,top:12,color:th.placeholder,pointerEvents:'none' }}/>
              <input value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Room code or class code..." style={{ ...T.input,paddingLeft:28,paddingTop:9,paddingBottom:9,fontSize:12 }} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            <button type="submit" style={{ background:th.accentGrad,border:'none',borderRadius:11,color:'#fff',padding:'9px 13px',cursor:'pointer',display:'flex',alignItems:'center' }}><ArrowRight size={14}/></button>
          </form>
          {pendingRoom&&<div style={{ marginTop:7,padding:'7px 11px',borderRadius:8,background:`${th.accent}18`,border:`1px solid ${th.accent}35`,color:th.accentLight,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:5 }}><ShieldCheck size={11}/> Will join <b style={{ marginLeft:2 }}>#{pendingRoom}</b> after login</div>}
        </div>
      </div>

      {/* Footer note */}
      <p style={{ color:th.textMuted,fontSize:11,marginTop:16,textAlign:'center' }}>No email · No sign-up · Just enter a name & password ✨</p>
    </div>
  );

  /* ══ SCREEN: ROOMS ══ */
  if (screen === 'rooms') return (
    <div style={T.page}>
      {toast&&<Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {showTheme&&<ThemePicker current={themeName} onChange={changeTheme} onClose={()=>setShowTheme(false)} th={th}/>}
      <div style={{ position:'absolute',top:'30%',right:'20%',width:280,height:280,borderRadius:'50%',background:`radial-gradient(circle,${th.accent}12 0%,transparent 70%)`,filter:'blur(40px)',pointerEvents:'none' }}/>
      <div style={T.card}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:3 }}>
              <GraduationCap size={18} style={{ color:th.accentLight }}/>
              <h2 style={{ color:th.text,fontSize:17,fontWeight:800,margin:0 }}>StudyBox</h2>
            </div>
            <p style={{ color:th.textMuted,fontSize:12,margin:0 }}>Hey <span style={{ color:th.accentLight,fontWeight:700 }}>{username}</span> 👋 Where to?</p>
          </div>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            <button onClick={()=>setShowTheme(v=>!v)} style={{ width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}`,cursor:'pointer',fontSize:16 }} title="Change Theme">{th.icon}</button>
            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`} alt="av" style={{ width:40,height:40,borderRadius:'50%',boxShadow:`0 0 0 2px ${th.accent}60` }}/>
          </div>
        </div>
        <label style={{ fontSize:10,fontWeight:700,color:th.textMuted,display:'flex',alignItems:'center',gap:5,marginBottom:7,letterSpacing:.5 }}><Lock size={10}/> PRIVATE STUDY ROOM</label>
        <form onSubmit={handleJoinRoom} style={{ display:'flex',gap:8,marginBottom:18 }}>
          <div style={{ position:'relative',flex:1 }}>
            <Hash size={13} style={{ position:'absolute',left:11,top:13,color:th.placeholder,pointerEvents:'none' }}/>
            <input autoFocus value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Enter room or class code..." style={T.input} onFocus={focusIn} onBlur={focusOut}/>
          </div>
          <button type="submit" disabled={!roomInput.trim()} style={{ background:th.accentGrad,border:'none',borderRadius:12,color:'#fff',padding:'11px 14px',cursor:'pointer',display:'flex',alignItems:'center',opacity:roomInput.trim()?1:.45 }}><ArrowRight size={16}/></button>
        </form>
        <div style={{ display:'flex',alignItems:'center',gap:12,margin:'16px 0' }}><div style={T.divLine}/><span style={{ color:th.textMuted,fontSize:10 }}>OR</span><div style={T.divLine}/></div>
        <button onClick={joinPublicRoom}
          style={{ width:'100%',padding:'13px 14px',borderRadius:14,display:'flex',alignItems:'center',gap:11,cursor:'pointer',background:`rgba(59,130,246,.09)`,border:'1px solid rgba(59,130,246,.2)',transition:'all .2s',marginBottom:10 }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,.16)';e.currentTarget.style.transform='translateY(-1px)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(59,130,246,.09)';e.currentTarget.style.transform='translateY(0)';}}
        >
          <div style={{ width:38,height:38,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#3b82f6,#2563eb)',flexShrink:0 }}><Globe size={16} style={{ color:'#fff' }}/></div>
          <div style={{ textAlign:'left',flex:1 }}>
            <p style={{ color:th.text,fontWeight:700,fontSize:13,margin:0 }}>Open Study Hall</p>
            <p style={{ color:th.textMuted,fontSize:11,marginTop:2 }}>Public chat — open to all students</p>
          </div>
          <ArrowRight size={13} style={{ color:th.textMuted }}/>
        </button>
        <button onClick={handleLogout}
          style={{ width:'100%',padding:'9px 14px',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',gap:7,cursor:'pointer',background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.1)',color:'rgba(239,68,68,.7)',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.13)';e.currentTarget.style.color='#f87171';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,.06)';e.currentTarget.style.color='rgba(239,68,68,.7)';}}
        ><LogOut size={13}/> Sign Out</button>
      </div>
    </div>
  );

  /* ══ SCREEN: CHAT ══ */
  const isPublic=roomCode==='public';
  const hasMedia=!!imagePreview||!!videoPreview;

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:th.bg,position:'relative' }}>
      {toast&&<Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {showTheme&&<ThemePicker current={themeName} onChange={changeTheme} onClose={()=>setShowTheme(false)} th={th}/>}
      <div style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'80%',height:'40%',background:`radial-gradient(ellipse,${th.accent}08 0%,transparent 70%)`,filter:'blur(40px)',pointerEvents:'none',zIndex:0 }}/>

      {/* ══ HEADER ══ */}
      <header style={{ background:th.header,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderBottom:`1px solid ${th.divider}`,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:20,position:'relative' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          {/* ── EXIT BUTTON — PROMINENT ── */}
          <button onClick={exitRoom}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:10,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.22)',cursor:'pointer',transition:'all .2s',color:'#f87171',fontFamily:'inherit',fontWeight:700,fontSize:12 }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.2)';e.currentTarget.style.transform='scale(1.03)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,.1)';e.currentTarget.style.transform='scale(1)';}}
            title="Leave Room"
          >
            <ArrowLeft size={14}/><span>Leave</span>
          </button>

          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:isPublic?'linear-gradient(135deg,#3b82f6,#2563eb)':th.accentGrad }}>
              {isPublic?<Globe size={15} style={{ color:'#fff' }}/>:<Lock size={15} style={{ color:'#fff' }}/>}
            </div>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                <h1 style={{ color:th.text,fontSize:13,fontWeight:800,margin:0 }}>{isPublic?'Open Study Hall':roomCode==='brosis123'?'Private History':`#${roomCode}`}</h1>
                <span style={{ fontSize:9,padding:'2px 5px',borderRadius:5,fontWeight:700,background:`${th.accent}20`,color:th.accentLight,border:`1px solid ${th.accent}35` }}>{isPublic?'PUBLIC':'PRIVATE'}</span>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:5,marginTop:2 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 5px rgba(34,197,94,.6)',display:'inline-block' }}/>
                <span style={{ color:'#22c55e',fontSize:10,fontWeight:600 }}>{username}</span>
                <span style={{ color:th.textMuted,fontSize:10 }}>· {messages.filter(m=>!m.deleted&&!m.deletedFor?.includes(username)).length} msgs</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          {/* Theme picker */}
          <button onClick={()=>setShowTheme(v=>!v)} style={{ width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}`,cursor:'pointer',fontSize:15 }} title="Change Theme">{th.icon}</button>
          {isAdmin&&<button onClick={clearChat} style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 9px',borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}><XCircle size={11}/>Clear</button>}
          <button onClick={toggleAdmin} style={{ width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s',background:isAdmin?'rgba(251,191,36,.15)':th.btnGlass,border:isAdmin?'1px solid rgba(251,191,36,.3)':`1px solid ${th.btnGlassBorder}` }}>
            {isAdmin?<Unlock size={13} style={{ color:'#fbbf24' }}/>:<Lock size={13} style={{ color:th.iconMuted }}/>}
          </button>
          <button onClick={handleLogout} style={{ width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.15)',cursor:'pointer' }}>
            <LogOut size={13} style={{ color:'#f87171' }}/>
          </button>
        </div>
      </header>

      {/* ══ MESSAGES ══ */}
      <main style={{ flex:1,overflowY:'auto',padding:'14px 12px',display:'flex',flexDirection:'column',gap:11,position:'relative',zIndex:1,background:th.bg }}>
        {messages.length===0&&(
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',paddingBottom:60,animation:'fadeUp .4s ease forwards' }}>
            <div style={{ width:60,height:60,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,background:`${th.accent}12`,border:`1px solid ${th.accent}22` }}>
              <MessageSquare size={26} style={{ color:`${th.accent}90` }}/>
            </div>
            <p style={{ color:th.text,fontWeight:700,fontSize:14,margin:0 }}>No messages yet</p>
            <p style={{ color:th.textMuted,fontSize:12,marginTop:6 }}>Start the conversation! Right-click any message for options 💬</p>
          </div>
        )}
        {messages.map(msg=>(
          <MessageBubble key={msg.id} msg={msg} isMe={msg.senderName===username} username={username}
            isAdmin={isAdmin} onDelete={handleAdminDelete} onSoftDelete={handleSoftDelete} onReply={setReplyingTo}
            getMessageTime={getMessageTime} isNew={newMsgIds.has(msg.id)} th={th}/>
        ))}
        {typingUsers.length>0&&(
          <div style={{ display:'flex',justifyContent:'flex-start',animation:'fadeUp .3s ease' }}>
            <div style={{ display:'flex',alignItems:'flex-end',gap:7 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass }}><User size={12} style={{ color:th.iconMuted }}/></div>
              <div style={{ display:'flex',alignItems:'center',gap:5,padding:'9px 13px',borderRadius:17,borderBottomLeftRadius:4,background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}` }}>
                <div style={{ display:'flex',gap:3 }}>{[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:'50%',background:`${th.accent}B0`,display:'block',animation:'typDot 1.4s ease infinite',animationDelay:`${i*.2}s` }}/>)}</div>
                <span style={{ fontSize:11,color:th.textMuted,marginLeft:3 }}>{typingUsers.join(', ')} typing</span>
              </div>
            </div>
          </div>
        )}
        <div ref={dummy}/>
      </main>

      {/* ══ FOOTER ══ */}
      <div style={{ background:th.footer,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:`1px solid ${th.divider}`,position:'relative',zIndex:10 }}>
        {hasMedia&&(
          <div style={{ padding:'8px 14px',display:'flex',alignItems:'center',gap:11,borderBottom:`1px solid ${th.divider}`,animation:'slideUp .22s ease' }}>
            {imagePreview&&<img src={imagePreview} alt="preview" style={{ width:48,height:48,borderRadius:9,objectFit:'cover',border:`1px solid ${th.cardBorder}` }}/>}
            {videoPreview&&<div style={{ width:48,height:48,borderRadius:9,background:th.btnGlass,border:`1px solid ${th.cardBorder}`,display:'flex',alignItems:'center',justifyContent:'center' }}><Video size={18} style={{ color:th.accentLight }}/></div>}
            <div style={{ flex:1 }}>
              <p style={{ color:th.text,fontSize:12,fontWeight:700,margin:0 }}>{imagePreview?'Image':'Video'} attached</p>
              <p style={{ color:th.textMuted,fontSize:11,marginTop:2 }}>Ready to send</p>
            </div>
            <button onClick={()=>{setImagePreview(null);setVideoPreview(null);}} style={{ width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:'none',cursor:'pointer' }}><X size={12} style={{ color:th.iconMuted }}/></button>
          </div>
        )}
        {replyingTo&&(
          <div style={{ padding:'8px 14px',display:'flex',alignItems:'center',gap:11,borderBottom:`1px solid ${th.divider}`,animation:'slideUp .22s ease' }}>
            <div style={{ flex:1,paddingLeft:11,borderLeft:`3px solid ${th.accent}`,background:`${th.accent}10`,borderRadius:'0 8px 8px 0',padding:'5px 9px 5px 11px' }}>
              <p style={{ color:th.accentLight,fontSize:11,fontWeight:700,margin:0 }}>Replying to {replyingTo.displayName}</p>
              <p style={{ color:th.textMuted,fontSize:11,marginTop:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis' }}>{replyingTo.text||'📷 Media'}</p>
            </div>
            <button onClick={()=>setReplyingTo(null)} style={{ width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:'none',cursor:'pointer' }}><X size={12} style={{ color:th.iconMuted }}/></button>
          </div>
        )}
        {showEmoji&&<div style={{ position:'relative',padding:'0 12px' }}><EmojiPicker onSelect={addEmoji} onClose={()=>setShowEmoji(false)} th={th}/></div>}
        <div style={{ padding:'10px 12px' }}>
          <form onSubmit={sendMessage} style={{ display:'flex',alignItems:'flex-end',gap:6,maxWidth:920,margin:'0 auto' }}>
            <input type="file" ref={fileRef} onChange={handleImageSelect} style={{ display:'none' }} accept="image/*"/>
            <input type="file" ref={vidRef}  onChange={handleVideoSelect} style={{ display:'none' }} accept="video/*"/>
            <button type="button" onClick={()=>fileRef.current?.click()} title="Share Image"
              style={{ width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}`,cursor:'pointer',flexShrink:0,transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=th.inputBg} onMouseLeave={e=>e.currentTarget.style.background=th.btnGlass}
            ><ImageIcon size={15} style={{ color:th.iconMuted }}/></button>
            <button type="button" onClick={()=>vidRef.current?.click()} title="Share Video"
              style={{ width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',background:th.btnGlass,border:`1px solid ${th.btnGlassBorder}`,cursor:'pointer',flexShrink:0,transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=th.inputBg} onMouseLeave={e=>e.currentTarget.style.background=th.btnGlass}
            ><Video size={15} style={{ color:th.iconMuted }}/></button>
            <button type="button" onClick={()=>setShowEmoji(v=>!v)}
              style={{ width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all .2s',background:showEmoji?`${th.accent}25`:th.btnGlass,border:showEmoji?`1px solid ${th.accent}50`:`1px solid ${th.btnGlassBorder}` }}
            ><span style={{ fontSize:17,lineHeight:1 }}>😊</span></button>
            <textarea ref={inputRef} value={newMessage} onChange={handleTyping}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(e);}}}
              placeholder={replyingTo?`Reply to ${replyingTo.displayName}...`:`Message #${roomCode}...`}
              rows={1}
              style={{ flex:1,background:th.inputBg,border:`1px solid ${th.inputBorder}`,borderRadius:13,padding:'10px 13px',color:th.inputText,fontSize:14,fontFamily:'inherit',resize:'none',maxHeight:100,outline:'none',transition:'all .2s',lineHeight:1.5,overflowY:'auto' }}
              onFocus={focusIn} onBlur={focusOut}
              onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px';}}
            />
            <button type="submit" disabled={!newMessage.trim()&&!hasMedia}
              style={{ width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',cursor:(newMessage.trim()||hasMedia)?'pointer':'not-allowed',flexShrink:0,border:'none',transition:'all .25s',background:(newMessage.trim()||hasMedia)?th.accentGrad:'rgba(255,255,255,.06)',boxShadow:(newMessage.trim()||hasMedia)?`0 4px 20px ${th.accent}50`:'none',transform:(newMessage.trim()||hasMedia)?'scale(1)':'scale(.94)' }}>
              {sending?<span style={{ width:15,height:15,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'block' }}/>:<Send size={15} style={{ color:(newMessage.trim()||hasMedia)?'#fff':th.iconMuted,marginLeft:1 }}/>}
            </button>
          </form>
          <p style={{ textAlign:'center',fontSize:10,color:th.textMuted,opacity:.5,marginTop:5 }}>Enter to send · Shift+Enter for new line · Right-click message for options</p>
        </div>
      </div>
    </div>
  );
}
