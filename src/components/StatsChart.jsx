import { useMemo } from "react";
import { PieChart } from "lucide-react";

function aggregateByCategory(transactions) {
  const map = new Map();
  for (const t of transactions) {
    const key = t.category;
    const prev = map.get(key) || { category: t.category, emoji: t.emoji, color: t.color, amount: 0 };
    prev.amount += Number(t.amount) || 0;
    map.set(key, prev);
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export default function StatsChart({ transactions }) {
  const rows = useMemo(() => aggregateByCategory(transactions), [transactions]);
  const total = useMemo(() => rows.reduce((sum, r) => sum + r.amount, 0), [rows]);
  const max = Math.max(1, ...rows.map((r) => r.amount));

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1 mb-1">
          <PieChart className="w-4 h-4" /> 카테고리별 지출
        </h2>
        <p className="text-xs text-slate-400 mb-4">전체 합계 {total.toLocaleString("ko-KR")}원</p>

        {rows.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">아직 기록된 지출이 없어요.</p>
        )}

        <div className="space-y-3">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.amount / total) * 100) : 0;
            return (
              <div key={r.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {r.emoji} {r.category}
                  </span>
                  <span className="text-slate-500">
                    {r.amount.toLocaleString("ko-KR")}원 · {pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${(r.amount / max) * 100}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
