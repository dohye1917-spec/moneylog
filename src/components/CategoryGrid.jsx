import { Plus } from "lucide-react";
import CategoryButton from "./CategoryButton";

export default function CategoryGrid({ categories, onSelect, onLongPress, onAddCategory }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((c) => (
        <CategoryButton
          key={c.id}
          emoji={c.emoji}
          name={c.name}
          color={c.color}
          onClick={() => onSelect(c)}
          onLongPress={onLongPress ? () => onLongPress(c) : undefined}
        />
      ))}
      <button
        onClick={onAddCategory}
        className="flex flex-col items-center justify-center gap-1.5 rounded-2xl aspect-square w-full
          border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500
          active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
        <span className="text-xs font-semibold">추가</span>
      </button>
    </div>
  );
}
