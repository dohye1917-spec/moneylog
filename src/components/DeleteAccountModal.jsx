import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { deleteAccount } from "../lib/account";

export default function DeleteAccountModal({ open, onClose, user, profile }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const isSharing = profile?.shareId && profile.shareId !== user?.uid;

  const handleDelete = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteAccount(user.uid, profile?.shareId || user.uid);
      // 성공하면 Firebase Auth 상태가 바뀌면서 앱이 자동으로 로그인 화면으로 돌아간다.
    } catch (err) {
      console.error("계정 탈퇴 실패:", err);
      setError(
        err.code === "auth/popup-closed-by-user"
          ? "재로그인 창을 닫으셨어요. 탈퇴를 계속하려면 다시 시도해주세요."
          : "탈퇴에 실패했어요. 잠시 후 다시 시도해주세요."
      );
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> 계정을 탈퇴할까요?
          </h2>
          <button onClick={onClose} disabled={busy} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-1.5">
          <p className="text-sm text-rose-700 leading-relaxed">
            지출 내역, 정기결제, 카드 할부, 프로필 정보가 <b>영구 삭제되며 복구할 수 없어요.</b>
          </p>
          {isSharing && (
            <p className="text-xs text-rose-600 leading-relaxed">
              공유 가계부를 함께 쓰는 중이라, 공유 카테고리/예산은 상대방을 위해 남겨두고
              내가 직접 등록한 지출·정기결제·할부만 삭제돼요.
            </p>
          )}
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold py-3 hover:bg-slate-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex-1 rounded-2xl bg-rose-500 text-white text-sm font-semibold py-3 hover:bg-rose-600 disabled:opacity-50"
          >
            {busy ? "탈퇴하는 중..." : "탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
