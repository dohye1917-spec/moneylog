export default function CategoryButton({ emoji, name, color, onClick, onLongPress }) {
  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        if (!onLongPress) return;
        e.preventDefault();
        onLongPress();
      }}
      style={{ backgroundColor: color }}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl aspect-square w-full
        active:scale-95 transition-transform shadow-sm"
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className="text-xs font-semibold text-slate-700 truncate max-w-[90%]">{name}</span>
    </button>
  );
}
