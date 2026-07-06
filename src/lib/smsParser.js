// 은행/카드사 결제 문자·카카오톡 알림 텍스트에서 금액/일시/사용처를 추출한다.
// 가장 흔한 실수는 "누적/잔액/한도"처럼 실제 결제액 뒤에 따라오는 잔여 금액을
// 진짜 결제 금액으로 착각하는 것이다. 이 키워드들은 항상 자기가 설명하는 금액
// "바로 앞"에 붙어 나오므로(예: "누적 350,000원"), 각 금액 후보 앞쪽 일정 범위만
// 살펴 그 금액이 누적/잔액 계열인지 판단한다 (줄 전체를 제외하면 승인 금액과
// 누적 금액이 한 줄에 같이 있는 카드사 문자 포맷에서 실제 금액까지 같이 날아감).
const EXCLUDE_KEYWORDS = ["누적", "잔액", "한도", "잔여", "가용", "사용가능"];
const APPROVAL_KEYWORDS = ["승인", "결제", "출금"];
const ISSUER_TOKENS = [
  "신한카드",
  "KB국민카드",
  "국민카드",
  "삼성카드",
  "현대카드",
  "카카오뱅크",
  "농협카드",
  "NH농협카드",
  "롯데카드",
  "하나카드",
  "우리카드",
  "BC카드",
  "KB",
];
const BOILERPLATE_TOKENS = ["총누적", "총 이용금액", "이용가능금액", "일시불", "할부", "[Web발신]", "Web발신"];
const NAME_PATTERN = /[가-힣*]{2,5}님/g;
const AMOUNT_WINDOW = 15;

/**
 * rawText를 파싱해 { amount, date, merchant }를 반환한다.
 * amount가 0이면 파싱 실패로 간주하고, 호출 측(UI)에서 수동 입력으로 유도한다.
 */
export function parsePaymentText(rawText) {
  return {
    amount: extractAmount(rawText),
    date: extractDate(rawText),
    merchant: extractMerchant(rawText),
  };
}

function extractAmount(rawText) {
  let firstCandidate = null;
  let approvalAdjacent = null;

  for (const m of rawText.matchAll(/([\d,]{4,})\s*원/g)) {
    const value = Number(m[1].replace(/,/g, ""));
    if (!value) continue;

    const window = rawText.slice(Math.max(0, m.index - AMOUNT_WINDOW), m.index);
    if (EXCLUDE_KEYWORDS.some((kw) => window.includes(kw))) continue;

    if (firstCandidate === null) firstCandidate = value;
    if (approvalAdjacent === null && APPROVAL_KEYWORDS.some((kw) => window.includes(kw))) {
      approvalAdjacent = value;
    }
  }

  return approvalAdjacent ?? firstCandidate ?? 0;
}

function extractDate(rawText) {
  // 연-월-일이 모두 있는 전체 날짜(예: 2026.07.05)를 우선 확인한다.
  // 이걸 먼저 안 보면 MM/DD 패턴이 "2026.07" 안의 "26.07"을 잘못 집어낸다.
  const full = rawText.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (full) {
    const [, yyyy, mm, dd, hh, min] = full;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh) || 0, Number(min) || 0);
  }

  const short = rawText.match(/(\d{1,2})[./](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!short) return null;
  const now = new Date();
  const [, mm, dd, hh, min] = short;
  return new Date(now.getFullYear(), Number(mm) - 1, Number(dd), Number(hh) || 0, Number(min) || 0);
}

// 사용처(가맹점) 추출: 카드사명/승인 문구/고객명/금액/일시를 지운 뒤 남는 텍스트를
// 후보로 삼는다. 여러 줄 문자는 뒤에서부터 훑는다 (가맹점명은 보통 마지막
// "누적 ~원" 줄 바로 앞에 오는 경우가 많다).
function extractMerchant(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i--) {
    const cleaned = stripNoise(lines[i]);
    if (cleaned.length >= 2) return cleaned;
  }
  return "";
}

function stripNoise(line) {
  let cleaned = line;
  ISSUER_TOKENS.forEach((t) => (cleaned = cleaned.replaceAll(t, "")));
  BOILERPLATE_TOKENS.forEach((t) => (cleaned = cleaned.replaceAll(t, "")));
  cleaned = cleaned.replace(NAME_PATTERN, "");
  cleaned = cleaned.replace(/\([\d-]+\)/g, "");
  cleaned = cleaned.replace(/[\d,]+\s*원/g, "");
  cleaned = cleaned.replace(/\d{4}[.-]\d{1,2}[.-]\d{1,2}/g, "");
  cleaned = cleaned.replace(/\d{1,2}[./]\d{1,2}(\s+\d{1,2}:\d{2})?/g, "");
  cleaned = cleaned.replace(/승인|결제|출금|가맹점\s*:?|누적|잔액|한도|잔여|가용|사용가능/g, "");
  cleaned = cleaned.replace(/[[\]:,]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}
