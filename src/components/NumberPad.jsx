import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"];

export default function NumberPad({ onKeyPress }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onKeyPress(k)}
          className="h-14 rounded-2xl bg-slate-50 text-slate-700 text-xl font-semibold
            active:bg-slate-200 transition-colors flex items-center justify-center"
        >
          {k === "back" ? <Delete className="w-5 h-5" /> : k}
        </button>
      ))}
    </div>
  );
}
