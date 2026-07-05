// 기본 제공 카테고리: 이모지 + 파스텔톤 배경색 매칭
export const DEFAULT_CATEGORIES = [
  { id: "food", name: "식비", emoji: "🍚", color: "#FFE3C9" },
  { id: "cafe", name: "카페/간식", emoji: "☕", color: "#F1D9FF" },
  { id: "transport", name: "교통", emoji: "🚌", color: "#CDE8FF" },
  { id: "shopping", name: "쇼핑", emoji: "🛍️", color: "#FFD9E8" },
  { id: "living", name: "생활", emoji: "🧻", color: "#E8E8EE" },
  { id: "health", name: "건강", emoji: "💊", color: "#CFF5E7" },
  { id: "culture", name: "문화/취미", emoji: "🎬", color: "#E3D9FF" },
  { id: "subscription", name: "구독", emoji: "📺", color: "#FFF3B0" },
  { id: "housing", name: "주거/공과금", emoji: "🏠", color: "#D9F2D9" },
  { id: "etc", name: "기타", emoji: "🧾", color: "#F0F0F0" },
];

// 커스텀 카테고리 생성 시 고를 수 있는 파스텔 팔레트
export const PASTEL_PALETTE = [
  "#FFD9E8",
  "#FFE3C9",
  "#FFF3B0",
  "#CFF5E7",
  "#CDE8FF",
  "#E3D9FF",
  "#F1D9FF",
  "#D9F2D9",
  "#E8E8EE",
  "#FFC9C9",
];

export function findCategory(categories, categoryId) {
  return categories.find((c) => c.id === categoryId) || null;
}
