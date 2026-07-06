// 통계 대시보드에서 공용으로 쓰는 순수 집계 함수.
// 할부(virtualInstallments)는 이번 달 실제 지출이므로 카테고리 합계/총합에는
// 포함하지만, 요일이 없는 항목이라 주간 버킷(bucketByWeek)에는 포함하지 않는다.

export function aggregateByCategory(transactions, virtualInstallments = []) {
  const map = new Map();
  const addRow = (t) => {
    const key = t.category;
    const prev = map.get(key) || { category: t.category, emoji: t.emoji, color: t.color, amount: 0 };
    prev.amount += Number(t.amount) || 0;
    map.set(key, prev);
  };
  transactions.forEach(addRow);
  virtualInstallments.forEach(addRow);
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export function monthlyTotal(transactions, virtualInstallments = []) {
  const txTotal = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const instTotal = virtualInstallments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  return txTotal + instTotal;
}

// transactions의 .date(Firestore Timestamp)가 yearMonth("2026-07")에 속하는 것만 남긴다.
export function filterByYearMonth(transactions, yearMonth) {
  return transactions.filter((t) => {
    const d = t.date?.toDate?.();
    if (!d) return false;
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return ym === yearMonth;
  });
}

// 이미 한 달로 필터링된 transactions를 주차(1~5주차)별로 나눠 합산한다.
export function bucketByWeek(transactions) {
  const buckets = [0, 0, 0, 0, 0];
  for (const t of transactions) {
    const d = t.date?.toDate?.();
    if (!d) continue;
    const weekIndex = Math.min(4, Math.floor((d.getDate() - 1) / 7));
    buckets[weekIndex] += Number(t.amount) || 0;
  }
  return buckets;
}
