import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { setBudget } from "../lib/firestore";

export default function BudgetSettingModal({ open, onClose, shareId, categories, budgetAmounts }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = {};
    categories.forEach((c) => {
      initial[c.name] = budgetAmounts[c.name] ? String(budgetAmounts[c.name]) : "";
    });
    setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = categories.filter(
        (c) => (values[c.name] || "") !== (budgetAmounts[c.name] ? String(budgetAmounts[c.name]) : "")
      );
      for (const c of changed) {
        await setBudget(shareId, c.name, values[c.name] || 0);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">카테고리별 예산 설정</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id || c.name} className="flex items-center gap-2">
              <span
                style={{ backgroundColor: c.color }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              >
                {c.emoji}
              </span>
              <span className="text-sm text-slate-600 w-16 shrink-0 truncate">{c.name}</span>
              <input
                type="number"
                value={values[c.name] ?? ""}
                onChange={(e) => handleChange(c.name, e.target.value)}
                placeholder="예산 없음"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 text-white font-semibold py-3 disabled:opacity-30 hover:bg-slate-800 transition"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
