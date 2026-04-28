# FinalChoice — 무인도 생존 텍스트 어드벤처

## 작업 규칙
- 기능 추가/구조 변경/버그 수정 후 이 파일의 관련 섹션을 최신 상태로 업데이트할 것
- **개발 완료 시 반드시 배포**: 기능 구현이 완료되면 항상 `npx vercel --prod --yes`로 즉시 배포할 것
- 배포 명령어: `npx vercel --prod --yes`

## 프로젝트 개요
서버 없이 동작하는 텍스트 기반 생존 어드벤처 게임. 무인도에 표류한 주인공이 100개의 분기 노드를 거쳐 25개의 다양한 결말 중 하나에 도달한다.

- **라이브 URL**: https://final-choice.vercel.app
- **배포**: Vercel (정적 호스팅) → TWA로 Android Play Store 래핑 예정 (ChonMap과 동일 파이프라인)
- **GitHub**: https://github.com/nokeunsu-creator/final-choice
- **데이터**: 진행도(현재 노드 / 인벤토리 / 방문 노드 / 달성 결말) localStorage 저장

## 기술 스택
- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 (현재는 인라인 스타일 위주, 다크 톤)
- localStorage 데이터 저장 (서버 없음)
- 타이핑 애니메이션 (setTimeout 기반)

## 핵심 아키텍처

### 데이터 모델 (`src/data/types.ts`)
- `StoryNode`: nodeId, text, choices[], endingType?, endingTitle?
- `Choice`: label, nextNodeId, requiredItem(string|null), grantItem?(string|null)
- 엔딩 노드는 `choices: []` + `endingType` + `endingTitle`로 표현

### 노드 데이터 (`assets/data.json`)
- 100개 노드, 25개 엔딩 (good 7 / bad 15 / neutral 3)
- `getNode(id)`로 O(1) 조회 (Map 캐시)
- 무인도 → 잔해 / 정글 / 동굴 / 산 / 폭포 / 원주민 / 보물 / 탈출 분기

### 상태 관리 (`src/state/GameContext.tsx`)
- React Context + useReducer
- 액션: `GO_TO`(grantItem 동시 처리), `RESET_TO_TITLE`(엔딩 진행은 보존), `RECORD_ENDING`, `HYDRATE`
- 자동 저장: state 변경 시 localStorage 직렬화 (디바운스 없음 — 단순 데이터)
- 시작 시 localStorage 복원

### 광고 (`src/ads/interstitial.ts`)
- `showInterstitialAd()` Promise 스텁
- 호출 위치: `EndingScreen` 의 "처음으로" 버튼 (광고 종료 후 타이틀 복귀)
- TWA 환경에서는 AdSense 인터스티셜, RN 전환 시 `react-native-google-mobile-ads`로 교체 가능

## 폴더 구조
```
FinalChoice/
├── assets/
│   └── data.json                   # 100개 노드
├── src/
│   ├── data/
│   │   ├── types.ts                # StoryNode, Choice, EndingType
│   │   └── nodes.ts                # data.json 로더 + Map 캐시
│   ├── state/
│   │   └── GameContext.tsx         # Context + useReducer + localStorage
│   ├── ads/
│   │   └── interstitial.ts         # showInterstitialAd() 스텁
│   ├── components/
│   │   ├── TypewriterText.tsx      # 타이핑 애니메이션 (탭 → 즉시 완료)
│   │   ├── ChoiceButton.tsx        # 선택지 버튼 (잠금 상태 표시)
│   │   └── Inventory.tsx           # 상단 인벤토리 칩
│   ├── screens/
│   │   ├── TitleScreen.tsx         # 시작 화면 (이어하기 / 처음부터)
│   │   ├── GameScreen.tsx          # 노드 진행 화면 (타이핑 + 선택지)
│   │   └── EndingScreen.tsx        # 엔딩 화면 (광고 → 타이틀 복귀)
│   ├── App.tsx                     # 라우터 (title/game/ending state)
│   ├── main.tsx
│   └── index.css                   # Tailwind 4 + 글로벌 다크 스타일
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## 구현된 기능
- 100개 분기 노드 + 25개 엔딩 (good/bad/neutral 색상 구분)
- 타이핑 애니메이션 (28ms/자, 탭하면 즉시 완료)
- 선택지 버튼 (`requiredItem` 미보유 시 자동 잠금 + "🔒 X 필요" 힌트)
- `grantItem` 으로 선택지 통해 아이템 획득
- 인벤토리 칩 UI (상단 sticky)
- 진행도 자동 저장 / 이어하기
- 달성 결말 누적 (resetToTitle 시 보존)
- 엔딩 화면 → 광고 스텁 호출 → 타이틀 복귀

## 빌드 & 실행
```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드 (tsc -b + vite build)
npm run preview   # 빌드 결과 미리보기
```

## 배포
- **자동 배포**: `git push origin main` 시 Vercel이 자동으로 production 배포 실행
- **수동 배포** (긴급/로컬에서): `npx vercel --prod --yes`
- **PR 미리보기**: 다른 브랜치 푸시 / PR 생성 시 자동으로 preview URL 생성

## 주의사항
- 새 노드 추가 시 반드시 도달 가능성 확인 (`node -e` 스크립트로 BFS 검증)
- `requiredItem` 명칭은 한국어 일관성 유지 (예: "라이터", "지도", "로프", "칼", "약상자", "무전기", "배터리", "부싯돌", "손전등", "호루라기")
- 엔딩 노드 식별: `choices.length === 0` (or `endingType` 존재). 둘 중 하나만으로도 동작하지만 보통 함께 둠
- `recordEnding`은 중복 등록을 자동으로 차단 (배열 includes 체크)
- localStorage 키: `finalchoice:save:v1` — 스키마 깨질 때 v2로 올릴 것
- 타이핑 도중 `nodeId` 변경 시 `resetKey` 변경되어 자동 재시작
- AdMob 실연동 전까지 `showInterstitialAd` 는 즉시 resolve. 광고 노출 빈도 제어가 필요하면 함수 내부에서 마지막 노출 시각 체크 권장.
