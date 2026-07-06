import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ---------------------------------------------------------------------------
// transactions (지출 내역)
// ---------------------------------------------------------------------------

/**
 * 새로운 지출 내역을 Firestore에 신규 등록한다.
 * data: { userId, shareId, amount, category, emoji, color, date, memo }
 */
export async function addTransaction(data) {
  const ref = await addDoc(collection(db, "transactions"), {
    userId: data.userId,
    shareId: data.shareId,
    amount: Number(data.amount) || 0,
    category: data.category,
    emoji: data.emoji || "🧾",
    color: data.color || "#F0F0F0",
    memo: data.memo || "",
    date: data.date instanceof Date ? Timestamp.fromDate(data.date) : serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransaction(id, data) {
  await updateDoc(doc(db, "transactions", id), data);
}

export async function deleteTransaction(id) {
  await deleteDoc(doc(db, "transactions", id));
}

/**
 * shareId를 공유하는 유저들 간에 지출 내역이 실시간으로 동기화되도록
 * onSnapshot 기반 구독을 걸고, 변경될 때마다 callback(list)을 호출한다.
 * 반환값은 구독 해제 함수(unsubscribe)이다.
 */
export function getRealtimeTransactions(shareId, callback) {
  const q = query(
    collection(db, "transactions"),
    where("shareId", "==", shareId),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ---------------------------------------------------------------------------
// categories (유저 커스텀 카테고리) - 프리미엄 전용 기능
// ---------------------------------------------------------------------------

export async function addCustomCategory(shareId, category) {
  const ref = await addDoc(collection(db, "categories"), {
    shareId,
    name: category.name,
    emoji: category.emoji,
    color: category.color,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteCustomCategory(id) {
  await deleteDoc(doc(db, "categories", id));
}

export function getRealtimeCategories(shareId, callback) {
  const q = query(collection(db, "categories"), where("shareId", "==", shareId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ---------------------------------------------------------------------------
// recurringPayments (정기 결제 알림)
// ---------------------------------------------------------------------------

export async function addRecurringPayment(data) {
  const ref = await addDoc(collection(db, "recurringPayments"), {
    userId: data.userId,
    shareId: data.shareId,
    name: data.name,
    amount: Number(data.amount) || 0,
    emoji: data.emoji || "🔁",
    color: data.color || "#FFF3B0",
    dayOfMonth: Number(data.dayOfMonth) || 1,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRecurringPayment(id, data) {
  await updateDoc(doc(db, "recurringPayments", id), data);
}

export async function deleteRecurringPayment(id) {
  await deleteDoc(doc(db, "recurringPayments", id));
}

export function getRealtimeRecurringPayments(shareId, callback) {
  const q = query(collection(db, "recurringPayments"), where("shareId", "==", shareId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ---------------------------------------------------------------------------
// installments (카드 할부) - 실제 트랜잭션은 생성하지 않고 조회 시 계산만 함
// ---------------------------------------------------------------------------

export async function addInstallment(data) {
  const ref = await addDoc(collection(db, "installments"), {
    userId: data.userId,
    shareId: data.shareId,
    name: data.name,
    totalAmount: Number(data.totalAmount) || 0,
    months: Number(data.months) || 1,
    startYearMonth: data.startYearMonth,
    category: data.category || data.name,
    emoji: data.emoji || "💳",
    color: data.color || "#E3D9FF",
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteInstallment(id) {
  await deleteDoc(doc(db, "installments", id));
}

export function getRealtimeInstallments(shareId, callback) {
  const q = query(collection(db, "installments"), where("shareId", "==", shareId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ---------------------------------------------------------------------------
// budgets (카테고리별 월 예산) - 문서 ID가 shareId 자체인 단일 문서
// ---------------------------------------------------------------------------

/**
 * 카테고리 하나의 예산만 갱신한다. setDoc(merge)를 얕은 병합으로 쓰면
 * amounts 맵 전체가 덮어써져 다른 카테고리 예산이 사라지므로,
 * 반드시 현재 값을 읽어와 병합한 뒤 다시 써야 한다.
 */
export async function setBudget(shareId, categoryName, amount) {
  const ref = doc(db, "budgets", shareId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data().amounts || {} : {};
  await setDoc(ref, {
    shareId,
    amounts: { ...current, [categoryName]: Number(amount) || 0 },
    updatedAt: serverTimestamp(),
  });
}

export function getRealtimeBudget(shareId, callback) {
  return onSnapshot(doc(db, "budgets", shareId), (snap) => {
    callback(snap.exists() ? snap.data() : { amounts: {} });
  });
}

// ---------------------------------------------------------------------------
// users (유저 프로필: isPremium, shareId)
// ---------------------------------------------------------------------------

/**
 * 구글 로그인 성공 후 최초 1회 users/{uid} 문서를 만든다.
 * 이미 있는 유저라면 구글 프로필(이름/사진)이 바뀐 경우에만 갱신한다.
 */
export async function ensureUserProfile(uid, googleProfile = {}) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const { displayName = "", photoURL = "", email = "" } = googleProfile;

  if (!snap.exists()) {
    const data = {
      uid,
      isPremium: false,
      shareId: uid,
      displayName,
      photoURL,
      email,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    return data;
  }

  const existing = snap.data();
  const updates = {};
  if (displayName && displayName !== existing.displayName) updates.displayName = displayName;
  if (photoURL && photoURL !== existing.photoURL) updates.photoURL = photoURL;
  if (Object.keys(updates).length > 0) {
    await updateDoc(ref, updates);
    return { ...existing, ...updates };
  }
  return existing;
}

export function getRealtimeUserProfile(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

/**
 * 공유 코드(상대방의 uid)를 입력해 내 shareId를 상대방과 동일하게 맞춘다.
 * 이후 getRealtimeTransactions(shareId)를 호출하면 두 사람의 내역이 합쳐져서 보인다.
 */
export async function joinShare(uid, shareCode) {
  const code = shareCode.trim();
  if (!code) throw new Error("공유 코드를 입력해주세요.");
  const targetSnap = await getDoc(doc(db, "users", code));
  if (!targetSnap.exists()) throw new Error("존재하지 않는 공유 코드예요.");
  await updateDoc(doc(db, "users", uid), { shareId: code });
  return code;
}

export async function leaveShare(uid) {
  await updateDoc(doc(db, "users", uid), { shareId: uid });
}

export async function setPremium(uid, isPremium) {
  await updateDoc(doc(db, "users", uid), { isPremium });
}
