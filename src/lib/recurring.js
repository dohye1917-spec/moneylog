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
 * year년 month월(1~12)의 마지막 날짜를 반환한다. 29~31일을 등록할 수 있게 되면서
 * 2월이나 30일까지밖에 없는 달에서는 실제 존재하는 마지막 날로 당겨써야 한다
 * (그렇지 않으면 Date가 다음 달로 그냥 넘어가버려 엉뚱한 달에 기록됨).
 */
export function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function clampDayOfMonth(year, month, dayOfMonth) {
  return Math.min(dayOfMonth, lastDayOfMonth(year, month));
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
    const clampedDay = clampDayOfMonth(y, m, dayOfMonth);
    const targetDate = new Date(y, m - 1, clampedDay);
    const isCurrentMonth = cursor === currentYM;
    const dayHasPassed = !isCurrentMonth || today.getDate() >= clampedDay;
    if (dayHasPassed) occurrences.push({ yearMonth: cursor, targetDate });
    cursor = nextYearMonth(cursor);
  }

  return occurrences;
}
