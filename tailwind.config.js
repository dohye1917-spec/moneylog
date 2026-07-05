import { fileURLToPath } from "url";
import path from "path";

// 절대 경로로 지정: 이 앱을 다른 작업 디렉토리(cwd)에서 실행하는 도구(예: 프리뷰 서버)를 통해
// 띄우면 상대 경로 glob이 엉뚱한 디렉토리를 스캔해 유틸리티 클래스가 누락되는 문제가 있었음.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src/**/*.{js,jsx}"),
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FFD9E8",
          peach: "#FFE3C9",
          yellow: "#FFF3B0",
          mint: "#CFF5E7",
          sky: "#CDE8FF",
          lavender: "#E3D9FF",
          lilac: "#F1D9FF",
          gray: "#E8E8EE",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
