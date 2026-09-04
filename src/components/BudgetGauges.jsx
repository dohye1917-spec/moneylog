import { Target, Settings } from "lucide-react";

// 원 스펙은 50%/80%/100% 두 경계만 정의했고 50~79% 구간은 비어 있어,
// 여기서는 "아직 여유 있음"을 뜻하는 중립 색으로 그 구간을 채웠다.
function gaugeColorClass(pct) {
  if (pct > 100) return "bg-rose-400";
  if (pct >= 80) return "bg-amber-400";
  if (pct >= 50) return "bg-sky-300";
  return "bg-emerald-400";
}

export default function BudgetGauges({ rows, budgetAmounts, categories, onOpenSettings }) {
  // rows는 "이번 달에 지출이 있는 카테고리"만 담고 있어서, 예산만 설정하고
  // 아직 한 번도 안 쓴 카테고리는 여기 없다. 예산이 설정된 모든 카테고리
  // 기준으로 목록을 만들고, 지출은 있으면 가져오고 없으면 0으로 둔다.
  const budgeted = Object.entries(budgetAmounts)
    .filter(([, amount]) => amount > 0)
    .map(([category, budget]) => {
      const spent = rows.find((r) => r.category === category);
      const meta = categories.find((c) => c.name === category);
      return {
        category,
        budget,
        amount: spent?.amount || 0,
        emoji: spent?.emoji || meta?.emoji || "🧾",
        color: spent?.color || meta?.color || "#F0F0F0",
      };
    })
    .sort((a, b) => b.amount / b.budget - a.amount / a.budget);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <Target className="w-4 h-4" /> 예산 대비 지출
        </h2>
        <button onClick={onOpenSettings} className="text-slate-400 hover:text-slate-600">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {budgeted.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-6">
          아직 설정된 예산이 없어요.{" "}
          <button onClick={onOpenSettings} className="underline text-slate-500">
            예산 설정하기
          </button>
        </p>
      )}

      <div className="space-y-3">
        {budgeted.map((r) => {
          const pct = Math.round((r.amount / r.budget) * 100);
          return (
            <div key={r.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">
                  {r.emoji} {r.category}
                </span>
                <span className="text-slate-500">
                  {r.amount.toLocaleString("ko-KR")} / {r.budget.toLocaleString("ko-KR")}원 · {pct}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${gaugeColorClass(pct)}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
