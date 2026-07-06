// 카드 할부(installments)는 실제 트랜잭션을 매달 생성하지 않고,
// "이번 달에 몇 회차인지, 얼마인지"를 조회 시점에 계산만 한다.
// (삭제/수정 시 여러 달치 문서를 정리할 필요가 없어 단순함)
import { toYearMonth } from "./recurring.js";

/**
 * installment가 주어진 yearMonth("2026-07")에 활성 상태인지 확인하고,
 * 활성이면 { round, totalRounds, amount }, 아니면 null을 반환한다.
 * 총액을 개월 수로 나눈 나머지는 마지막 회차에 몰아 합계가 정확히 맞도록 한다.
 */
export function getInstallmentStatusForMonth(installment, yearMonth) {
  const monthIndex = diffYearMonths(installment.startYearMonth, yearMonth);
  if (monthIndex < 0 || monthIndex >= installment.months) return null;

  const base = Math.floor(installment.totalAmount / installment.months);
  const remainder = installment.totalAmount - base * installment.months;
  const isLastRound = monthIndex === installment.months - 1;

  return {
    round: monthIndex + 1,
    totalRounds: installment.months,
    amount: isLastRound ? base + remainder : base,
  };
}

/**
 * installments 목록 중 yearMonth에 활성인 것만, 계산된 회차 정보를 붙여 반환한다.
 * 카테고리별 집계(파이차트/예산 게이지)에 그대로 합칠 수 있는 형태.
 */
export function activeInstallmentsForMonth(installments, yearMonth) {
  return installments
    .map((inst) => {
      const status = getInstallmentStatusForMonth(inst, yearMonth);
      return status ? { ...inst, ...status } : null;
    })
    .filter(Boolean);
}

export { toYearMonth };

function diffYearMonths(fromYM, toYM) {
  const [fy, fm] = fromYM.split("-").map(Number);
  const [ty, tm] = toYM.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}
