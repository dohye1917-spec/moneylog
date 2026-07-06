import { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import {
  addInstallment,
  deleteInstallment,
  getRealtimeInstallments,
} from "../lib/firestore";
import { getInstallmentStatusForMonth, toYearMonth } from "../lib/installments";

export default function InstallmentSection({ userId, shareId }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [months, setMonths] = useState("3");
  const [startYearMonth, setStartYearMonth] = useState(toYearMonth(new Date()));

  useEffect(() => {
    if (!shareId) return;
    return getRealtimeInstallments(shareId, setItems);
  }, [shareId]);

  const currentYearMonth = toYearMonth(new Date());

  const handleAdd = async () => {
    if (!name.trim() || !totalAmount || !months) return;
    await addInstallment({
      userId,
      shareId,
      name: name.trim(),
      totalAmount,
      months,
      startYearMonth,
    });
    setName("");
    setTotalAmount("");
    setMonths("3");
    setStartYearMonth(toYearMonth(new Date()));
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
        <CreditCard className="w-4 h-4" /> 카드 할부 등록
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 노트북"
          className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <input
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="총 할부금액"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <select
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}개월
            </option>
          ))}
        </select>
        <input
          type="month"
          value={startYearMonth}
          onChange={(e) => setStartYearMonth(e.target.value)}
          className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-1 rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 transition"
      >
        <Plus className="w-4 h-4" /> 할부 등록하기
      </button>

      <div className="space-y-2 pt-1">
        {items.map((item) => {
          const status = getInstallmentStatusForMonth(item, currentYearMonth);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {status
                      ? `${status.round}/${status.totalRounds}회차 · ${status.amount.toLocaleString("ko-KR")}원`
                      : `총 ${Number(item.totalAmount).toLocaleString("ko-KR")}원 · ${item.months}개월 (이번 달 해당 없음)`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteInstallment(item.id)}
                className="text-slate-300 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">등록된 할부가 없어요.</p>
        )}
      </div>
    </section>
  );
}
