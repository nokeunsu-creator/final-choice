# FinalChoice — 텍스트 기반 어드벤처 시리즈 (서버리스)

## 작업 규칙
- 기능 추가/구조 변경/버그 수정 후 이 파일의 관련 섹션을 최신 상태로 업데이트할 것
- **개발 완료 시 반드시 배포**: 기능 구현이 완료되면 자동 배포 (push 트리거) 또는 `npx vercel --prod --yes`
- Vercel CLI는 사내 TLS 가로채기 환경에서 self-signed cert 오류 발생 → `NODE_TLS_REJECT_UNAUTHORIZED=0` 환경변수로 우회 (인증·배포·whoami 모두 동일)

## 프로젝트 개요
서버 없이 동작하는 **시리즈형** 텍스트 기반 어드벤처 게임. 50개의 시나리오 (테마별로 분리된 독립 이야기) 중 하나를 골라 분기 선택지를 거쳐 다양한 결말에 도달한다.

- **라이브 URL**: https://final-choice.vercel.app
- **GitHub**: https://github.com/nokeunsu-creator/final-choice
- **Vercel 프로젝트**: nokeunsu-1200s-projects/final-choice (GitHub 연동 자동 배포)
- **데이터**: 진행도(시나리오ID, 현재 노드, 인벤토리, 방문 노드, 달성 결말) localStorage 저장 — 시나리오별 독립

## 기술 스택
- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 (현재는 인라인 스타일 위주, 다크 톤)
- localStorage 데이터 저장 (서버 없음)
- 타이핑 애니메이션 (setTimeout 기반)

## 핵심 아키텍처

### 데이터 모델 (`src/data/types.ts`)
- `StoryNode`: nodeId, text, choices[], endingType?, endingTitle?
- `Choice`: label, nextNodeId, requiredItem(string|null), grantItem?(string|null)
- `ScenarioMeta`: id, title, subtitle, description, icon, accent
- 엔딩 노드는 `choices: []` + `endingType` ('good'|'bad'|'neutral') + `endingTitle`로 표현

### 시나리오 데이터 (`assets/scenarios/`)
- `manifest.json` — 모든 시나리오 메타 (id, title, accent 등)
- `<scenario-id>.json` — 시나리오별 노드 배열 (각 파일 독립)
- 시나리오ID = 케밥케이스 (예: `desert-island`, `haunted-house`)
- 데스트 아일랜드는 100노드/25엔딩, 나머지는 22노드/4-9엔딩 (확장 작업 진행 중)
- `src/data/scenarios.ts` 가 모든 시나리오 정적 import + Map 캐시 + 헬퍼 (`getNode`, `isEnding`, `getNodeCount`, `getEndingCount`)

### 시나리오 카탈로그 (현재)
| ID | 제목 | 노드 | 엔딩 | 색상 |
|---|---|---|---|---|
| desert-island | 무인도 생존 | 100 | 25 | #ffaa00 |
| haunted-house | 폐가 탈출 | 22 | 7 | #a78bfa |
| zombie-city | 좀비 도시 | 22 | 4 | #ef4444 |
| spaceship | 우주선 표류 | 22 | 9 | #22d3ee |
| dungeon | 지하 던전 | 22 | 6 | #d4a017 |
| snow-mountain | 설산 조난 | 22 | 8 | #93c5fd |
| cyberpunk | 사이버 도시 | 22 | 6 | #f472b6 |
| hotel-mystery | 외딴 호텔 | 22 | 5 | #dc2626 |
| deep-sea | 심해 잠수정 | 22 | 6 | #3b82f6 |
| time-traveler | 시간 여행자 | 22 | 6 | #eab308 |

목표: 50개 시나리오. 진행 중 — 추가 40개는 ~15-22 노드 규모로 작성 예정.

### 상태 관리 (`src/state/GameContext.tsx`)
- React Context + useReducer
- **`SaveState` 스키마**:
  ```ts
  { scenarioId: string | null, byScenario: Record<scenarioId, ScenarioState> }
  ```
- **`ScenarioState`**: `{ currentNodeId, inventory[], visitedNodes[], endingsCleared[] }`
- 액션: `SELECT_SCENARIO`, `GO_TO` (grantItem 동시 처리), `RESET_CURRENT_SCENARIO` (엔딩 누적은 보존), `EXIT_TO_TITLE`, `RECORD_ENDING` (중복 차단), `HYDRATE`
- **localStorage 키**: `finalchoice:save:v2` (v1은 단일 시나리오용 구버전)
- 자동 저장: state 변경 시 localStorage 직렬화 (디바운스 없음 — 단순 데이터)
- 시작 시 localStorage 복원
- 컨텍스트 함수는 `useCallback` + value는 `useMemo` 로 안정화 → 의존 effect 무한루프 방지

### 라우팅 (`src/App.tsx`)
- 화면 상태: `'title' | 'play'`
- Router가 `isEnding(currentNode)` 체크 → 즉시 EndingScreen 분기 (1.5s 딜레이 제거됨)
- 엔딩 도달 시 `recordEnding` 자동 호출 (Router useEffect)
- TitleScreen에서는 `selectScenario` 호출 후 `setScreen('play')`

### 광고 (`src/ads/interstitial.ts`)
- `showInterstitialAd()` Promise 스텁 (현재 즉시 resolve, dev에서 console.log)
- 호출 위치: `EndingScreen` 의 "같은 이야기 다시" / "다른 이야기 고르기" 버튼 양쪽 (광고 종료 후 화면 전환)
- TWA 환경에서는 AdSense 인터스티셜, RN 전환 시 `react-native-google-mobile-ads` 로 교체 가능

## 폴더 구조
```
FinalChoice/
├── assets/
│   └── scenarios/
│       ├── manifest.json           # 모든 시나리오 메타
│       ├── desert-island.json      # 100 nodes
│       ├── haunted-house.json      # 22 nodes
│       ├── zombie-city.json        # 22 nodes
│       ├── spaceship.json          # 22 nodes
│       ├── dungeon.json            # 22 nodes
│       ├── snow-mountain.json      # 22 nodes
│       ├── cyberpunk.json          # 22 nodes
│       ├── hotel-mystery.json      # 22 nodes
│       ├── deep-sea.json           # 22 nodes
│       └── time-traveler.json      # 22 nodes
├── src/
│   ├── data/
│   │   ├── types.ts                # StoryNode, Choice, EndingType, ScenarioMeta
│   │   └── scenarios.ts            # 모든 시나리오 import + Map 캐시 + 헬퍼
│   ├── state/
│   │   └── GameContext.tsx         # Context + reducer + localStorage v2 (per-scenario)
│   ├── ads/
│   │   └── interstitial.ts         # showInterstitialAd() 스텁
│   ├── components/
│   │   ├── TypewriterText.tsx      # 타이핑 애니메이션 (탭 → 즉시 완료)
│   │   ├── ChoiceButton.tsx        # 선택지 버튼 (잠금 상태 표시)
│   │   └── Inventory.tsx           # 상단 인벤토리 칩
│   ├── screens/
│   │   ├── TitleScreen.tsx         # 시나리오 그리드 (카드 + 진행도)
│   │   ├── GameScreen.tsx          # 노드 진행 (헤더에 시나리오 표시 + 시나리오 선택 복귀)
│   │   └── EndingScreen.tsx        # 엔딩 (같은 이야기 다시 / 다른 이야기 고르기 — 광고 양쪽 트리거)
│   ├── App.tsx                     # Router (title/play + isEnding 체크)
│   ├── main.tsx
│   ├── index.css                   # Tailwind 4 + 글로벌 다크 스타일 + cursor 깜빡임
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json                     # CSP + 보안 헤더
```

## 구현된 기능
- 시나리오 그리드 타이틀 (10개 카드, 진행도/달성결말 표시, 진행 중 배지)
- 시나리오별 독립 진행도 (localStorage v2 byScenario)
- 다양한 분기 노드 + 엔딩 (good/bad/neutral 색상 구분)
- 타이핑 애니메이션 (28ms/자, 탭하면 즉시 완료)
- 선택지 버튼 (`requiredItem` 미보유 시 자동 잠금 + "🔒 X 필요" 힌트)
- `grantItem` 으로 선택지 통해 아이템 획득
- 인벤토리 칩 UI (상단 sticky)
- 진행도 자동 저장 / 이어하기 (시나리오별)
- 달성 결말 누적 (resetCurrentScenario 시 보존)
- 엔딩 → 광고 스텁 → 같은 시나리오 다시 / 다른 시나리오 고르기

## 빌드 & 실행
```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드 (tsc -b + vite build)
npm run preview   # 빌드 결과 미리보기
```

## 배포
- **자동 배포**: `git push origin main` → Vercel webhook → 자동 production 배포
- **수동 배포** (긴급/로컬): `NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel --prod --yes`
- **PR 미리보기**: 다른 브랜치 푸시 / PR 생성 시 자동으로 preview URL 생성
- **자동 배포 폴링**: 새 번들 적용 확인 — `until curl -sk https://final-choice.vercel.app/ | grep -q 'index-NEWHASH'; do sleep 4; done`

## 주의사항
- **새 시나리오 추가 시**: (1) `assets/scenarios/<id>.json` 작성 → (2) `manifest.json` 에 메타 추가 → (3) `src/data/scenarios.ts` 에 import + DATA 맵에 등록. 셋 다 누락 없이.
- **노드 추가 시 반드시 도달 가능성 확인**:
  ```bash
  node -e "
  const fs = require('fs');
  const dir = 'assets/scenarios';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(\`\${dir}/\${f}\`, 'utf8'));
    const byId = new Map(data.map(n => [n.nodeId, n]));
    const visited = new Set();
    const queue = [1];
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const node = byId.get(id);
      if (!node) continue;
      for (const c of node.choices || []) if (!visited.has(c.nextNodeId)) queue.push(c.nextNodeId);
    }
    const unreachable = data.filter(n => !visited.has(n.nodeId));
    console.log(f, unreachable.length ? 'UNREACHABLE: '+unreachable.map(n=>n.nodeId) : 'OK '+data.length);
  }
  "
  ```
- **양방향 사이클 주의**: A↔B 형태의 "되돌아가기" 선택지는 사용자에게 같은 장면이 반복되는 느낌을 줌. 가능하면 일방통행 그래프로. 부득이하면 visitedNodes로 재방문 시 텍스트 변형 권장.
- **`requiredItem` 명칭은 한국어 일관성 유지** (시나리오 안에서 — 예: "라이터", "지도", "로프", "칼" 등). 시나리오 간에는 자유롭게 다른 아이템.
- **엔딩 노드 식별 규칙**: `choices.length === 0` (boolean) — `endingType`/`endingTitle`은 표시용 메타. 둘 다 함께 둘 것.
- **`recordEnding` 은 중복 자동 차단** (reducer에서 `includes` 체크)
- **타이핑 도중 노드 변경 시**: `resetKey` 가 `${scenarioId}-${nodeId}` 형식으로 자동 재시작
- **AdMob 실연동 전까지** `showInterstitialAd` 는 즉시 resolve. 광고 노출 빈도 제어가 필요하면 함수 내부에서 마지막 노출 시각 체크 권장.

## 디자인 시스템 (현재 인라인, 향후 토큰화 예정)
- 배경: `#0a0a0a` (near black, OLED 친화)
- 표면: `#0c0c0c` (header), `#111`/`#171717` (카드/버튼)
- 텍스트: `#e8e8e8` (본문), `#888` (보조), `#666`/`#555` (라벨)
- 메인 액센트: `#ffaa00` (호박색)
- 위험: `#ff6666` / 성공: `#7dffaa` / 다른 길: `#ffaa00`
- 폰트: monospace 스택 (D2Coding → Cascadia Code → 시스템 mono)
  ⚠️ 한글은 폴백 OS 폰트로 떨어짐 — 추후 Pretendard/IBM Plex Sans KR 웹폰트 로드 권장
- 모서리: 6-8px, 좌측 액센트 보더 3-4px

## 알려진 개선 과제 (HIGH)
1. 한글 웹폰트 로드 (Pretendard 등) — 모노 폴백으로 한글이 시스템 기본에 의존
2. `:focus-visible` 키보드 포커스 outline 부재
3. 회색 톤 9단계 토큰 정리 (현재 magic number)
4. EndingScreen 긴 본문 + `space-between` 레이아웃 모바일 오버플로 검증 필요
5. 시나리오 50개로 확장 (현재 10/50)
