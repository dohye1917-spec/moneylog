import { useEffect, useMemo, useState } from "react";
import { Bell, Plus, Trash2, RefreshCw } from "lucide-react";
import {
  addRecurringPayment,
  deleteRecurringPayment,
  getRealtimeRecurringPayments,
} from "../lib/firestore";
import InstallmentSection from "./InstallmentSection";

function daysUntilNext(dayOfMonth) {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  const target = thisMonth >= today ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export default function RecurringPayments({ shareId }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  useEffect(() => {
    if (!shareId) return;
    return getRealtimeRecurringPayments(shareId, setItems);
  }, [shareId]);

  const upcoming = useMemo(
    () =>
      items
        .map((i) => ({ ...i, dDay: daysUntilNext(i.dayOfMonth) }))
        .filter((i) => i.dDay <= 3)
        .sort((a, b) => a.dDay - b.dDay),
    [items]
  );

  const handleAdd = async () => {
    if (!name.trim() || !amount) return;
    await addRecurringPayment({
      userId: shareId,
      shareId,
      name: name.trim(),
      amount,
      dayOfMonth,
      emoji: "🔁",
      color: "#FFF3B0",
    });
    setName("");
    setAmount("");
    setDayOfMonth("1");
  };

  return (
    <div className="space-y-5">
      {upcoming.length > 0 && (
        <div className="rounded-2xl bg-pastel-yellow/60 border border-amber-200 p-4 space-y-1">
          <p className="text-sm font-bold text-amber-800 flex items-center gap-1">
            <Bell className="w-4 h-4" /> 곧 결제될 정기 구독이 있어요
          </p>
          {upcoming.map((u) => (
            <p key={u.id} className="text-xs text-amber-700">
              {u.emoji} {u.name} · {Number(u.amount).toLocaleString("ko-KR")}원 ·{" "}
              {u.dDay === 0 ? "오늘 결제" : `D-${u.dDay}`}
            </p>
          ))}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <RefreshCw className="w-4 h-4" /> 정기 결제 등록
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 넷플릭스"
            className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="금액"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <select
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                매월 {d}일
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1 rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> 등록하기
        </button>

        <div className="space-y-2 pt-1">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{i.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{i.name}</p>
                  <p className="text-xs text-slate-400">매월 {i.dayOfMonth}일 · {Number(i.amount).toLocaleString("ko-KR")}원</p>
                </div>
              </div>
              <button
                onClick={() => deleteRecurringPayment(i.id)}
                className="text-slate-300 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">등록된 정기 결제가 없어요.</p>
          )}
        </div>
      </section>

      <InstallmentSection userId={shareId} shareId={shareId} />
    </div>
  );
}
