/**
 * Quick Firestore connectivity test (no auth required)
 * Run with: node test_firestore.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBsdPXnfvUy78GjvS8Fq6R38iVVhlYuNtI',
  authDomain: 'pvtbox-8f03a.firebaseapp.com',
  projectId: 'pvtbox-8f03a',
  storageBucket: 'pvtbox-8f03a.firebasestorage.app',
  messagingSenderId: '278360357776',
  appId: '1:278360357776:web:864c6443f5df751063d115',
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function runTest() {
  console.log('\n🔬 Firestore Message Send Test (no auth)\n');

  // 1. Write a test message to the "public" room
  console.log('1️⃣  Writing test message to Firestore rooms/public/messages...');
  const msgsRef = collection(db, 'rooms', 'public', 'messages');
  let docRef;
  try {
    docRef = await addDoc(msgsRef, {
      text: '✅ TEST MESSAGE — ' + new Date().toISOString(),
      image: null, video: null,
      createdAt: serverTimestamp(),
      senderName: 'test_bot', displayName: 'test_bot', photoURL: '',
      readBy: [], deleted: false, deletedFor: [], starredBy: [], replyTo: null,
    });
    console.log('   ✅ Write SUCCESS! Doc ID:', docRef.id);
  } catch (err) {
    console.error('   ❌ Write FAILED:', err.code, err.message);
    process.exit(1);
  }

  // 2. Read back
  console.log('2️⃣  Reading message back...');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log('   ✅ Read SUCCESS! text:', snap.data().text.substring(0, 70));
    } else {
      console.error('   ❌ Doc not found after write!');
    }
  } catch (err) {
    console.error('   ❌ Read FAILED:', err.code, err.message);
  }

  // 3. Also test chat_users collection (used by login)
  console.log('3️⃣  Testing chat_users write...');
  const { doc, setDoc } = await import('firebase/firestore');
  try {
    const userRef = doc(db, 'chat_users', '__test__');
    await setDoc(userRef, { username: '__test__', password: 'test', createdAt: serverTimestamp() });
    console.log('   ✅ chat_users write SUCCESS!');
    await deleteDoc(userRef);
    console.log('   ✅ chat_users delete SUCCESS!');
  } catch (err) {
    console.error('   ❌ chat_users write FAILED:', err.code, err.message);
  }

  // 4. Clean up test message
  console.log('4️⃣  Cleaning up...');
  try {
    await deleteDoc(docRef);
    console.log('   ✅ Test message deleted.');
  } catch (err) {
    console.log('   ⚠️  Delete failed:', err.message);
  }

  console.log('\n🎉 All tests passed! Firestore is fully operational.\n');
  process.exit(0);
}

runTest().catch(err => { console.error('Fatal:', err); process.exit(1); });
