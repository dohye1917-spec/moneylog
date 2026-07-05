import { Wallet, AlertCircle } from "lucide-react";

const FRIENDLY_MESSAGES = {
  "auth/popup-blocked":
    "브라우저가 로그인 팝업을 막았어요. 팝업 차단을 해제하고 다시 눌러주세요.",
  "auth/popup-closed-by-user": "로그인 창이 닫혔어요. 다시 시도해주세요.",
  "auth/cancelled-popup-request": "이미 로그인 창이 열려있어요. 잠시 후 다시 시도해주세요.",
};

function describeSignInError(error) {
  if (!error) return null;
  return FRIENDLY_MESSAGES[error.code] || "로그인에 실패했어요. 다시 시도해주세요.";
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.49-1.13 2.75-2.4 3.6v3h3.87c2.27-2.09 3.55-5.17 3.55-8.79z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.6H1.28A11.96 11.96 0 000 12c0 1.93.46 3.76 1.28 5.4l3.99-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.6l3.99 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function LoginScreen({ onSignIn, error }) {
  const errorMessage = describeSignInError(error);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF6F0] to-[#FFE9E0] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white shadow-sm flex items-center justify-center">
            <Wallet className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">머니로그</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            숫자만 눌러도 예쁘게 정리되는 가계부.
            <br />
            구글 계정 하나면 기기를 바꿔도 내역이 그대로 이어져요.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-700 font-semibold py-3.5 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
          >
            <GoogleIcon />
            구글 계정으로 시작하기
          </button>

          {errorMessage && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          로그인하면 커플/가족과 가계부를 공유하고,
          <br />
          어떤 기기에서든 같은 내역을 볼 수 있어요.
        </p>
      </div>
    </div>
  );
}
