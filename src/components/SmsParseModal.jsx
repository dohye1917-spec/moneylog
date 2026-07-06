import { useState } from "react";
import { X, ClipboardPaste } from "lucide-react";
import { parsePaymentText } from "../lib/smsParser";

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function SmsParseModal({ open, onClose, onParsed }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [amount, setAmount] = useState("");
  const [datetime, setDatetime] = useState("");
  const [merchant, setMerchant] = useState("");

  if (!open) return null;

  const handleParse = () => {
    const result = parsePaymentText(text);
    setParsed(result);
    setAmount(result.amount ? String(result.amount) : "");
    setDatetime(toDatetimeLocalValue(result.date || new Date()));
    setMerchant(result.merchant || "");
  };

  const handleConfirm = () => {
    const value = Number(amount);
    if (!value) return;
    onParsed({
      amount: value,
      date: datetime ? new Date(datetime) : new Date(),
      memo: merchant.trim(),
    });
    setText("");
    setParsed(null);
    setAmount("");
    setDatetime("");
    setMerchant("");
    onClose();
  };

  const handleClose = () => {
    setText("");
    setParsed(null);
    setAmount("");
    setDatetime("");
    setMerchant("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <ClipboardPaste className="w-5 h-5" /> 결제 문자로 채우기
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!parsed ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="은행/카드사 결제 문자나 카톡 알림 내용을 여기에 붙여넣어줘"
              rows={6}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full rounded-2xl bg-slate-900 text-white font-semibold py-3 disabled:opacity-30 hover:bg-slate-800 transition"
            >
              내용 분석하기
            </button>
          </>
        ) : (
          <>
            {!parsed.amount && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                금액을 정확히 찾지 못했어요. 아래에서 직접 입력해줘.
              </p>
            )}
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">금액</p>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="금액을 입력해줘"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">일시</p>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">사용처 (메모)</p>
                <input
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="예: 스타벅스 강남점"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!Number(amount)}
              className="w-full rounded-2xl bg-slate-900 text-white font-semibold py-3 disabled:opacity-30 hover:bg-slate-800 transition"
            >
              이 내용으로 채우기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
