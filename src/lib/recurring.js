// 정기 결제(고정지출)가 매달 dayOfMonth에 도달하면 자동으로 지출 내역을 생성하기 위한
// 순수 계산 함수 모음. Cloud Functions 없이 클라이언트에서만 동작하므로,
// 앱을 며칠/몇 달 안 켜도 밀린 회차를 전부 따라잡을 수 있어야 한다.

export function toYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function nextYearMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function previousYearMonth(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/**
 * fromYearMonth(제외) 다음 달부터 오늘이 속한 달(포함)까지,
 * dayOfMonth가 이미 지난 달들을 { yearMonth, targetDate } 배열로 반환한다.
 */
export function computeMissedOccurrences(dayOfMonth, fromYearMonth, today = new Date()) {
  const occurrences = [];
  let cursor = nextYearMonth(fromYearMonth);
  const currentYM = toYearMonth(today);

  while (cursor <= currentYM) {
    const [y, m] = cursor.split("-").map(Number);
    const targetDate = new Date(y, m - 1, dayOfMonth);
    const isCurrentMonth = cursor === currentYM;
    const dayHasPassed = !isCurrentMonth || today.getDate() >= dayOfMonth;
    if (dayHasPassed) occurrences.push({ yearMonth: cursor, targetDate });
    cursor = nextYearMonth(cursor);
  }

  return occurrences;
}
