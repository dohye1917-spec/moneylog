import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ensureUserProfile, getRealtimeUserProfile } from "../lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // error: Firebase 설정 자체가 잘못된 치명적 오류 (전체 화면 안내로 처리)
  const [error, setError] = useState(null);
  // signInError: 로그인 시도 중 발생한 일시적 오류 (팝업 차단 등, 로그인 화면에서 재시도 가능)
  const [signInError, setSignInError] = useState(null);

  // 구글 로그인 상태만 관찰한다. 로그인이 안 되어 있으면 user는 null로 유지되고,
  // App은 이때 로그인 화면을 보여준다 (자동 익명 로그인 없음).
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await ensureUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            email: firebaseUser.email,
          });
        } catch (err) {
          console.error("유저 프로필 생성 실패:", err);
          setError(err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = getRealtimeUserProfile(user.uid, setProfile);
    return () => unsubProfile();
  }, [user]);

  const signInWithGoogle = async () => {
    setSignInError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("구글 로그인 실패:", err);
      setSignInError(err);
    }
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, signInError, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있어요.");
  return ctx;
}
