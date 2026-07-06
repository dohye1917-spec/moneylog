import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const WEEK_LABELS = ["1주차", "2주차", "3주차", "4주차", "5주차"];

export default function WeeklyComparisonChart({ thisMonthBuckets, lastMonthBuckets }) {
  const data = WEEK_LABELS.map((label, i) => ({
    week: label,
    이번달: thisMonthBuckets[i] || 0,
    지난달: lastMonthBuckets[i] || 0,
  }));

  const hasData = data.some((d) => d.이번달 > 0 || d.지난달 > 0);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1 mb-1">
        <BarChart3 className="w-4 h-4" /> 이번달 vs 지난달 (주차별)
      </h2>
      <p className="text-xs text-slate-400 mb-2">할부는 특정 날짜가 없어 이 차트에는 포함하지 않아요.</p>

      {!hasData ? (
        <p className="text-center text-sm text-slate-400 py-8">비교할 지출 내역이 없어요.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20, right: 8 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString("ko-KR")}원`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="지난달" fill="#E8E8EE" radius={[6, 6, 0, 0]} />
              <Bar dataKey="이번달" fill="#FFB4C6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
