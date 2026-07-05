import { useState } from "react";
import { Copy, Users, LogOut } from "lucide-react";
import { joinShare, leaveShare } from "../lib/firestore";

export default function ShareBudget({ user, profile }) {
  const [code, setCode] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const isSharing = profile?.shareId && profile.shareId !== user?.uid;
  const myCode = user?.uid || "";

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
      await joinShare(user.uid, code.trim());
      showToast("연동 완료! 이제 가계부를 함께 써요 🎉");
      setCode("");
    } catch (err) {
      showToast(err.message || "연동에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      await leaveShare(user.uid);
      showToast("공유를 해제했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <Users className="w-4 h-4" /> 내 공유 코드
        </h2>
        <p className="text-xs text-slate-400">
          이 코드를 커플/가족에게 알려주면 같은 가계부를 함께 쓸 수 있어요.
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

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700">공유 코드로 연동하기</h2>
        {isSharing ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              현재 공유 가계부를 사용 중이에요. (공유 ID: <span className="font-mono">{profile.shareId}</span>)
            </p>
            <button
              onClick={handleLeave}
              disabled={busy}
              className="w-full flex items-center justify-center gap-1 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" /> 내 가계부로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="상대방 공유 코드 입력"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              onClick={handleJoin}
              disabled={busy}
              className="rounded-xl bg-slate-900 text-white text-sm font-semibold px-4 hover:bg-slate-800 disabled:opacity-50"
            >
              연동
            </button>
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
