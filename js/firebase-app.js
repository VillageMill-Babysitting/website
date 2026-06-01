/**
 * VILLAGE MILL BABYSITTING — firebase-app.js
 * Firebase initialization + Auth utilities shared across all pages
 */
import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCCAKmUR4-ko-bwMM7SfvSagzPaIiDV3kc",
  authDomain:        "carter-s-babysitting.firebaseapp.com",
  projectId:         "carter-s-babysitting",
  storageBucket:     "carter-s-babysitting.firebasestorage.app",
  messagingSenderId: "200758055707",
  appId:             "1:200758055707:web:e88542bb32703cf81839be",
  measurementId:     "G-753GYWT8Y5"
};

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth      = getAuth(app);
const db        = getFirestore(app);
const gProvider = new GoogleAuthProvider();

/* ── Auth helpers ─────────────────────────────────────────────────────────── */
export async function loginEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred;
}

export async function loginGoogle() {
  return signInWithPopup(auth, gProvider);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  return signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ── Firestore: Bookings ──────────────────────────────────────────────────── */
export async function submitBooking(data) {
  return addDoc(collection(db, 'bookings'), {
    ...data,
    createdAt: serverTimestamp(),
    status:    'pending'
  });
}

export async function getUserBookings(uid) {
  const q   = query(collection(db, 'bookings'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function cancelBooking(bookingId) {
  return updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
}

/* ── Firestore: Reviews ───────────────────────────────────────────────────── */
export async function submitReview(data) {
  return addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getAllReviews() {
  const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export { auth, db, app };

/* ── Firestore: Babysitters ─────────────────────────────────────────────── */
export async function getBabysitters() {
  const snap = await getDocs(
    query(
      collection(db, 'babysitters'),
      orderBy('order', 'asc')
    )
  );

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}
