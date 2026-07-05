import { useState } from "react";
import { X, Check } from "lucide-react";
import { PASTEL_PALETTE } from "../lib/categories";

export default function AddCategoryModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState(PASTEL_PALETTE[0]);

  if (!open) return null;

  const canSave = name.trim().length > 0 && emoji.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), emoji: emoji.trim(), color });
    setName("");
    setEmoji("✨");
    setColor(PASTEL_PALETTE[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">내 카테고리 만들기</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: color }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          >
            {emoji || "✨"}
          </div>
          <div className="flex-1 space-y-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              placeholder="이모지 (예: 🐱)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 8))}
              placeholder="카테고리 이름 (예: 덕질)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">배경 색상</p>
          <div className="flex flex-wrap gap-2">
            {PASTEL_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-black/5"
              >
                {color === c && <Check className="w-4 h-4 text-slate-700" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full rounded-2xl bg-slate-900 text-white font-semibold py-3 disabled:opacity-30 hover:bg-slate-800 transition"
        >
          카테고리 추가하기
        </button>
      </div>
    </div>
  );
}
