import { Home, PieChart, RefreshCw, Users, Settings } from "lucide-react";

const TABS = [
  { id: "home", label: "홈", icon: Home },
  { id: "stats", label: "통계", icon: PieChart },
  { id: "recurring", label: "정기결제", icon: RefreshCw },
  { id: "share", label: "공유가계부", icon: Users },
  { id: "settings", label: "설정", icon: Settings },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              active === id ? "text-slate-900" : "text-slate-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
