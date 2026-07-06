import { useState } from "react";
import { ClipboardPaste, X } from "lucide-react";
import { DEFAULT_CATEGORIES } from "../lib/categories";
import { addTransaction, addCustomCategory } from "../lib/firestore";
import CategoryGrid from "./CategoryGrid";
import NumberPad from "./NumberPad";
import AddCategoryModal from "./AddCategoryModal";
import PremiumModal from "./PremiumModal";
import SmsParseModal from "./SmsParseModal";

const MAX_AMOUNT_DIGITS = 10;

function formatPendingDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AddScreen({ user, profile, customCategories, onSaved }) {
  const [amount, setAmount] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showSmsParse, setShowSmsParse] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [pendingMemo, setPendingMemo] = useState("");
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState(false);

  const isPremium = !!profile?.isPremium;
  const shareId = profile?.shareId || user?.uid;
  const categories = [...DEFAULT_CATEGORIES, ...customCategories];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const handleAmountChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, MAX_AMOUNT_DIGITS);
    setAmount(digits.replace(/^0+(?=\d)/, ""));
  };

  // 3x4 숫자판 탭 입력과 실제 키보드 타이핑(위 input)이 같은 amount 상태를 공유한다.
  const handleKeyPress = (key) => {
    if (key === "back") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    setAmount((prev) => {
      const next = (prev + key).replace(/^0+(?=\d)/, "");
      return next.length > MAX_AMOUNT_DIGITS ? prev : next;
    });
  };

  // 한 손가락 탭 구조: 금액을 입력한 뒤 카테고리를 한 번 누르면
  // 별도의 저장 버튼 없이 즉시 Firestore에 기록된다.
  const handleSelectCategory = async (category) => {
    const value = Number(amount);
    if (!value) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      showToast("먼저 금액을 입력해줘!");
      return;
    }

    try {
      await addTransaction({
        userId: user.uid,
        shareId,
        amount: value,
        category: category.name,
        emoji: category.emoji,
        color: category.color,
        date: pendingDate || new Date(),
        memo: pendingMemo,
      });
      setAmount("");
      setPendingDate(null);
      setPendingMemo("");
      showToast(`${category.emoji} ${category.name} · ${value.toLocaleString("ko-KR")}원 기록완료!`);
      onSaved?.();
    } catch (err) {
      console.error(err);
      showToast("저장에 실패했어요. 다시 시도해줘.");
    }
  };

  const handleSmsParsed = ({ amount: parsedAmount, date, memo }) => {
    setAmount(String(parsedAmount));
    setPendingDate(date);
    setPendingMemo(memo);
  };

  const clearPending = () => {
    setPendingDate(null);
    setPendingMemo("");
  };

  const handleAddCategoryClick = () => {
    if (!isPremium) {
      setShowPremium(true);
      return;
    }
    setShowAddCategory(true);
  };

  const handleSaveCategory = async (data) => {
    await addCustomCategory(shareId, data);
    setShowAddCategory(false);
    showToast(`${data.emoji} ${data.name} 카테고리 추가완료!`);
  };

  return (
    <div className="space-y-5">
      <div className={`text-center py-4 ${shake ? "animate-pulse" : ""}`}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <p className="text-sm text-slate-400">오늘 얼마 썼어?</p>
          <button
            onClick={() => setShowSmsParse(true)}
            className="text-slate-300 hover:text-slate-500"
            title="결제 문자로 채우기"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={amount ? Number(amount).toLocaleString("ko-KR") : ""}
            onChange={handleAmountChange}
            placeholder="0"
            className="text-4xl font-bold text-slate-800 tabular-nums text-center bg-transparent focus:outline-none min-w-[1.5ch]"
            style={{ width: `${(amount ? Number(amount).toLocaleString("ko-KR").length : 1) + 1}ch` }}
          />
          <span className="text-xl text-slate-400">원</span>
        </div>
        {pendingDate && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-slate-400">
              {formatPendingDate(pendingDate)}
              {pendingMemo && ` · ${pendingMemo}`}로 기록돼요
            </span>
            <button onClick={clearPending} className="text-slate-300 hover:text-slate-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <NumberPad onKeyPress={handleKeyPress} />

      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2 px-1">카테고리를 눌러서 바로 기록해</p>
        <CategoryGrid
          categories={categories}
          onSelect={handleSelectCategory}
          onAddCategory={handleAddCategoryClick}
        />
      </div>

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={handleSaveCategory}
      />
      <PremiumModal
        open={showPremium}
        onClose={() => setShowPremium(false)}
        onUpgrade={() => {
          setShowPremium(false);
          showToast("결제 연동은 준비 중이에요. 곧 만나요!");
        }}
      />
      <SmsParseModal
        open={showSmsParse}
        onClose={() => setShowSmsParse(false)}
        onParsed={handleSmsParsed}
      />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
