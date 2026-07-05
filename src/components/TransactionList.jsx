import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { deleteTransaction } from "../lib/firestore";

function formatDateLabel(ts) {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function TransactionList({ transactions }) {
  const monthTotal = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    [transactions]
  );

  const grouped = useMemo(() => {
    const map = new Map();
    for (const t of transactions) {
      const label = formatDateLabel(t.date) || "날짜 미상";
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(t);
    }
    return Array.from(map.entries());
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-700">최근 내역</h2>
        <p className="text-xs text-slate-400">
          합계 <span className="font-semibold text-slate-600">{monthTotal.toLocaleString("ko-KR")}원</span>
        </p>
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">아직 기록된 지출이 없어요. 위에서 첫 지출을 남겨보세요!</p>
      )}

      {grouped.map(([label, items]) => (
        <div key={label} className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1">{label}</p>
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  style={{ backgroundColor: t.color }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                >
                  {t.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{t.category}</p>
                  {t.memo && <p className="text-xs text-slate-400 truncate">{t.memo}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-800">
                  {Number(t.amount).toLocaleString("ko-KR")}원
                </span>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-slate-300 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
