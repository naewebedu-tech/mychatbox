import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Lock, Unlock, User, XCircle, Eye, Reply, X, LogOut, Key,
  Hash, ArrowRight, ShieldCheck, Globe, ArrowLeft, Check, Download,
  Trash2, Video, Image as ImageIcon, AlertCircle, Copy, Forward,
  Star, Search, GraduationCap, Users, MessageSquare, Zap, MoreVertical
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, setDoc, getDoc, updateDoc,
  arrayUnion, arrayRemove, deleteDoc, getDocs, doc, query,
  orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

/* ──────────── FIREBASE ──────────── */
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

/* ──────────── THEMES ──────────── */
const THEMES = {
  dark: {
    id:'dark', name:'Dark', icon:'\uD83C\uDF19',
    bg:'#0d0d14', chatBg:'#0d0d14',
    bgGrad:'linear-gradient(160deg,#0d0d14 0%,#111128 100%)',
    card:'rgba(255,255,255,.05)', cardBorder:'rgba(255,255,255,.1)',
    header:'rgba(13,13,20,.96)', footer:'rgba(13,13,20,.97)',
    text:'#f1f0ff', textMuted:'rgba(255,255,255,.42)',
    accent:'#7c3aed', accentLight:'#a78bfa',
    accentGrad:'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleMe:'linear-gradient(135deg,#7c3aed,#5b21b6)',
    bubbleMeText:'#fff',
    bubbleThem:'rgba(255,255,255,.07)', bubbleThemBorder:'rgba(255,255,255,.1)',
    bubbleThemText:'#f1f0ff',
    inputBg:'rgba(255,255,255,.06)', inputBorder:'rgba(255,255,255,.12)',
    inputText:'#f1f0ff', placeholder:'rgba(255,255,255,.3)',
    iconMuted:'rgba(255,255,255,.4)',
    glass:'rgba(255,255,255,.07)', glassBorder:'rgba(255,255,255,.1)',
    divider:'rgba(255,255,255,.07)',
    glow:'rgba(124,58,237,.35)', dateBg:'rgba(255,255,255,.08)',
    dateText:'rgba(255,255,255,.5)', starColor:'#fbbf24',
  },
  light: {
    id:'light', name:'Light', icon:'\u2600\uFE0F',
    bg:'#f0f2f5', chatBg:'#e5ddd5',
    bgGrad:'linear-gradient(160deg,#f0f2f5 0%,#e8eaf0 100%)',
    card:'#fff', cardBorder:'rgba(0,0,0,.1)',
    header:'rgba(255,255,255,.97)', footer:'rgba(255,255,255,.97)',
    text:'#111b21', textMuted:'rgba(0,0,0,.5)',
    accent:'#075e54', accentLight:'#128c7e',
    accentGrad:'linear-gradient(135deg,#075e54,#128c7e)',
    bubbleMe:'#dcf8c6', bubbleMeText:'#111b21',
    bubbleThem:'#ffffff', bubbleThemBorder:'rgba(0,0,0,.08)',
    bubbleThemText:'#111b21',
    inputBg:'rgba(0,0,0,.04)', inputBorder:'rgba(0,0,0,.12)',
    inputText:'#111b21', placeholder:'rgba(0,0,0,.38)',
    iconMuted:'rgba(0,0,0,.45)',
    glass:'rgba(0,0,0,.04)', glassBorder:'rgba(0,0,0,.1)',
    divider:'rgba(0,0,0,.08)',
    glow:'rgba(7,94,84,.2)', dateBg:'rgba(255,255,255,.8)',
    dateText:'rgba(0,0,0,.55)', starColor:'#f59e0b',
  },
  ocean: {
    id:'ocean', name:'Ocean', icon:'\uD83C\uDF0A',
    bg:'#020b14', chatBg:'#020b14',
    bgGrad:'linear-gradient(160deg,#020b14 0%,#041824 100%)',
    card:'rgba(6,182,212,.07)', cardBorder:'rgba(6,182,212,.22)',
    header:'rgba(2,11,20,.96)', footer:'rgba(2,11,20,.97)',
    text:'#cffafe', textMuted:'rgba(207,250,254,.42)',
    accent:'#0891b2', accentLight:'#22d3ee',
    accentGrad:'linear-gradient(135deg,#0e7490,#0891b2)',
    bubbleMe:'linear-gradient(135deg,#0e7490,#0891b2)',
    bubbleMeText:'#fff',
    bubbleThem:'rgba(6,182,212,.1)', bubbleThemBorder:'rgba(6,182,212,.22)',
    bubbleThemText:'#cffafe',
    inputBg:'rgba(6,182,212,.07)', inputBorder:'rgba(6,182,212,.22)',
    inputText:'#cffafe', placeholder:'rgba(207,250,254,.32)',
    iconMuted:'rgba(207,250,254,.45)',
    glass:'rgba(6,182,212,.09)', glassBorder:'rgba(6,182,212,.2)',
    divider:'rgba(6,182,212,.12)',
    glow:'rgba(8,145,178,.35)', dateBg:'rgba(6,182,212,.15)',
    dateText:'rgba(207,250,254,.6)', starColor:'#fbbf24',
  },
  forest: {
    id:'forest', name:'Forest', icon:'\uD83C\uDF3F',
    bg:'#040f08', chatBg:'#040f08',
    bgGrad:'linear-gradient(160deg,#040f08 0%,#071810 100%)',
    card:'rgba(34,197,94,.06)', cardBorder:'rgba(34,197,94,.2)',
    header:'rgba(4,15,8,.96)', footer:'rgba(4,15,8,.97)',
    text:'#dcfce7', textMuted:'rgba(220,252,231,.42)',
    accent:'#16a34a', accentLight:'#4ade80',
    accentGrad:'linear-gradient(135deg,#15803d,#16a34a)',
    bubbleMe:'linear-gradient(135deg,#15803d,#16a34a)',
    bubbleMeText:'#fff',
    bubbleThem:'rgba(34,197,94,.09)', bubbleThemBorder:'rgba(34,197,94,.2)',
    bubbleThemText:'#dcfce7',
    inputBg:'rgba(34,197,94,.06)', inputBorder:'rgba(34,197,94,.2)',
    inputText:'#dcfce7', placeholder:'rgba(220,252,231,.32)',
    iconMuted:'rgba(220,252,231,.45)',
    glass:'rgba(34,197,94,.08)', glassBorder:'rgba(34,197,94,.18)',
    divider:'rgba(34,197,94,.12)',
    glow:'rgba(22,163,74,.35)', dateBg:'rgba(34,197,94,.15)',
    dateText:'rgba(220,252,231,.6)', starColor:'#fbbf24',
  },
};

/* ──────────── HELPERS ──────────── */
const NAME_COLORS = ['#f87171','#fb923c','#fbbf24','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6'];
const getNameColor = (name) => {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
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
      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
      else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
  };
});

const dlFile = (src, name) => {
  const a = document.createElement('a'); a.href = src; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

const getDateLabel = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - msgDay) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' });
};

const getTime = (ts) => {
  if (!ts) return '...';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
};

// Universally-supported emojis (hardcoded safe set)
const EMOJIS = ["😀","😂","😍","😘","😎","😢","😡","😮","😕","😣","👍","👎","❤️","🔥","✨","🎉","💯","🙏","💪","👀","🤣","😅","🙌","🌟","💛","💚","💜","💙","🎵","✅"];

/* ──────────── SMALL COMPONENTS ──────────── */

const Spinner = ({ size = 16, color = '#fff' }) => (
  <span style={{ width: size, height: size, border: `2px solid ${color}30`, borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'waSpin 0.7s linear infinite', flexShrink: 0 }}/>
);

const DoubleCheck = ({ reads, accentLight, isLight }) => {
  const color = reads > 0 ? '#53bdeb' : (isLight ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.5)');
  return (
    <span style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
      <Check size={11} style={{ color, strokeWidth:3 }}/>
      <Check size={11} style={{ color, strokeWidth:3, marginLeft:-6 }}/>
    </span>
  );
};

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const clr = { success:'#22c55e', error:'#ef4444', info:'#60a5fa', warning:'#fbbf24' };
  return (
    <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', zIndex:500,
      display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:24,
      fontSize:13, fontWeight:600, color:'#fff', background:'rgba(30,30,40,.97)',
      backdropFilter:'blur(20px)', border:`1px solid ${clr[type]}40`,
      boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'waFadeUp .25s ease', whiteSpace:'nowrap' }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:clr[type], display:'inline-block', flexShrink:0 }}/>
      {message}
    </div>
  );
};

const EmojiPicker = ({ onSelect, onClose, th }) => (
  <div onClick={e => e.stopPropagation()} style={{
    position:'absolute', bottom:'calc(100% + 8px)', left:0,
    background: th.id === 'light' ? '#fff' : 'rgba(20,20,32,.98)',
    backdropFilter:'blur(30px)', border:`1px solid ${th.cardBorder}`,
    borderRadius:16, padding:10, zIndex:100, display:'flex', flexWrap:'wrap',
    gap:3, width:272, boxShadow:'0 20px 60px rgba(0,0,0,.5)',
    animation:'waFadeUp .18s ease'
  }}>
    {EMOJIS.map((e, i) => (
      <button key={i} onClick={() => { onSelect(e); onClose(); }}
        title={e}
        style={{ width:36, height:36, fontSize:22, border:'none', borderRadius:8, cursor:'pointer',
          background:'transparent', display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform .12s, background .12s', flexShrink:0, fontFamily:'Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif' }}
        onMouseEnter={ev => { ev.currentTarget.style.background=th.glass; ev.currentTarget.style.transform='scale(1.25)'; }}
        onMouseLeave={ev => { ev.currentTarget.style.background='transparent'; ev.currentTarget.style.transform='scale(1)'; }}
      >{e}</button>
    ))}
  </div>
);

const ThemePicker = ({ current, onChange, onClose, th }) => (
  <div style={{ position:'fixed', top:56, right:12, zIndex:300,
    background: th.id === 'light' ? '#fff' : 'rgba(20,20,32,.98)',
    backdropFilter:'blur(30px)', border:`1px solid ${th.cardBorder}`,
    borderRadius:14, padding:8, minWidth:150, boxShadow:'0 16px 48px rgba(0,0,0,.5)',
    animation:'waFadeUp .18s ease' }}>
    <p style={{ color:th.textMuted, fontSize:10, fontWeight:700, margin:'0 8px 6px', letterSpacing:.6 }}>THEME</p>
    {Object.values(THEMES).map(t => (
      <button key={t.id} onClick={() => { onChange(t.id); onClose(); }}
        style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px',
          borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
          fontFamily:'inherit', transition:'all .13s',
          background: current===t.id ? th.accentGrad : 'transparent',
          color: current===t.id ? '#fff' : th.text }}
        onMouseEnter={ev => { if(current!==t.id) ev.currentTarget.style.background=th.glass; }}
        onMouseLeave={ev => { if(current!==t.id) ev.currentTarget.style.background='transparent'; }}
      >
        <span style={{ fontSize:17 }}>{t.icon}</span>{t.name}
        {current===t.id && <Check size={13} style={{ marginLeft:'auto' }}/>}
      </button>
    ))}
  </div>
);

const ImageViewer = ({ src, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.93)', zIndex:600,
    display:'flex', alignItems:'center', justifyContent:'center', animation:'waFadeUp .18s ease' }}>
    <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:10 }}>
      <button onClick={e=>{e.stopPropagation();dlFile(src,'image.jpg');}}
        style={{ width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',cursor:'pointer',color:'#fff' }}>
        <Download size={17}/>
      </button>
      <button onClick={onClose}
        style={{ width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',cursor:'pointer',color:'#fff' }}>
        <X size={17}/>
      </button>
    </div>
    <img src={src} alt="full" onClick={e=>e.stopPropagation()}
      style={{ maxWidth:'90vw', maxHeight:'86vh', objectFit:'contain', borderRadius:10, boxShadow:'0 24px 80px rgba(0,0,0,.8)' }}/>
  </div>
);

const CtxMenu = ({ x, y, items, onClose, th }) => {
  useEffect(() => {
    const h = () => onClose(); document.addEventListener('mousedown', h, true);
    return () => document.removeEventListener('mousedown', h, true);
  }, []);
  const vpW = window.innerWidth, vpH = window.innerHeight;
  const mx = Math.min(x, vpW-190); const my = Math.min(y, vpH-items.filter(Boolean).length*40-20);
  return (
    <div style={{ position:'fixed', top:my, left:mx, zIndex:400, borderRadius:14, overflow:'hidden',
      background: th.id==='light' ? '#fff' : 'rgba(22,22,35,.98)',
      backdropFilter:'blur(30px)', border:`1px solid ${th.cardBorder}`,
      boxShadow:'0 12px 40px rgba(0,0,0,.55)', animation:'waFadeUp .15s ease', minWidth:180 }}>
      {items.map((item, i) => item ? (
        <button key={i} onClick={() => { item.action(); onClose(); }}
          style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px',
            border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:'transparent',
            color: item.danger ? '#ef4444' : th.text, fontFamily:'inherit', transition:'background .12s',
            borderBottom: i < items.filter(Boolean).length-1 ? `1px solid ${th.divider}` : 'none' }}
          onMouseEnter={ev => ev.currentTarget.style.background=th.glass}
          onMouseLeave={ev => ev.currentTarget.style.background='transparent'}
        >{item.icon}<span>{item.label}</span></button>
      ) : null)}
    </div>
  );
};

/* ──────────── DATE SEPARATOR ──────────── */
const DateSep = ({ label, th }) => (
  <div style={{ display:'flex', justifyContent:'center', margin:'6px 0' }}>
    <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
      background:th.dateBg, color:th.dateText }}>{label}</span>
  </div>
);

/* ──────────── MESSAGE BUBBLE ──────────── */
const MsgBubble = React.memo(({ msg, isMe, username, isAdmin, onDelete, onSoftDelete, onReply, isNew, th, onStar, onCopy }) => {
  const [imgView, setImgView] = useState(false);
  const [ctx, setCtx] = useState(null);
  const reads = msg.readBy ? msg.readBy.length : 0;
  const isImg = !!msg.image; const isVid = !!msg.video;
  const deleted = !!msg.deleted;
  const deletedForMe = Array.isArray(msg.deletedFor) && msg.deletedFor.includes(username);
  const starred = Array.isArray(msg.starredBy) && msg.starredBy.includes(username);
  const isLight = th.id === 'light';

  const openCtx = (e) => {
    e.preventDefault(); e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY });
  };

  if (deletedForMe) return null;

  if (deleted) return (
    <div style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', padding:'0 8px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px',
        borderRadius:12, maxWidth:'72%',
        background: isMe ? (isLight?'#dcf8c6':'rgba(124,58,237,.15)') : (isLight?'#fff':th.bubbleThem),
        border:`1px solid ${th.bubbleThemBorder}` }}>
        <AlertCircle size={13} style={{ color:th.textMuted, flexShrink:0 }}/>
        <span style={{ fontSize:13, fontStyle:'italic', color:th.textMuted }}>
          {isMe ? 'You deleted this message' : 'This message was deleted'}
        </span>
      </div>
    </div>
  );

  const menuItems = [
    { icon:<Reply size={14}/>, label:'Reply', action:()=>onReply(msg) },
    msg.text ? { icon:<Copy size={14}/>, label:'Copy Text', action:()=>{ navigator.clipboard?.writeText(msg.text); } } : null,
    { icon:<Star size={14}/>, label: starred?'Unstar':'Star Message', action:()=>onStar(msg.id, starred) },
    (isImg||isVid) ? { icon:<Download size={14}/>, label:'Download', action:()=>isImg?dlFile(msg.image,'image.jpg'):dlFile(msg.video,'video.mp4') } : null,
    null,
    isMe ? { icon:<Trash2 size={14}/>, label:'Delete for Me', danger:false, action:()=>onSoftDelete(msg.id,'forMe') } : null,
    isMe ? { icon:<Trash2 size={14}/>, label:'Delete for Everyone', danger:true, action:()=>onSoftDelete(msg.id,'forAll') } : null,
    isAdmin&&!isMe ? { icon:<XCircle size={14}/>, label:'Remove (Admin)', danger:true, action:()=>onDelete(msg.id) } : null,
  ].filter(Boolean);

  const bubbleBg = isMe
    ? (isLight ? th.bubbleMe : th.bubbleMe)
    : (isLight ? th.bubbleThem : th.bubbleThem);

  const bubbleStyle = {
    maxWidth:'75%', wordBreak:'break-word', lineHeight:1.55,
    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    overflow:'hidden', position:'relative',
    boxShadow: isMe && !isLight ? `0 2px 12px ${th.glow}` : '0 1px 2px rgba(0,0,0,.13)',
    ...(isImg||isVid ? {} : {
      background: isMe ? (isLight?th.bubbleMe:undefined) : bubbleBg,
      backgroundImage: isMe && !isLight ? th.bubbleMe : undefined,
      border: !isMe ? `1px solid ${th.bubbleThemBorder}` : 'none',
      padding:'8px 12px',
    })
  };

  const textColor = isMe ? th.bubbleMeText : th.bubbleThemText;

  return (
    <div className={isNew ? 'wa-msg-in' : ''}
      style={{ display:'flex', flexDirection:'column', alignItems: isMe?'flex-end':'flex-start', padding:'1px 8px', position:'relative' }}
      onContextMenu={openCtx}
    >
      {!isMe && (
        <span style={{ fontSize:11, fontWeight:700, marginLeft:10, marginBottom:3, color:getNameColor(msg.displayName||'User') }}>
          {msg.displayName||'Anonymous'}
        </span>
      )}

      <div style={{ display:'flex', alignItems:'flex-end', gap:6, flexDirection:isMe?'row-reverse':'row', maxWidth:'88%' }}>
        {/* Avatar */}
        <img src={msg.photoURL||'https://api.dicebear.com/9.x/avataaars/svg?seed=user'} alt="av"
          style={{ width:28,height:28,borderRadius:'50%',objectFit:'cover',flexShrink:0,marginBottom:4,
            boxShadow:`0 0 0 2px ${th.accent}50`, display: isMe?'none':'block' }}/>

        <div style={bubbleStyle}>
          {/* Star indicator */}
          {starred && (
            <div style={{ position:'absolute', top:5, left: isMe?5:undefined, right: isMe?undefined:5, opacity:.8 }}>
              <Star size={9} style={{ color:th.starColor, fill:th.starColor }}/>
            </div>
          )}

          {/* Reply Quote */}
          {msg.replyTo && (
            <div style={{ margin:isImg||isVid?'8px 8px 4px':'0 0 6px',
              padding:'5px 10px', borderLeft:`3px solid ${th.accent}`,
              background: isMe&&!isLight ? 'rgba(255,255,255,.12)' : `${th.accent}15`,
              borderRadius:'0 8px 8px 0', fontSize:12 }}>
              <p style={{ fontWeight:700, color: isMe&&!isLight?'rgba(255,255,255,.8)':th.accentLight, margin:'0 0 1px' }}>{msg.replyTo.displayName}</p>
              <p style={{ opacity:.7, margin:0, color:textColor,
                overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{msg.replyTo.text||'\uD83D\uDCF7 Media'}</p>
            </div>
          )}

          {/* Image */}
          {isImg && (
            <div style={{ position:'relative', cursor:'pointer', borderRadius: isMe?'18px 18px 4px 18px':'18px 18px 18px 4px', overflow:'hidden' }} onClick={() => setImgView(true)}>
              <img src={msg.image} alt="img" style={{ display:'block', maxHeight:280, width:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:48,
                background:'linear-gradient(transparent,rgba(0,0,0,.55))' }}/>
              <button onClick={e=>{e.stopPropagation();dlFile(msg.image,'image.jpg');}}
                style={{ position:'absolute',top:8,right:8,padding:'5px 8px',borderRadius:8,
                  background:'rgba(0,0,0,.5)',backdropFilter:'blur(6px)',border:'none',
                  cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}>
                <Download size={11}/> Save
              </button>
            </div>
          )}

          {/* Video */}
          {isVid && (
            <div style={{ position:'relative', borderRadius: isMe?'18px 18px 4px 18px':'18px 18px 18px 4px', overflow:'hidden', maxWidth:300 }}>
              <video src={msg.video} controls style={{ display:'block', width:'100%', maxHeight:240, background:'#000' }}/>
              <button onClick={()=>dlFile(msg.video,'video.mp4')}
                style={{ position:'absolute',top:8,right:8,padding:'5px 8px',borderRadius:8,
                  background:'rgba(0,0,0,.55)',backdropFilter:'blur(6px)',border:'none',
                  cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600 }}>
                <Download size={11}/> Save
              </button>
            </div>
          )}

          {/* Text */}
          {msg.text && (
            <div style={{ padding: isImg||isVid ? '6px 10px 4px' : '0' }}>
              {isImg||isVid ? (
                <span style={{ fontSize:14, color:textColor }}>{msg.text}</span>
              ) : (
                <span style={{ fontSize:14, color:textColor, display:'block', paddingRight: isMe?28:20 }}>{msg.text}</span>
              )}
            </div>
          )}

          {/* Timestamp + status */}
          {!isImg && !isVid && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3,
              marginTop:3, float:'right', marginLeft:8 }}>
              <span style={{ fontSize:10, color: isMe?'rgba(255,255,255,.55)':th.textMuted, whiteSpace:'nowrap' }}>{getTime(msg.createdAt)}</span>
              {isMe && <DoubleCheck reads={reads} accentLight={th.accentLight} isLight={isLight}/>}
            </div>
          )}
          {(isImg||isVid) && msg.text && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3, padding:'0 10px 6px' }}>
              <span style={{ fontSize:10, color: isMe&&!isLight ? 'rgba(255,255,255,.55)' : th.textMuted }}>{getTime(msg.createdAt)}</span>
              {isMe && <DoubleCheck reads={reads} accentLight={th.accentLight} isLight={isLight}/>}
            </div>
          )}
          {(isImg||isVid) && !msg.text && (
            <div style={{ position:'absolute', bottom:10, right:10, display:'flex', alignItems:'center', gap:3,
              padding:'2px 6px', borderRadius:12, background:'rgba(0,0,0,.45)', backdropFilter:'blur(4px)' }}>
              <span style={{ fontSize:10, color:'#fff' }}>{getTime(msg.createdAt)}</span>
              {isMe && <DoubleCheck reads={reads} accentLight={th.accentLight} isLight={false}/>}
            </div>
          )}
        </div>
      </div>

      {ctx && <CtxMenu x={ctx.x} y={ctx.y} items={menuItems} onClose={()=>setCtx(null)} th={th}/>}
      {imgView && <ImageViewer src={msg.image} onClose={()=>setImgView(false)}/>}
    </div>
  );
});

/* ══════════════════════════
   MAIN APP
══════════════════════════ */
export default function App() {
  const [firebaseUser, setFirebaseUser]   = useState(null);
  const [username, setUsername]           = useState('');
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [roomCode, setRoomCode]           = useState(null);
  const [roomInput, setRoomInput]         = useState('');
  const [pendingRoom, setPendingRoom]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [typingUsers, setTypingUsers]     = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [imagePreview, setImagePreview]   = useState(null);
  const [videoPreview, setVideoPreview]   = useState(null);
  const [replyingTo, setReplyingTo]       = useState(null);
  const [isAdmin, setIsAdmin]             = useState(false);
  const [newMsgIds, setNewMsgIds]         = useState(new Set());
  const [showEmoji, setShowEmoji]         = useState(false);
  const [toast, setToast]                 = useState(null);
  const [screen, setScreen]               = useState('login');
  const [loginName, setLoginName]         = useState('');
  const [loginPass, setLoginPass]         = useState('');
  const [loginError, setLoginError]       = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);
  const [themeName, setThemeName]         = useState(() => localStorage.getItem('wa_theme') || 'dark');
  const [showTheme, setShowTheme]         = useState(false);
  const [searchMode, setSearchMode]       = useState(false);
  const [searchQ, setSearchQ]             = useState('');
  const [showMoreMenu, setShowMoreMenu]   = useState(false);

  const th = THEMES[themeName] || THEMES.dark;


  const dummy    = useRef();
  const typRef   = useRef(null);
  const fileRef  = useRef(null);
  const vidRef   = useRef(null);
  const inputRef = useRef(null);
  const prevLen  = useRef(0);
  const lastTypingWrite = useRef(0);

  /* ── PATHS ── */
  const getMsgsRef = useCallback((rc = roomCode) => {
    if (rc === 'brosis123') return collection(db, 'messages');
    if (rc === 'public')    return collection(db, 'rooms', 'public', 'messages');
    return collection(db, 'rooms', rc, 'messages');
  }, [roomCode]);

  const getTypRef = useCallback((rc = roomCode) => {
    if (rc === 'brosis123') return collection(db, 'typing');
    if (rc === 'public')    return collection(db, 'rooms', 'public', 'typing');
    return collection(db, 'rooms', rc, 'typing');
  }, [roomCode]);

  /* ── INIT ── */
  useEffect(() => {
    signInAnonymously(auth).catch(() => setFirebaseUser({ uid: 'g_' + Math.random().toString(36).substr(2,9) }));
    onAuthStateChanged(auth, u => { if (u) setFirebaseUser(u); });
    const saved = localStorage.getItem('chat_app_user');
    if (saved) {
      try { const { username: u } = JSON.parse(saved); setUsername(u); setIsLoggedIn(true); setScreen('rooms'); } catch {}
    }
  }, []);

  /* ── MESSAGES ── */
  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;
    setMessages([]); setTypingUsers([]); prevLen.current = 0;
    const q = query(getMsgsRef(), orderBy('createdAt'));
    const unMsg = onSnapshot(q, snap => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (loaded.length > prevLen.current) {
        const ids = loaded.slice(prevLen.current).map(m => m.id);
        setNewMsgIds(prev => new Set([...prev, ...ids]));
        setTimeout(() => setNewMsgIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; }), 600);
      }
      prevLen.current = loaded.length;
      setMessages(loaded);
      setTimeout(() => dummy.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      if (username) snap.docs.forEach(ds => {
        const d = ds.data();
        if (d.senderName !== username && !d.readBy?.some(r => r.name === username) && !d.deleted)
          updateDoc(ds.ref, { readBy: arrayUnion({ name: username, readAt: Date.now() }) }).catch(() => {});
      });
    });
    const unTyp = onSnapshot(getTypRef(), snap => {
      const now = Date.now(), active = [];
      snap.forEach(d => { if (d.id !== username) { const dd = d.data(); if (now - dd.timestamp < 3500) active.push(dd.displayName); } });
      setTypingUsers(active);
    });
    return () => { unMsg(); unTyp(); };
  }, [username, isLoggedIn, roomCode]);

  const toast$ = (msg, type='info') => setToast({ msg, type });

  const changeTheme = (key) => { setThemeName(key); localStorage.setItem('wa_theme', key); };

  /* ── AUTH ── */
  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    const name = loginName.trim(), pass = loginPass.trim();
    if (!name || !pass) { setLoginError('Please enter both fields.'); return; }
    setLoginLoading(true);
    try {
      const ref = doc(db, 'chat_users', name.toLowerCase());
      const snap = await getDoc(ref);
      if (snap.exists()) {
        if (snap.data().password === pass) completeLogin(name);
        else setLoginError('Incorrect password.');
      } else {
        await setDoc(ref, { username: name, password: pass, createdAt: serverTimestamp() });
        completeLogin(name);
      }
    } catch { setLoginError('Connection error. Try again.'); }
    finally { setLoginLoading(false); }
  };

  const completeLogin = (name) => {
    setUsername(name); setIsLoggedIn(true);
    localStorage.setItem('chat_app_user', JSON.stringify({ username: name }));
    setLoginName(''); setLoginPass('');
    if (pendingRoom) { setRoomCode(pendingRoom); setPendingRoom(null); setScreen('chat'); }
    else setScreen('rooms');
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_app_user');
    setIsLoggedIn(false); setUsername(''); setRoomCode(null); setScreen('login');
  };

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

  const exitRoom = () => {
    setRoomCode(null); setMessages([]); setRoomInput(''); setScreen('rooms');
    setSearchMode(false); setSearchQ('');
  };

  /* ── TYPING ── */
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isLoggedIn || !username || !roomCode) return;

    const now = Date.now();
    if (now - lastTypingWrite.current > 2000) {
      lastTypingWrite.current = now;
      const ref = doc(getTypRef(), username);
      setDoc(ref, { displayName: username, timestamp: now }).catch(() => {});
      if (typRef.current) clearTimeout(typRef.current);
      typRef.current = setTimeout(() => deleteDoc(ref).catch(() => {}), 2200);
    }
  };

  /* ── MEDIA ── */
  const handleImageSelect = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 10000000) { toast$('Max 10MB for images', 'error'); return; }
    try {
      const c = await compressImage(file);
      if (c.length > 1000000) { toast$('Image too large even after compression', 'error'); return; }
      setImagePreview(c); setVideoPreview(null);
    } catch { toast$('Failed to process image', 'error'); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 15000000) { toast$('Max 15MB for videos', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setVideoPreview(ev.target.result); setImagePreview(null); };
    reader.readAsDataURL(file);
    if (vidRef.current) vidRef.current.value = '';
  };

  const sendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = newMessage.trim();
    if ((!text && !imagePreview && !videoPreview) || !isLoggedIn || !roomCode) return;

    // Snapshot values before clearing UI
    const t = text, img = imagePreview, vid = videoPreview, rep = replyingTo;

    // Clear input and previews instantly so user can send another message immediately
    setNewMessage('');
    setImagePreview(null);
    setVideoPreview(null);
    setReplyingTo(null);
    if (fileRef.current) fileRef.current.value = '';
    if (vidRef.current)  vidRef.current.value  = '';
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }

    // Clear typing status
    if (typRef.current) clearTimeout(typRef.current);
    deleteDoc(doc(getTypRef(), username)).catch(() => {});

    // Save to database asynchronously in the background
    addDoc(getMsgsRef(), {
      text: t, image: img || null, video: vid || null,
      createdAt: serverTimestamp(),
      senderName: username, displayName: username,
      photoURL: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + username,
      readBy: [], deleted: false, deletedFor: [], starredBy: [],
      replyTo: rep ? { id: rep.id, text: rep.text || (rep.image ? '\uD83D\uDCF7 Photo' : rep.video ? '\uD83C\uDFAC Video' : 'Message'), displayName: rep.displayName } : null,
    }).catch(err => {
      console.error("Firestore send error:", err);
      toast$('Message failed to send', 'error');
    });

    // Refocus immediately
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── MESSAGE ACTIONS ── */
  const handleAdminDelete = async (id) => {
    if (isAdmin && window.confirm('Delete this message permanently?'))
      try { await deleteDoc(doc(getMsgsRef(), id)); } catch { toast$('Delete failed', 'error'); }
  };

  const handleSoftDelete = async (id, mode) => {
    const ref = doc(getMsgsRef(), id);
    try {
      if (mode === 'forAll') {
        await updateDoc(ref, { deleted: true, text: '', image: null, video: null });
        toast$('Deleted for everyone', 'info');
      } else {
        await updateDoc(ref, { deletedFor: arrayUnion(username) });
        toast$('Message hidden for you', 'info');
      }
    } catch { toast$('Could not delete', 'error'); }
  };

  const handleStar = async (id, isStarred) => {
    const ref = doc(getMsgsRef(), id);
    try {
      if (isStarred) await updateDoc(ref, { starredBy: arrayRemove(username) });
      else await updateDoc(ref, { starredBy: arrayUnion(username) });
    } catch { toast$('Could not star', 'error'); }
  };

  const clearChat = async () => {
    if (!isAdmin || !window.confirm('Clear ALL messages in this room?')) return;
    const snap = await getDocs(query(getMsgsRef()));
    snap.forEach(d => deleteDoc(d.ref));
    toast$('Chat cleared', 'info');
  };

  const toggleAdmin = () => {
    if (isAdmin) { setIsAdmin(false); toast$('Admin mode off', 'info'); return; }
    const pw = window.prompt('Enter admin password:');
    if (pw === 'admin123') { setIsAdmin(true); toast$('Admin mode on', 'success'); }
    else if (pw !== null) toast$('Wrong password', 'error');
  };

  const addEmoji = (e) => {
    setNewMessage(prev => prev + e);
    setShowEmoji(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  /* ── FILTERED MESSAGES (search) ── */
  const visibleMessages = searchMode && searchQ
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQ.toLowerCase()))
    : messages;

  /* ── DATE SEPARATORS ── */
  const withSeparators = [];
  let lastDateLabel = '';
  visibleMessages.forEach(msg => {
    const label = getDateLabel(msg.createdAt);
    if (label && label !== lastDateLabel) {
      withSeparators.push({ type: 'sep', label, id: 'sep_' + label });
      lastDateLabel = label;
    }
    withSeparators.push({ type: 'msg', msg });
  });

  /* ── STYLE HELPERS ── */
  const focusIn  = e => { e.target.style.borderColor = th.accent; e.target.style.boxShadow = '0 0 0 3px ' + th.accent + '22'; };
  const focusOut = e => { e.target.style.borderColor = th.inputBorder; e.target.style.boxShadow = 'none'; };

  const inp = { background:th.inputBg, border:'1px solid ' + th.inputBorder, borderRadius:12,
    padding:'11px 14px 11px 40px', color:th.inputText, fontSize:14,
    fontFamily:'inherit', width:'100%', outline:'none', transition:'border-color .2s, box-shadow .2s', boxSizing:'border-box' };

  const btn1 = { background:th.accentGrad, border:'none', borderRadius:12, color:'#fff',
    fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer',
    padding:'12px 16px', width:'100%', boxShadow:'0 4px 20px ' + th.glow,
    transition:'opacity .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 };

  const themeBtn = { width:34, height:34, borderRadius:10, display:'flex', alignItems:'center',
    justifyContent:'center', background:th.glass, border:'1px solid ' + th.glassBorder,
    cursor:'pointer', fontSize:18 };

  const iconBtn = (active) => ({
    width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
    background: active ? th.accent+'25' : th.glass, border: '1px solid ' + (active ? th.accent+'55' : th.glassBorder),
    cursor:'pointer', flexShrink:0, transition:'all .15s'
  });

  /* ══ LOGIN SCREEN ══ */
  if (screen === 'login') return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:th.bgGrad, fontFamily:'inherit', overflowY:'auto' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div style={{ position:'fixed', top:14, right:14, zIndex:200 }}>
        <button onClick={() => setShowTheme(v => !v)} style={themeBtn} title="Change theme">{th.icon}</button>
        {showTheme && <ThemePicker current={themeName} onChange={changeTheme} onClose={() => setShowTheme(false)} th={th}/>}
      </div>

      {/* Hero */}
      <div style={{ background:th.accentGrad, padding:'40px 20px 64px', textAlign:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {[{t:-50,l:-50,s:220},{t:-30,r:-60,s:180}].map((c,i)=>(
          <div key={i} style={{ position:'absolute', top:c.t, left:c.l, right:c.r, width:c.s, height:c.s, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }}/>
        ))}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:50, height:50, borderRadius:14, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', animation:'waFloat 3s ease-in-out infinite' }}>
            <GraduationCap size={28} style={{ color:'#fff' }}/>
          </div>
          <span style={{ color:'#fff', fontSize:26, fontWeight:800, letterSpacing:-.5 }}>StudyBox</span>
        </div>
        <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 8px' }}>Your Study Chat Hub \uD83D\uDCDA</h1>
        <p style={{ color:'rgba(255,255,255,.75)', fontSize:13, margin:0 }}>Connect with classmates · Share notes · Study together</p>
        <div style={{ display:'flex', justifyContent:'center', gap:28, marginTop:20 }}>
          {[{icon:'\uD83D\uDC65',val:'1.2k',label:'Students'},{icon:'\u26A1',val:'24/7',label:'Online'},{icon:'\u2B50',val:'4.9',label:'Rating'}].map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:18 }}>{s.icon}</div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>{s.val}</div>
              <div style={{ color:'rgba(255,255,255,.6)', fontSize:10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Login card */}
      <div style={{ maxWidth:400, width:'100%', margin:'-28px auto 0', padding:'0 16px 32px', zIndex:10, position:'relative' }}>
        <div style={{ background:th.id==='light'?'#fff':th.card, backdropFilter:'blur(30px)',
          border:'1px solid ' + th.cardBorder, borderRadius:22,
          padding:'26px 22px', boxShadow:'0 20px 60px rgba(0,0,0,.35)', animation:'waFadeUp .35s ease' }}>
          <h2 style={{ color:th.text, fontSize:17, fontWeight:800, margin:'0 0 3px' }}>Sign in to StudyBox</h2>
          <p style={{ color:th.textMuted, fontSize:12, margin:'0 0 16px' }}>New users are registered automatically</p>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ position:'relative' }}>
              <User size={14} style={{ position:'absolute', left:12, top:13, color:th.placeholder, pointerEvents:'none' }}/>
              <input autoFocus value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="Username or Student ID" style={inp} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            <div style={{ position:'relative' }}>
              <Key size={14} style={{ position:'absolute', left:12, top:13, color:th.placeholder, pointerEvents:'none' }}/>
              <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Create or enter your password" style={inp} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            {loginError && <div style={{ padding:'8px 12px', borderRadius:9, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', color:'#f87171', fontSize:12, fontWeight:600 }}>{loginError}</div>}
            <button type="submit" disabled={loginLoading} style={{ ...btn1, opacity:loginLoading?.7:1 }}>
              {loginLoading ? <Spinner size={16}/> : <><Zap size={15}/>Enter StudyBox</>}
            </button>
          </form>

          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            {['\uD83D\uDD12 Private rooms','\uD83D\uDCF8 Media sharing','\uD83D\uDCA1 Reply & Star','\uD83C\uDFA8 Themes'].map((f,i) => (
              <div key={i} style={{ flex:1, textAlign:'center', padding:'7px 3px', borderRadius:10, background:th.glass, border:'1px solid ' + th.glassBorder }}>
                <div style={{ fontSize:11, color:th.textMuted, fontWeight:600, lineHeight:1.4 }}>{f}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0 12px' }}>
            <div style={{ flex:1, height:1, background:th.divider }}/><span style={{ color:th.textMuted, fontSize:10, whiteSpace:'nowrap' }}>JOIN PRIVATE ROOM</span><div style={{ flex:1, height:1, background:th.divider }}/>
          </div>
          <form onSubmit={e=>{e.preventDefault();const c=roomInput.trim().toLowerCase();if(c)setPendingRoom(c);}} style={{ display:'flex', gap:8 }}>
            <div style={{ position:'relative', flex:1 }}>
              <Hash size={12} style={{ position:'absolute', left:10, top:12, color:th.placeholder, pointerEvents:'none' }}/>
              <input value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Class / room code..." style={{ ...inp, paddingLeft:28, paddingTop:9, paddingBottom:9, fontSize:13 }} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            <button type="submit" style={{ background:th.accentGrad, border:'none', borderRadius:11, color:'#fff', padding:'9px 13px', cursor:'pointer', display:'flex', alignItems:'center' }}><ArrowRight size={14}/></button>
          </form>
          {pendingRoom && (
            <div style={{ marginTop:8, padding:'7px 12px', borderRadius:9, background:th.accent+'18', border:'1px solid ' + th.accent+'35', color:th.accentLight, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <ShieldCheck size={12}/> Will enter <b style={{ marginLeft:3 }}>#{pendingRoom}</b> after login
            </div>
          )}
        </div>
        <p style={{ textAlign:'center', color:th.textMuted, fontSize:11, marginTop:12 }}>No email required · Instant access \u2728</p>
      </div>
    </div>
  );

  /* ══ ROOMS SCREEN ══ */
  if (screen === 'rooms') {
    const studyRooms = [
      { code: 'cs-lounge', name: '💻 Computer Science Lounge', desc: 'React, databases, structure design, and system architectures.', members: 42 },
      { code: 'math-hub', name: '📐 Mathematics Hub', desc: 'Calculus, algebra, discrete math, and formula reviews.', members: 28 },
      { code: 'physics-lab', name: '🔬 Physics Lab', desc: 'Classical mechanics, quantum dynamics, and lab reports.', members: 19 },
      { code: 'write-right', name: '📝 Literature & Writing', desc: 'Essay peer-review, citations, grammar guides, and book clubs.', members: 31 },
    ];

    const studyMaterials = [
      { title: 'React & Modern Javascript Cheat Sheet', type: 'PDF Sheet', size: '1.2 MB', desc: 'Core ES6+, Hook rules, and state paradigms.', icon: '⚡' },
      { title: 'Calculus II Integration Techniques', type: 'Formula Sheet', size: '840 KB', desc: 'Integrals, Taylor series, and volume calculations.', icon: '📐' },
      { title: 'Data Structures & Algorithms Cheat Sheet', type: 'PDF Book', size: '2.4 MB', desc: 'Graph, Tree, and Sorting complex patterns.', icon: '🧠' },
      { title: 'Academic Essay Citations Template', type: 'Word Doc', size: '420 KB', desc: 'Standard MLA/APA styling and transition words.', icon: '📄' }
    ];

    const handleDownloadMaterial = (mat) => {
      const fileContent = `StudyBox Educational Resource\n==================================\nTitle: ${mat.title}\nFormat: ${mat.type}\nFile Size: ${mat.size}\nOverview: ${mat.desc}\n\nHappy Learning!\n- The StudyBox Team`;
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      dlFile(url, mat.title.replace(/\s+/g, '_') + '.txt');
      toast$(`Downloaded ${mat.title}`, 'success');
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:th.bgGrad, color:th.text, fontFamily:'inherit', overflowY:'auto', boxSizing:'border-box' }}>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
        {showTheme && <ThemePicker current={themeName} onChange={changeTheme} onClose={() => setShowTheme(false)} th={th}/>}

        {/* Global Dashboard Navigation / Header */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', background:th.header, backdropFilter:'blur(20px)', borderBottom:`1px solid ${th.divider}`, zIndex:50, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:th.accentGrad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 15px ${th.glow}` }}>
              <GraduationCap size={20} style={{ color:'#fff' }}/>
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:850, margin:0, letterSpacing:-.3 }}>StudyBox Hub</h2>
              <p style={{ fontSize:11, color:th.textMuted, margin:0 }}>Welcome back, <span style={{ color:th.accentLight, fontWeight:750 }}>{username}</span> ✨</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setShowTheme(v => !v)} style={themeBtn} title="Select Theme">{th.icon}</button>
            <img src={'https://api.dicebear.com/9.x/avataaars/svg?seed=' + username} alt="av"
              style={{ width:36, height:36, borderRadius:'50%', boxShadow:`0 0 0 2px ${th.accent}70` }}/>
            <button onClick={handleLogout}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:10, border:`1px solid ${th.glassBorder}`, background:th.glass, color:th.text, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = th.glass; e.currentTarget.style.color = th.text; e.currentTarget.style.borderColor = th.glassBorder; }}
            >
              <LogOut size={13}/>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Area */}
        <main style={{ flex:1, width:'100%', maxWidth:1200, margin:'0 auto', padding:'24px 16px 40px', boxSizing:'border-box', display:'flex', flexDirection:'column', gap:28 }}>
          
          {/* Welcome Dashboard Banner */}
          <div style={{ background:th.accentGrad, borderRadius:20, padding:'24px 28px', color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 10px 30px ${th.glow}` }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,.07)' }}/>
            <div style={{ position:'absolute', bottom:-20, left:'30%', width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,.04)' }}/>
            <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 6px' }}>Ready to Ace Your Studies? 🎓</h1>
            <p style={{ opacity:0.85, fontSize:13, margin:'0 0 16px', maxWidth:600 }}>Join a subject-specific study room to collaborate with peers, ask questions, or download helpful materials compiled by students.</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:24 }}>
              <div>
                <span style={{ fontSize:10, textTransform:'uppercase', opacity:0.75, letterSpacing:.8 }}>Current User</span>
                <p style={{ margin:'2px 0 0', fontWeight:800, fontSize:14 }}>{username}</p>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,.2)' }}/>
              <div>
                <span style={{ fontSize:10, textTransform:'uppercase', opacity:0.75, letterSpacing:.8 }}>Active Status</span>
                <p style={{ margin:'2px 0 0', fontWeight:800, fontSize:14, display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/> Studying
                </p>
              </div>
            </div>
          </div>

          {/* Quick Custom Room Join & Search */}
          <div style={{ background: th.id==='light'?'#fff':th.card, border:`1px solid ${th.cardBorder}`, borderRadius:18, padding:20, backdropFilter:'blur(20px)', boxShadow:'0 10px 30px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}><Lock size={14} style={{ color:th.accentLight }}/> Join Custom Private Study Room</h3>
            <form onSubmit={handleJoinRoom} style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              <div style={{ position:'relative', flex:1, minWidth:240 }}>
                <Hash size={14} style={{ position:'absolute', left:14, top:13, color:th.placeholder, pointerEvents:'none' }}/>
                <input autoFocus value={roomInput} onChange={e=>setRoomInput(e.target.value)} placeholder="Type custom room or class code (e.g. project-team-3)..." style={{ ...inp, paddingLeft:36 }} onFocus={focusIn} onBlur={focusOut}/>
              </div>
              <button type="submit" disabled={!roomInput.trim()} 
                style={{ background:th.accentGrad, border:'none', borderRadius:12, color:'#fff', fontWeight:700, padding:'12px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'opacity .2s', opacity:roomInput.trim()?1:.45, boxShadow:`0 4px 15px ${th.glow}` }}>
                <span>Join Room</span>
                <ArrowRight size={16}/>
              </button>
            </form>
          </div>

          {/* Grid Layout: Left Column (Rooms), Right Column (Materials) */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:28 }}>
            
            {/* Study Rooms Column */}
            <div style={{ flex:'1 1 550px', display:'flex', flexDirection:'column', gap:16 }}>
              <h3 style={{ fontSize:16, fontWeight:850, margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Users size={18} style={{ color:th.accentLight }}/>
                <span>Active Study Rooms</span>
              </h3>
              
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
                
                {/* Predefined rooms */}
                {studyRooms.map(rm => (
                  <div key={rm.code} onClick={() => { setRoomCode(rm.code); setScreen('chat'); }}
                    style={{ background: th.id==='light'?'#fff':th.card, border:`1px solid ${th.cardBorder}`, borderRadius:16, padding:20, cursor:'pointer', transition:'all .22s cubic-bezier(0.4, 0, 0.2, 1)', display:'flex', flexDirection:'column', justifyContent:'space-between', gap:12, position:'relative', overflow:'hidden' }}
                    className="wa-room-card"
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = th.accent; e.currentTarget.style.boxShadow = `0 8px 24px ${th.glow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div>
                      <h4 style={{ color:th.text, fontSize:15, fontWeight:800, margin:'0 0 6px' }}>{rm.name}</h4>
                      <p style={{ color:th.textMuted, fontSize:12, lineHeight:1.45, margin:0 }}>{rm.desc}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${th.divider}`, paddingTop:10, marginTop:4 }}>
                      <span style={{ fontSize:11, color:th.textMuted, display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                        {rm.members} Active
                      </span>
                      <span style={{ fontSize:11, color:th.accentLight, fontWeight:800, display:'flex', alignItems:'center', gap:2 }}>
                        Enter Room <ArrowRight size={12}/>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Open Study Hall Room (Public) */}
                <div onClick={joinPublicRoom}
                  style={{ background: 'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.25)', borderRadius:16, padding:20, cursor:'pointer', transition:'all .22s', display:'flex', flexDirection:'column', justifyContent:'space-between', gap:12 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(59,130,246,.14)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(59,130,246,.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center' }}><Globe size={13} style={{ color:'#fff' }}/></div>
                      <h4 style={{ color:th.text, fontSize:15, fontWeight:800, margin:0 }}>Open Study Hall</h4>
                    </div>
                    <p style={{ color:th.textMuted, fontSize:12, lineHeight:1.45, margin:0 }}>Public multi-disciplinary room. Discuss general academic questions and coordinate teams.</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${th.divider}`, paddingTop:10 }}>
                    <span style={{ fontSize:11, color:th.textMuted, display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>
                      105+ Online
                    </span>
                    <span style={{ fontSize:11, color:'#60a5fa', fontWeight:800, display:'flex', alignItems:'center', gap:2 }}>
                      Enter Lounge <ArrowRight size={12}/>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Study Materials Column */}
            <div style={{ flex:'1 1 350px', display:'flex', flexDirection:'column', gap:16 }}>
              <h3 style={{ fontSize:16, fontWeight:850, margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <GraduationCap size={18} style={{ color:th.accentLight }}/>
                <span>Curated Study Materials</span>
              </h3>
              
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {studyMaterials.map((mat, idx) => (
                  <div key={idx}
                    style={{ background: th.id==='light'?'#fff':th.card, border:`1px solid ${th.cardBorder}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, transition:'transform .15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ width:38, height:38, borderRadius:10, background:th.glass, border:`1px solid ${th.glassBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                      {mat.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:9, fontWeight:800, padding:'1px 5px', borderRadius:4, background:th.accent+'22', color:th.accentLight, textTransform:'uppercase' }}>{mat.type}</span>
                        <span style={{ fontSize:9, color:th.textMuted }}>{mat.size}</span>
                      </div>
                      <h4 style={{ color:th.text, fontSize:12, fontWeight:750, margin:'3px 0 1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mat.title}</h4>
                      <p style={{ color:th.textMuted, fontSize:11, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mat.desc}</p>
                    </div>
                    <button onClick={() => handleDownloadMaterial(mat)}
                      style={{ width:32, height:32, borderRadius:8, background:th.glass, border:`1px solid ${th.glassBorder}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:th.text, transition:'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = th.accentGrad; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = th.glass; e.currentTarget.style.color = th.text; }}
                      title="Download resource"
                    >
                      <Download size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    );
  }

  /* ══ CHAT SCREEN ══ */
  const isPublic = roomCode === 'public';
  const hasMedia = !!imagePreview || !!videoPreview;
  const canSend  = (newMessage.trim() || hasMedia);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:th.chatBg, position:'relative', overflow:'hidden' }}
      onClick={() => { if(showTheme) setShowTheme(false); if(showMoreMenu) setShowMoreMenu(false); }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {showTheme && <ThemePicker current={themeName} onChange={changeTheme} onClose={() => setShowTheme(false)} th={th}/>}

      {/* ── HEADER ── */}
      <header style={{ background:th.header, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid ' + th.divider, padding:'9px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        zIndex:30, position:'relative', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* LEAVE BUTTON */}
          <button onClick={exitRoom}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10,
              background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.25)',
              cursor:'pointer', color:'#f87171', fontFamily:'inherit', fontWeight:700, fontSize:12,
              transition:'all .17s', flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.22)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,.12)';}}
          ><ArrowLeft size={14}/> Leave</button>

          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background: isPublic ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : th.accentGrad,
              boxShadow:'0 2px 12px rgba(0,0,0,.25)' }}>
              {isPublic ? <Globe size={17} style={{ color:'#fff' }}/> : <Lock size={17} style={{ color:'#fff' }}/>}
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <h1 style={{ color:th.text, fontSize:14, fontWeight:800, margin:0 }}>
                  {isPublic ? 'Open Study Hall' : roomCode==='brosis123' ? 'Private History' : '#' + roomCode}
                </h1>
                <span style={{ fontSize:9, padding:'2px 6px', borderRadius:6, fontWeight:700, background:th.accent+'22', color:th.accentLight, border:'1px solid ' + th.accent+'40' }}>
                  {isPublic?'PUBLIC':'PRIVATE'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 5px #22c55e80', display:'inline-block' }}/>
                <span style={{ color:'#22c55e', fontSize:10, fontWeight:600 }}>{username}</span>
                <span style={{ color:th.textMuted, fontSize:10 }}>· {messages.filter(m=>!m.deleted&&!m.deletedFor?.includes(username)).length} msgs</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          <button onClick={() => { setSearchMode(v=>!v); setSearchQ(''); }}
            style={{ ...iconBtn(searchMode) }} title="Search messages">
            <Search size={15} style={{ color: searchMode ? th.accentLight : th.iconMuted }}/>
          </button>
          <button onClick={() => setShowTheme(v => !v)} style={{ ...iconBtn(false) }} title="Theme">{th.icon}</button>
          <button onClick={toggleAdmin}
            style={{ ...iconBtn(isAdmin), background: isAdmin ? 'rgba(251,191,36,.2)' : th.glass, border: isAdmin ? '1px solid rgba(251,191,36,.4)' : '1px solid ' + th.glassBorder }}>
            {isAdmin ? <Unlock size={14} style={{ color:'#fbbf24' }}/> : <Lock size={14} style={{ color:th.iconMuted }}/>}
          </button>
          <div style={{ position:'relative' }}>
            <button onClick={e=>{e.stopPropagation();setShowMoreMenu(v=>!v);}} style={{ ...iconBtn(false) }}>
              <MoreVertical size={15} style={{ color:th.iconMuted }}/>
            </button>
            {showMoreMenu && (
              <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:th.id==='light'?'#fff':'rgba(22,22,35,.98)', backdropFilter:'blur(20px)', border:'1px solid ' + th.cardBorder, borderRadius:12, overflow:'hidden', zIndex:200, minWidth:160, boxShadow:'0 12px 40px rgba(0,0,0,.4)', animation:'waFadeUp .15s ease' }}>
                {[
                  { label:'Clear Chat', icon:<XCircle size={13}/>, show:isAdmin, action:clearChat, danger:true },
                  { label:'Sign Out',   icon:<LogOut size={13}/>,   show:true,    action:handleLogout, danger:false },
                ].filter(i=>i.show).map((item,i)=>(
                  <button key={i} onClick={()=>{item.action();setShowMoreMenu(false);}}
                    style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'11px 14px', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:'transparent', color:item.danger?'#f87171':th.text, fontFamily:'inherit', transition:'background .12s' }}
                    onMouseEnter={ev=>ev.currentTarget.style.background=th.glass}
                    onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                  >{item.icon}{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search bar */}
      {searchMode && (
        <div style={{ background:th.header, borderBottom:'1px solid ' + th.divider, padding:'8px 14px', flexShrink:0, animation:'waFadeUp .2s ease' }}>
          <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
            <Search size={14} style={{ position:'absolute', left:11, top:11, color:th.placeholder, pointerEvents:'none' }}/>
            <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              placeholder="Search messages..."
              style={{ ...inp, paddingLeft:32, paddingTop:9, paddingBottom:9, fontSize:13, width:'100%', boxSizing:'border-box', borderRadius:24 }}
              onFocus={focusIn} onBlur={focusOut}/>
            {searchQ && <button onClick={()=>setSearchQ('')} style={{ position:'absolute', right:10, top:9, background:'none', border:'none', cursor:'pointer', color:th.textMuted, display:'flex' }}><X size={15}/></button>}
          </div>
          {searchQ && <p style={{ color:th.textMuted, fontSize:11, marginTop:6, textAlign:'center' }}>{visibleMessages.filter(m=>!m.deleted&&!m.deletedFor?.includes(username)).length} result(s)</p>}
        </div>
      )}

      {/* ── MESSAGES ── */}
      <main style={{ flex:1, overflowY:'auto', padding:'10px 4px', display:'flex', flexDirection:'column', gap:2, position:'relative', zIndex:1 }}>
        {withSeparators.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', paddingBottom:80, animation:'waFadeUp .4s ease' }}>
            <div style={{ width:64, height:64, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, background:th.glass, border:'1px solid ' + th.glassBorder }}>
              <MessageSquare size={28} style={{ color:th.accent + '80' }}/>
            </div>
            <p style={{ color:th.text, fontWeight:700, fontSize:15, margin:0 }}>No messages yet</p>
            <p style={{ color:th.textMuted, fontSize:12, marginTop:6, maxWidth:240 }}>Start the conversation! Right-click any message for options.</p>
          </div>
        )}
        {withSeparators.map(item => item.type === 'sep'
          ? <DateSep key={item.id} label={item.label} th={th}/>
          : <MsgBubble key={item.msg.id} msg={item.msg}
              isMe={item.msg.senderName === username} username={username}
              isAdmin={isAdmin} onDelete={handleAdminDelete} onSoftDelete={handleSoftDelete}
              onReply={setReplyingTo} isNew={newMsgIds.has(item.msg.id)}
              th={th} onStar={handleStar} onCopy={() => {}}/>
        )}
        {typingUsers.length > 0 && (
          <div style={{ display:'flex', padding:'2px 12px', animation:'waFadeUp .3s ease' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:th.glass, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <User size={12} style={{ color:th.iconMuted }}/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 14px', borderRadius:'18px 18px 18px 4px', background:th.id==='light'?'#fff':th.bubbleThem, border:'1px solid ' + th.bubbleThemBorder }}>
                {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:th.accent+'C0', display:'block', animation:'waTypDot 1.4s ease infinite', animationDelay:i*0.2+'s' }}/>)}
                <span style={{ fontSize:11, color:th.textMuted, marginLeft:4 }}>{typingUsers.join(', ')} typing…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={dummy}/>
      </main>

      {/* ── FOOTER ── */}
      <div style={{ background:th.footer, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:'1px solid ' + th.divider, position:'relative', zIndex:20, flexShrink:0 }}>
        {/* Media preview */}
        {hasMedia && (
          <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid ' + th.divider, animation:'waFadeUp .2s ease' }}>
            {imagePreview && <img src={imagePreview} alt="pre" style={{ width:50, height:50, borderRadius:10, objectFit:'cover', border:'1px solid ' + th.glassBorder }}/>}
            {videoPreview && <div style={{ width:50, height:50, borderRadius:10, background:th.glass, border:'1px solid ' + th.glassBorder, display:'flex', alignItems:'center', justifyContent:'center' }}><Video size={20} style={{ color:th.accentLight }}/></div>}
            <div style={{ flex:1 }}>
              <p style={{ color:th.text, fontSize:12, fontWeight:700, margin:0 }}>{imagePreview?'Image':'Video'} ready</p>
              <p style={{ color:th.textMuted, fontSize:11, marginTop:1 }}>Click send to share</p>
            </div>
            <button onClick={() => { setImagePreview(null); setVideoPreview(null); }} style={{ width:26, height:26, borderRadius:'50%', background:th.glass, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={13} style={{ color:th.iconMuted }}/>
            </button>
          </div>
        )}

        {/* Reply preview */}
        {replyingTo && (
          <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid ' + th.divider, animation:'waFadeUp .2s ease' }}>
            <div style={{ flex:1, borderLeft:'3px solid ' + th.accent, paddingLeft:10, background:th.accent+'10', borderRadius:'0 8px 8px 0', padding:'5px 10px 5px 11px' }}>
              <p style={{ color:th.accentLight, fontSize:11, fontWeight:700, margin:0 }}>Reply to {replyingTo.displayName}</p>
              <p style={{ color:th.textMuted, fontSize:11, marginTop:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{replyingTo.text||'\uD83D\uDCF7 Media'}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} style={{ width:26, height:26, borderRadius:'50%', background:th.glass, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={13} style={{ color:th.iconMuted }}/>
            </button>
          </div>
        )}

        {/* Emoji picker anchor */}
        {showEmoji && (
          <div style={{ position:'relative', padding:'0 14px' }}>
            <EmojiPicker onSelect={addEmoji} onClose={() => setShowEmoji(false)} th={th}/>
          </div>
        )}

        <div style={{ padding:'8px 12px 10px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:7, maxWidth:960, margin:'0 auto' }}>
            <input type="file" ref={fileRef} onChange={handleImageSelect} style={{ display:'none' }} accept="image/*"/>
            <input type="file" ref={vidRef}  onChange={handleVideoSelect} style={{ display:'none' }} accept="video/*"/>

            <button type="button" onClick={()=>fileRef.current?.click()} title="Send Image" style={{ ...iconBtn(false), height:40, width:40 }}>
              <ImageIcon size={16} style={{ color:th.iconMuted }}/>
            </button>
            <button type="button" onClick={()=>vidRef.current?.click()} title="Send Video" style={{ ...iconBtn(false), height:40, width:40 }}>
              <Video size={16} style={{ color:th.iconMuted }}/>
            </button>
            <button type="button" onClick={()=>setShowEmoji(v=>!v)} style={{ ...iconBtn(showEmoji), height:40, width:40 }} title="Emoji">
              <span style={{ fontSize:18, lineHeight:1, fontFamily:'Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif' }}>😊</span>
            </button>

            <div style={{ flex:1, position:'relative' }}>
              <textarea ref={inputRef} value={newMessage} onChange={handleTyping}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={replyingTo ? 'Reply to ' + replyingTo.displayName + '...' : 'Message #' + roomCode + '…'}
                rows={1}
                style={{ width:'100%', background:th.inputBg, border:'1px solid ' + th.inputBorder, borderRadius:24, padding:'10px 16px', color:th.inputText, fontSize:14, fontFamily:'inherit', resize:'none', outline:'none', transition:'border-color .2s, box-shadow .2s', lineHeight:1.5, maxHeight:110, overflowY:'auto', boxSizing:'border-box', display:'block' }}
                onFocus={focusIn} onBlur={focusOut}
                onInput={e => { e.target.style.height='auto'; e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'; }}
              />
            </div>

            <button type="button" onClick={sendMessage} disabled={!canSend}
              style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', transition:'all .2s', cursor: canSend ? 'pointer' : 'default',
                background: canSend ? th.accentGrad : th.glass,
                boxShadow: canSend ? '0 4px 16px ' + th.glow : 'none',
                transform: canSend ? 'scale(1)' : 'scale(.92)' }}>
              <Send size={15} style={{ color: canSend ? '#fff' : th.iconMuted, marginLeft:1 }}/>
            </button>
          </div>
          <p style={{ textAlign:'center', fontSize:10, color:th.textMuted, opacity:.45, marginTop:5 }}>
            Enter to send · Shift+Enter for new line · Right-click message for options
          </p>
        </div>
      </div>
    </div>
  );
}
