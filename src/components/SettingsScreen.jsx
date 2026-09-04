import { useEffect, useState } from "react";
import { Crown, LogOut, Sparkles, Check } from "lucide-react";
import { setPremium, updateUserProfile } from "../lib/firestore";
import ProfilePhotoButton from "./ProfilePhotoButton";

export default function SettingsScreen({ user, profile, onSignOut }) {
  const isPremium = !!profile?.isPremium;
  const [name, setName] = useState(profile?.displayName || "");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setName(profile?.displayName || "");
  }, [profile?.displayName]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const handleNameSave = async () => {
    if (!name.trim() || name.trim() === profile?.displayName) return;
    await updateUserProfile(user.uid, { displayName: name.trim() });
    showToast("이름을 변경했어요!");
  };

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <ProfilePhotoButton user={user} profile={profile} size="w-14 h-14" onToast={showToast} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="shrink-0 flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            <LogOut className="w-3.5 h-3.5" /> 로그아웃
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            onClick={handleNameSave}
            disabled={!name.trim() || name.trim() === profile?.displayName}
            className="shrink-0 rounded-xl bg-slate-900 text-white p-2.5 disabled:opacity-30 hover:bg-slate-800"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <Crown className="w-4 h-4 text-amber-500" /> 멤버십
        </h2>
        <div
          className={`rounded-2xl p-4 flex items-center justify-between ${
            isPremium ? "bg-pastel-yellow" : "bg-slate-50"
          }`}
        >
          <div>
            <p className="text-sm font-bold text-slate-800">
              {isPremium ? "프리미엄 이용중" : "무료 플랜"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPremium
                ? "커스텀 카테고리를 자유롭게 만들 수 있어요."
                : "기본 카테고리만 사용할 수 있어요."}
            </p>
          </div>
          {!isPremium && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
        </div>

        {/* 실제 결제(IAP)가 연동되기 전까지 테스트용으로 프리미엄 상태를 토글하는 버튼.
            앱스토어/플레이스토어 결제 SDK 연동 후 이 버튼은 결제 콜백으로 대체되어야 함. */}
        <button
          onClick={() => setPremium(user.uid, !isPremium)}
          className="w-full rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 hover:bg-slate-50"
        >
          {isPremium ? "프리미엄 해제 (테스트용)" : "프리미엄으로 전환 (테스트용)"}
        </button>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
        <h2 className="text-sm font-bold text-slate-700 mb-2">계정 정보</h2>
        <p className="text-xs text-slate-400">사용자 ID</p>
        <p className="text-xs font-mono text-slate-600 break-all">{user?.uid}</p>
      </section>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
