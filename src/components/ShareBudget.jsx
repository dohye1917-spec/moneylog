import { useEffect, useState } from "react";
import { Copy, Users, LogOut, AlertTriangle } from "lucide-react";
import {
  joinShare,
  leaveShare,
  joinCouple,
  leaveCouple,
  addSharedTransaction,
  deleteSharedTransaction,
  getRealtimeSharedTransactions,
  getRealtimeUserProfile,
} from "../lib/firestore";
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from "../lib/categories";
import CategoryGrid from "./CategoryGrid";
import NumberPad from "./NumberPad";
import TransactionList from "./TransactionList";

const MAX_AMOUNT_DIGITS = 10;

export default function ShareBudget({ user, profile }) {
  const [code, setCode] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [shake, setShake] = useState(false);
  const [sharedTx, setSharedTx] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);

  const myCode = user?.uid || "";
  const coupleId = profile?.coupleId || user?.uid;
  const isLinked = !!(profile?.coupleId && profile.coupleId !== user?.uid);
  // 예전 방식(shareId를 상대방 것으로 통째로 덮어쓰던 방식)의 잔재 — 개인
  // 가계부 전체가 상대방과 섞여 있는 상태라, 별도 안내와 해제 버튼을 보여준다.
  const isLegacySharing = !!(profile?.shareId && profile.shareId !== user?.uid);

  useEffect(() => {
    if (!isLinked) return;
    return getRealtimeSharedTransactions(coupleId, setSharedTx, (err) => {
      console.error(err);
      showToast("최근 내역을 불러오지 못했어요. 새로고침해줘.");
    });
  }, [isLinked, coupleId]);

  useEffect(() => {
    if (!isLinked) {
      setPartnerProfile(null);
      return;
    }
    return getRealtimeUserProfile(coupleId, setPartnerProfile);
  }, [isLinked, coupleId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(myCode);
      showToast("공유 코드를 복사했어요!");
    } catch {
      showToast("복사가 막혔어요. 코드를 직접 선택해서 복사해줘!");
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setBusy(true);
    try {
      await joinCouple(user.uid, code.trim());
      showToast("연동 완료! 이제 공유 가계부를 함께 써요 🎉");
      setCode("");
    } catch (err) {
      showToast(err.message || "연동에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveCouple = async () => {
    setBusy(true);
    try {
      await leaveCouple(user.uid);
      showToast("공유 가계부 연동을 해제했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveLegacy = async () => {
    setBusy(true);
    try {
      await leaveShare(user.uid);
      showToast("이전 방식 공유를 해제했어요. 개인 가계부가 다시 분리됐어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleKeyPress = (key) => {
    if (key === "back") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    setAmount((prev) => {
      const next = (prev + key).replace(/^0+(?=\d)/, "");
      return next.length > MAX_AMOUNT_DIGITS ? prev : next;
    });
  };

  // 3x4 숫자판 탭 입력과 실제 키보드 타이핑(위 input)이 같은 amount 상태를 공유한다.
  const handleAmountChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, MAX_AMOUNT_DIGITS);
    setAmount(digits.replace(/^0+(?=\d)/, ""));
  };

  const handleSelectCategory = async (category) => {
    const value = Number(amount);
    if (!value) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      showToast("먼저 금액을 입력해줘!");
      return;
    }

    try {
      await addSharedTransaction({
        userId: user.uid,
        coupleId,
        amount: value,
        type,
        category: category.name,
        emoji: category.emoji,
        color: category.color,
        date: new Date(),
      });
      setAmount("");
      const sign = type === "income" ? "+" : "-";
      showToast(`${category.emoji} ${category.name} · ${sign}${value.toLocaleString("ko-KR")}원 기록완료!`);
    } catch (err) {
      console.error(err);
      showToast("저장에 실패했어요. 다시 시도해줘.");
    }
  };

  return (
    <div className="space-y-5">
      {isLegacySharing && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
          <p className="text-sm font-bold text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> 예전 방식으로 공유 중이에요
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            공유 ID: <span className="font-mono">{profile.shareId}</span> — 상대방이 내 개인
            가계부 전체를 보게 되는 예전 버전의 문제가 있던 기능이에요. 해제해도 지출
            내역은 사라지지 않아요.
          </p>
          <button
            onClick={handleLeaveLegacy}
            disabled={busy}
            className="w-full rounded-xl border border-amber-300 text-amber-700 text-sm font-semibold py-2 hover:bg-amber-100 disabled:opacity-50"
          >
            이전 방식 공유 해제
          </button>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <Users className="w-4 h-4" /> 내 공유 코드
        </h2>
        <p className="text-xs text-slate-400">
          이 코드를 커플/가족에게 알려주면 공유 가계부를 함께 쓸 수 있어요.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
            {myCode}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </section>

      {!isLinked ? (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">공유 코드로 연동하기</h2>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="상대방 공유 코드 입력"
              className="flex-1 min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              onClick={handleJoin}
              disabled={busy}
              className="shrink-0 rounded-xl bg-slate-900 text-white text-sm font-semibold px-4 hover:bg-slate-800 disabled:opacity-50"
            >
              연동
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            코드를 연동하면 별도의 "공유 가계부"가 새로 생겨요. 각자의 개인 가계부는
            그대로 유지돼요.
          </p>
        </section>
      ) : (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 shrink-0">
                {partnerProfile?.photoURL && (
                  <img
                    src={partnerProfile.photoURL}
                    alt={partnerProfile.displayName || "상대방"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">
                  {partnerProfile?.displayName || "상대방"}
                </p>
                <p className="text-xs text-slate-400 truncate">{partnerProfile?.email || "함께 공유 가계부를 쓰고 있어요"}</p>
              </div>
            </div>
          </section>

          <section className={`bg-white rounded-2xl border border-slate-200 p-5 space-y-4 ${shake ? "animate-pulse" : ""}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">같이 쓰는 내역 추가</h2>
              <button
                onClick={handleLeaveCouple}
                disabled={busy}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" /> 연동 해제
              </button>
            </div>

            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setType("expense")}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  type === "expense" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                지출
              </button>
              <button
                onClick={() => setType("income")}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  type === "income" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                입금
              </button>
            </div>

            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-1">
                {amount && (
                  <span className={`text-4xl font-bold ${type === "income" ? "text-emerald-500" : "text-slate-800"}`}>
                    {type === "income" ? "+" : "-"}
                  </span>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount ? Number(amount).toLocaleString("ko-KR") : ""}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`text-4xl font-bold tabular-nums text-center bg-transparent focus:outline-none min-w-[1.5ch] ${
                    type === "income" ? "text-emerald-500" : "text-slate-800"
                  }`}
                  style={{ width: `${(amount ? Number(amount).toLocaleString("ko-KR").length : 1) + 1}ch` }}
                />
                <span className="text-xl text-slate-400">원</span>
              </div>
            </div>

            <NumberPad onKeyPress={handleKeyPress} />

            <CategoryGrid
              categories={type === "income" ? INCOME_CATEGORIES : DEFAULT_CATEGORIES}
              onSelect={handleSelectCategory}
              onAddCategory={() => showToast("공유 가계부는 기본 카테고리만 사용할 수 있어요.")}
            />
          </section>

          <TransactionList transactions={sharedTx} onDelete={deleteSharedTransaction} />
        </>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
