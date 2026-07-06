import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export default function CategoryPieChart({ rows }) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1 mb-1">
        <PieChartIcon className="w-4 h-4" /> 카테고리별 지출 비율
      </h2>
      <p className="text-xs text-slate-400 mb-2">이번 달 합계 {total.toLocaleString("ko-KR")}원</p>

      {rows.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">아직 기록된 지출이 없어요.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="category"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
              >
                {rows.map((r) => (
                  <Cell key={r.category} fill={r.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString("ko-KR")}원`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
        {rows.map((r) => (
          <div key={r.category} className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
            <span className="truncate">
              {r.emoji} {r.category}
            </span>
            <span className="ml-auto text-slate-400 shrink-0">
              {total > 0 ? Math.round((r.amount / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
