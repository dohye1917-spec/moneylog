# 머니로그 (MoneyLog) — 감성 가계부

노션/구글시트/넘버스가 복잡하게 느껴지는 사람들을 위한, 한 손가락 탭으로 끝나는 가계부 앱.

## 기술 스택

- React 18 + Vite + Tailwind CSS
- Firebase (Firestore + Google Authentication)
- Capacitor (Android/iOS 패키징용)

## 시작하기

```bash
npm install
npm run dev
```

### Firebase 콘솔 설정 (최초 1회 필수)

1. [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트(`money-management-f5202`) 이동
2. **Authentication → Sign-in method → Google** 활성화
   - "프로젝트 지원 이메일"을 지정해야 활성화할 수 있습니다.
   - 이 앱은 `signInWithPopup`으로 구글 로그인 후 `user.uid`로 유저를 구분합니다.
3. **Authentication → Settings → 승인된 도메인(Authorized domains)** 에 개발 중인 도메인이 있는지 확인
   - `localhost`는 기본 포함되어 있어 로컬 개발은 바로 됩니다. 실제 배포 도메인은 배포 후 추가하세요.
4. **Firestore Database** 생성 (아직 없다면 프로덕션 모드로 생성)
5. **Firestore Database → 규칙** 탭에 이 저장소의 [`firestore.rules`](firestore.rules) 내용을 붙여넣고 배포
   - 규칙을 배포하지 않으면 기본값(모두 거부)이라 앱에서 읽기/쓰기가 모두 실패합니다.
6. 최초 실행 시 `getRealtimeTransactions`가 `shareId` + `date` 복합 인덱스를 요구할 수 있습니다.
   콘솔에 뜨는 "색인을 만드세요" 링크를 클릭해 인덱스를 생성해주세요.

> **모바일(Capacitor) 참고:** `signInWithPopup`은 일반 웹 브라우저에서만 동작합니다.
> Capacitor로 패키징한 네이티브 앱(WebView)에서는 팝업이 열리지 않으므로,
> 실제 스토어 배포 시에는 `signInWithRedirect` 또는
> [`@capacitor-firebase/authentication`](https://github.com/capawesome-team/capacitor-firebase) 같은
> 네이티브 구글 로그인 플러그인으로 교체가 필요합니다.

## 데이터 모델

- `transactions`: id, userId, shareId, amount, category, emoji, color, date, memo
- `categories`: 유저가 만든 커스텀 카테고리 (shareId, name, emoji, color) — 프리미엄 전용
- `recurringPayments`: 정기 결제 알림 (shareId, name, amount, dayOfMonth, active)
- `users`: uid, displayName, photoURL, email, isPremium(기본 false), shareId(기본값은 본인 uid, 공유 연동 시 상대방 uid로 전환)

## 핵심 화면

- **로그인**: 파스텔톤 "구글 계정으로 시작하기" 화면 (로그인 전엔 앱 진입 불가)
- **홈**: 금액 입력(NumberPad) → 카테고리 버튼 한 번 탭 → 즉시 저장 (별도 저장 버튼 없음)
- **정기결제**: 구독/보험료 등록, D-3 이내 결제 예정 항목 배너 알림 (스텁: 실제 푸시알림 미연동)
- **공유가계부**: 내 공유 코드(uid) 안내, 상대방 코드 입력 시 `shareId` 동기화
- **설정**: 구글 프로필(이름/사진) 표시, 로그아웃, 프리미엄 상태 확인 + 테스트용 토글(실 결제 SDK 연동 전 임시)

## 프리미엄 게이팅

무료 유저는 기본 제공 카테고리만 사용 가능합니다. "카테고리 추가" 버튼을 누르면
`isPremium`이 false일 때 결제 안내 팝업(`PremiumModal`)이 뜨고, true일 때만
이모지·배경색을 직접 지정하는 커스텀 카테고리 생성 모달이 열립니다.

실제 인앱결제(Google Play Billing / Apple StoreKit) 연동은 아직 스텁 상태이며,
설정 화면의 "테스트용" 토글로 `users/{uid}.isPremium` 값을 직접 바꿔 동작을 확인할 수 있습니다.

## 앱스토어 / 플레이스토어 패키징 (Capacitor)

```bash
npm install
npx cap init   # 최초 1회 (capacitor.config.json 이미 있으므로 생략 가능)
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # Android Studio 실행
npx cap open ios       # Xcode 실행 (macOS 필요)
```

스토어 등록 전 확인할 것:
- `capacitor.config.json`의 `appId`를 실제 배포용 번들 ID로 변경
- 앱 아이콘/스플래시 이미지 (`@capacitor/assets` 등으로 생성)
- 정기 결제 알림을 실제 로컬/푸시 알림으로 연동하려면 `@capacitor/local-notifications` 추가 필요
- 인앱결제는 `cordova-plugin-purchase` 또는 RevenueCat 같은 SDK 연동 필요
