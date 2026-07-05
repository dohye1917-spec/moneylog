import { initializeApp } from "firebase/app";
import { isSupported, getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYQjfz_vGm1GgeApp-1s1OiShoTEaRPxM",
  authDomain: "money-management-f5202.firebaseapp.com",
  projectId: "money-management-f5202",
  storageBucket: "money-management-f5202.firebasestorage.app",
  messagingSenderId: "301431228727",
  appId: "1:301431228727:web:d014b39b61bbb48459b2b2",
  measurementId: "G-2QF8V1NJDF",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics는 브라우저 환경(웹)에서만 지원되고 앱(Capacitor 웹뷰)에서는
// 지원되지 않을 수 있으므로 isSupported()로 확인 후 초기화한다.
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
