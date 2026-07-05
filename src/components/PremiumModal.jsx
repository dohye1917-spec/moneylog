import { Sparkles, X } from "lucide-react";

export default function PremiumModal({ open, onClose, onUpgrade }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center text-center gap-3 -mt-2">
          <div className="w-14 h-14 rounded-full bg-pastel-yellow flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">프리미엄 전용 기능이에요</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            나만의 카테고리 이모지 &amp; 배경색 커스터마이징은
            <br />
            결제 후 이용하실 수 있는 프리미엄 기능이에요.
          </p>
          <button
            onClick={onUpgrade}
            className="w-full mt-2 rounded-2xl bg-slate-900 text-white font-semibold py-3 hover:bg-slate-800 transition"
          >
            프리미엄으로 업그레이드
          </button>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 py-1">
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
