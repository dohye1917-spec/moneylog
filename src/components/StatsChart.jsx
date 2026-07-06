import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CATEGORIES } from "../lib/categories";
import { getRealtimeBudget } from "../lib/firestore";
import { aggregateByCategory, monthlyTotal, filterByYearMonth, bucketByWeek } from "../lib/stats";
import { toYearMonth, previousYearMonth } from "../lib/recurring";
import { activeInstallmentsForMonth } from "../lib/installments";
import BudgetGauges from "./BudgetGauges";
import BudgetSettingModal from "./BudgetSettingModal";
import CategoryPieChart from "./CategoryPieChart";
import WeeklyComparisonChart from "./WeeklyComparisonChart";

export default function StatsChart({ transactions, installments, customCategories, shareId }) {
  const [budget, setBudget] = useState({ amounts: {} });
  const [showBudgetSetting, setShowBudgetSetting] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    return getRealtimeBudget(shareId, setBudget);
  }, [shareId]);

  const currentYearMonth = toYearMonth(new Date());
  const lastYearMonth = previousYearMonth(currentYearMonth);

  const thisMonthTx = useMemo(() => filterByYearMonth(transactions, currentYearMonth), [transactions, currentYearMonth]);
  const lastMonthTx = useMemo(() => filterByYearMonth(transactions, lastYearMonth), [transactions, lastYearMonth]);

  const virtualInstallments = useMemo(
    () => activeInstallmentsForMonth(installments, currentYearMonth),
    [installments, currentYearMonth]
  );

  const rows = useMemo(
    () => aggregateByCategory(thisMonthTx, virtualInstallments),
    [thisMonthTx, virtualInstallments]
  );
  const total = useMemo(() => monthlyTotal(thisMonthTx, virtualInstallments), [thisMonthTx, virtualInstallments]);

  const thisMonthBuckets = useMemo(() => bucketByWeek(thisMonthTx), [thisMonthTx]);
  const lastMonthBuckets = useMemo(() => bucketByWeek(lastMonthTx), [lastMonthTx]);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  return (
    <div className="space-y-5">
      <div className="text-center py-2">
        <p className="text-xs text-slate-400">이번 달 총 지출</p>
        <p className="text-2xl font-bold text-slate-800">{total.toLocaleString("ko-KR")}원</p>
      </div>

      <BudgetGauges
        rows={rows}
        budgetAmounts={budget.amounts || {}}
        onOpenSettings={() => setShowBudgetSetting(true)}
      />

      <CategoryPieChart rows={rows} />

      <WeeklyComparisonChart thisMonthBuckets={thisMonthBuckets} lastMonthBuckets={lastMonthBuckets} />

      <BudgetSettingModal
        open={showBudgetSetting}
        onClose={() => setShowBudgetSetting(false)}
        shareId={shareId}
        categories={allCategories}
        budgetAmounts={budget.amounts || {}}
      />
    </div>
  );
}
