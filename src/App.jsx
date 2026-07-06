import { useEffect, useState } from "react";
import { Wallet, AlertTriangle } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import {
  getRealtimeTransactions,
  getRealtimeCategories,
  getRealtimeRecurringPayments,
  getRealtimeInstallments,
  addTransaction,
  updateRecurringPayment,
} from "./lib/firestore";
import { computeMissedOccurrences, toYearMonth, previousYearMonth } from "./lib/recurring";
import LoginScreen from "./components/LoginScreen";
import AddScreen from "./components/AddScreen";
import TransactionList from "./components/TransactionList";
import StatsChart from "./components/StatsChart";
import RecurringPayments from "./components/RecurringPayments";
import ShareBudget from "./components/ShareBudget";
import SettingsScreen from "./components/SettingsScreen";
import BottomNav from "./components/BottomNav";

function describeFatalError(error) {
  if (!error) return null;
  if (error.code === "unavailable") {
    return (
      <>
        <b>Firestore Database가 아직 생성되지 않았을 가능성이 높아요.</b> Firebase 콘솔 → 왼쪽 메뉴{" "}
        <b>Firestore Database</b> → "데이터베이스 만들기"를 눌러 생성한 뒤 새로고침해주세요.
        <br />
        (이미 만들었다면 방화벽/광고 차단 확장 프로그램이 firestore.googleapis.com 요청을 막고 있는지도 확인해주세요)
      </>
    );
  }
  if (error.code === "permission-denied") {
    return (
      <>
        Firestore <b>보안 규칙</b>이 아직 배포되지 않았어요. 이 저장소의 <code>firestore.rules</code> 내용을
        Firebase 콘솔 → Firestore Database → 규칙 탭에 붙여넣고 배포해주세요.
      </>
    );
  }
  if (error.code === "failed-precondition") {
    return (
      <>
        <b>Firestore 복합 인덱스가 아직 만들어지지 않았어요.</b> 아래 에러 메시지 안에 있는{" "}
        <b>"색인을 만드세요" 링크(https://console.firebase.google.com/... 로 시작)</b>를 눌러 인덱스를 생성하고,
        몇 분 뒤 새로고침해주세요.
      </>
    );
  }
  return (
    <>
      Firebase 콘솔에서 <b>Authentication → Sign-in method → Google</b>을 활성화하고,
      <b> Firestore Database</b>를 생성했는지 확인해주세요.
      <br />
      (자세한 설정 방법은 README.md 참고)
    </>
  );
}

export default function App() {
  const { user, profile, loading, error, signInError, signInWithGoogle, signOut } = useAuth();
  const [tab, setTab] = useState("home");
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [installments, setInstallments] = useState([]);
  // 실시간 구독 실패(권한 오류, 복합 인덱스 미생성 등)는 onSnapshot이 콘솔에만
  // 로그를 남기고 화면엔 아무 표시가 없어 "저장은 되는데 목록엔 안 뜬다"처럼
  // 보이므로, 실제 에러를 잡아 화면에 노출한다.
  const [dataError, setDataError] = useState(null);

  const shareId = profile?.shareId || user?.uid;

  useEffect(() => {
    if (!shareId) return;
    const unsub = getRealtimeTransactions(shareId, setTransactions, setDataError);
    return () => unsub();
  }, [shareId]);

  useEffect(() => {
    if (!shareId) return;
    const unsub = getRealtimeCategories(shareId, setCustomCategories, setDataError);
    return () => unsub();
  }, [shareId]);

  useEffect(() => {
    if (!shareId) return;
    const unsub = getRealtimeRecurringPayments(shareId, setRecurringItems, setDataError);
    return () => unsub();
  }, [shareId]);

  useEffect(() => {
    if (!shareId) return;
    const unsub = getRealtimeInstallments(shareId, setInstallments, setDataError);
    return () => unsub();
  }, [shareId]);

  // 정기 결제(고정지출)가 등록된 dayOfMonth를 이미 지났는데 아직 실제 지출로
  // 기록되지 않은 달이 있으면 자동으로 생성한다. 백엔드가 없어 클라이언트에서
  // 처리하며, lastGeneratedYearMonth로 중복 생성을 막는다(마운트 가드를 쓰지
  // 않는 이유: 앱을 며칠 안 켜도 밀린 달을 전부 따라잡아야 하기 때문).
  useEffect(() => {
    if (!shareId || recurringItems.length === 0) return;
    (async () => {
      const today = new Date();
      for (const item of recurringItems) {
        if (!item.active) continue;
        const createdAtDate = item.createdAt?.toDate?.() ?? today;
        const fromYearMonth = item.lastGeneratedYearMonth ?? previousYearMonth(toYearMonth(createdAtDate));
        const missed = computeMissedOccurrences(item.dayOfMonth, fromYearMonth, today).filter(
          (occ) => occ.targetDate >= createdAtDate
        );
        if (missed.length === 0) continue;

        for (const occ of missed) {
          await addTransaction({
            userId: item.userId,
            shareId,
            amount: item.amount,
            category: item.name,
            emoji: item.emoji,
            color: item.color,
            date: occ.targetDate,
            memo: "정기결제 자동 기록",
          });
        }
        await updateRecurringPayment(item.id, {
          lastGeneratedYearMonth: missed[missed.length - 1].yearMonth,
        });
      }
    })();
  }, [shareId, recurringItems]);

  const fatalError = error || dataError;
  if (fatalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F0] px-6">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Firebase 연결에 문제가 있어요</p>
          <p className="text-xs text-slate-500 leading-relaxed">{describeFatalError(fatalError)}</p>
          <p className="text-[11px] text-slate-400 font-mono break-all">{fatalError.message}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F0]">
        <p className="text-slate-400 text-sm">가계부 불러오는 중...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} error={signInError} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F0]">
        <p className="text-slate-400 text-sm">프로필 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF6F0] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-slate-700" />
            머니로그
          </h1>
          <button
            onClick={() => setTab("settings")}
            className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0"
          >
            {profile.photoURL && (
              <img src={profile.photoURL} alt={profile.displayName || "프로필"} className="w-full h-full object-cover" />
            )}
          </button>
        </header>

        {tab === "home" && (
          <div className="space-y-8">
            <AddScreen
              user={user}
              profile={profile}
              customCategories={customCategories}
            />
            <TransactionList transactions={transactions} />
          </div>
        )}

        {tab === "stats" && (
          <StatsChart
            transactions={transactions}
            installments={installments}
            customCategories={customCategories}
            shareId={shareId}
          />
        )}
        {tab === "recurring" && <RecurringPayments shareId={shareId} />}
        {tab === "share" && <ShareBudget user={user} profile={profile} />}
        {tab === "settings" && (
          <SettingsScreen user={user} profile={profile} onSignOut={signOut} />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
