import { useEffect, useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { addNote, deleteNote, getRealtimeNotes } from "../lib/firestore";

function formatNoteDate(timestamp) {
  const d = timestamp?.toDate?.();
  if (!d) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function NotesScreen({ shareId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!shareId) return;
    return getRealtimeNotes(shareId, setNotes, (err) => {
      console.error(err);
      setToast("메모를 불러오지 못했어요. 새로고침해줘.");
      setTimeout(() => setToast(""), 1800);
    });
  }, [shareId]);

  const handleAdd = async () => {
    const value = text.trim();
    if (!value) return;
    await addNote(shareId, value);
    setText("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd();
  };

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <NotebookPen className="w-4 h-4" /> 메모
        </h2>
        <p className="text-xs text-slate-400">
          여행 계획처럼 돈과 상관없는 메모도 자유롭게 남겨봐.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 다음 달 제주도 여행 계획 짜기"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-1 rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 disabled:opacity-30 hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" /> 메모 추가하기
          </button>
        </form>
      </section>

      <div className="space-y-2">
        {notes.map((n) => (
          <div
            key={n.id}
            className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{n.text}</p>
              <p className="text-[11px] text-slate-300 mt-1">{formatNoteDate(n.createdAt)}</p>
            </div>
            <button
              onClick={() => deleteNote(n.id)}
              className="shrink-0 text-slate-300 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">아직 남긴 메모가 없어요.</p>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
