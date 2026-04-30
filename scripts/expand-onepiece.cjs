// 14개 원피스 시나리오를 25 결말로 일괄 확장.
// 각 시나리오에 4개 hub + 16-20 endings 추가.
const fs = require('fs');
const path = require('path');

// 각 시나리오의 확장 정의.
// startId: 새 노드 시작 ID. 4 hubs + endings.
// 4 hubs at startId, +6, +12, +18.
// Each hub branches to 4-5 endings.
function buildExpansion(startId, hubs) {
  const newNodes = [];
  const node1Choices = [];
  let nodeId = startId;
  for (const hub of hubs) {
    const hubId = nodeId++;
    const choices = [];
    const endingNodes = [];
    for (const e of hub.endings) {
      const eId = nodeId++;
      choices.push({
        label: e.label,
        nextNodeId: eId,
        requiredItem: null,
        grantItem: null,
        traits: e.traits || [],
      });
      endingNodes.push({
        nodeId: eId,
        text: e.text,
        choices: [],
        endingType: e.type,
        endingTitle: e.title,
      });
    }
    newNodes.push({ nodeId: hubId, text: hub.text, choices });
    newNodes.push(...endingNodes);
    node1Choices.push({
      label: hub.entryLabel,
      nextNodeId: hubId,
      requiredItem: null,
      grantItem: null,
      traits: hub.entryTraits || [],
    });
  }
  return { node1Choices, newNodes, nextId: nodeId };
}

// 각 시나리오 정의
const SCENARIOS = {
  'onepiece-eastblue': {
    startId: 15,
    target: 19, // 6 + 19 = 25
    hubs: [
      {
        entryLabel: '동료 합류 — 누구부터?',
        entryTraits: ['협력'],
        text: '첫 동료. 누구부터 만난다?',
        endings: [
          { label: '조로 — 셰리프 처치 후 합류', traits: ['용기'], text: '조로. 그가 \"내 칼 — 너의 동료.\" 첫 동료.', type: 'good', title: '조로의 합류' },
          { label: '나미 — 도둑이지만 항해사', traits: ['협력'], text: '나미. 그녀의 항해 능력. 보물 + 지도 함께.', type: 'good', title: '나미의 항해' },
          { label: '우솝 — 거짓말쟁이 저격수', traits: ['직관'], text: '우솝. 그의 거짓말이 마을을 살림. 합류.', type: 'good', title: '우솝의 거짓말' },
          { label: '상디 — 바라티에의 요리사', traits: ['이타'], text: '상디. \"전드의 의지로 — 모두를 먹인다.\" 합류.', type: 'good', title: '상디의 의지' },
          { label: '혼자 — 동료 없이', traits: ['독자'], text: '혼자. 외로운 항해. 그러나 자유.', type: 'neutral', title: '혼자의 자유' },
        ],
      },
      {
        entryLabel: '첫 모험 — 동네 해적',
        entryTraits: ['용기'],
        text: '첫 적. 어떤 모험?',
        endings: [
          { label: '알빈다 해적단 격파', traits: ['용기'], text: '알빈다. 그녀의 철구가 빗나감 — 한 방.', type: 'good', title: '알빈다의 한 방' },
          { label: '버기 격파 — 분리분리 열매', traits: ['용기','분석'], text: '버기. 분리된 그를 모래 상자에. 그가 \"이거 내 약점\" 발각.', type: 'good', title: '버기의 모래' },
          { label: '쿠로 격파 — 셰리프 발톱', traits: ['용기','협력'], text: '쿠로. 그의 발톱을 우솝이 막음. 합공.', type: 'good', title: '쿠로의 발톱' },
          { label: '알롱 — 어인 해적 격파', traits: ['정면','용기'], text: '알롱. 나미의 마을 해방. 둘이 \"같이 가자.\"', type: 'good', title: '알롱 해방' },
          { label: '도망 — 첫 적에게 패배', traits: ['회피'], text: '도망. 첫 모험 실패. 다시 시작.', type: 'bad', title: '첫 패배' },
        ],
      },
      {
        entryLabel: '항해 장비 — 무엇 먼저?',
        entryTraits: ['분석'],
        text: '장비. 우선순위?',
        endings: [
          { label: '메리호 — 첫 배', traits: ['협력'], text: '메리. 우솝의 친구 메리가 만든 배. 출항.', type: 'good', title: '메리의 배' },
          { label: '로그포스 — 그랜드라인 나침반', traits: ['분석'], text: '로그포스. 그러나 그랜드라인 입구까지 못 감. 다음 단계로.', type: 'neutral', title: '로그포스의 부재' },
          { label: '지도 — 위대한 항로', traits: ['분석'], text: '지도. 그러나 그랜드라인은 지도가 무용. 항해사 의존.', type: 'neutral', title: '지도의 한계' },
          { label: '식량 — 1년치 비축', traits: ['실용'], text: '식량 1년치. 풍성한 항해. 그러나 무거움.', type: 'good', title: '풍성한 항해' },
        ],
      },
      {
        entryLabel: '길 결정 — 어떤 해적?',
        entryTraits: ['원칙'],
        text: '어떤 해적이 될까?',
        endings: [
          { label: '해적왕 — 루피처럼', traits: ['용기','원칙'], text: '해적왕 도전. 그러나 너는 동료.', type: 'good', title: '해적왕의 동료' },
          { label: '해상 보안관 — 정의', traits: ['원칙'], text: '해상 보안관. 그러나 해군과 별도.', type: 'good', title: '바다의 보안관' },
          { label: '해군 가입 — 정의 측', traits: ['원칙'], text: '해군. 군법대로. 그러나 친구 루피와 적.', type: 'neutral', title: '루피와 적' },
          { label: '해상 상인 — 평화로운 길', traits: ['실용','협력'], text: '상인. 무역으로 부자. 그러나 모험 ✗.', type: 'good', title: '상인의 길' },
          { label: '해적 마법사 — 능력 추구', traits: ['독자','분석'], text: '능력. 악마의 열매 찾아 평생. 그러나 외로움.', type: 'neutral', title: '능력의 외로움' },
        ],
      },
    ],
  },
  'onepiece-grandline': {
    startId: 15,
    target: 16, // 9 + 16 = 25
    hubs: [
      {
        entryLabel: '리버스 마운틴 — 어떻게 오를까',
        entryTraits: ['분석'],
        text: '리버스. 4개 바다의 물이 만나는 산.',
        endings: [
          { label: '돛 정확히 — 바람 활용', traits: ['분석'], text: '돛 정확. 4개 바람을 활용해 정점.', type: 'good', title: '4바람의 정점' },
          { label: '엔진 풀가속', traits: ['용기'], text: '엔진. 풀가속으로 산 정상. 그러나 연료 다 씀.', type: 'neutral', title: '연료의 끝' },
          { label: '라부 고래 위에서', traits: ['이타'], text: '라부. 거대 고래 위에서 정상까지. 친구.', type: 'good', title: '라부의 등' },
          { label: '실패 — 산으로 추락', traits: ['회피'], text: '추락. 다시 시작.', type: 'bad', title: '리버스의 추락' },
        ],
      },
      {
        entryLabel: '7무해 — 누구와 거래?',
        entryTraits: ['분석'],
        text: '7무해 중 한 명과 거래?',
        endings: [
          { label: '미호크 — 검술의 길', traits: ['용기'], text: '미호크. 그가 \"네 칼은 가능성.\" 제자.', type: 'good', title: '미호크의 제자' },
          { label: '징베 — 어인 해적', traits: ['협력','이타'], text: '징베. 어인섬 동맹. 그가 \"인간과 어인의 다리.\"', type: 'good', title: '인간과 어인' },
          { label: '도플라밍고 거래', traits: ['회피'], text: '도플라밍고. 그가 \"실의 거래\" 제안. 너 거절.', type: 'neutral', title: '실의 거절' },
          { label: '바솔로뮤 쿠마', traits: ['독자'], text: '쿠마. 그가 너를 다른 차원으로. 2년 후 만남.', type: 'neutral', title: '쿠마의 손' },
        ],
      },
      {
        entryLabel: '동료 추가 — 누구?',
        entryTraits: ['협력'],
        text: '추가 동료?',
        endings: [
          { label: '쵸파 — 의사', traits: ['이타','협력'], text: '쵸파. 친구가 된 순록 의사.', type: 'good', title: '쵸파의 합류' },
          { label: '로빈 — 고고학자', traits: ['분석'], text: '로빈. 그녀의 고대 문자 해독. 라프텔의 길.', type: 'good', title: '로빈의 해독' },
          { label: '프랭키 — 조선공', traits: ['실용','협력'], text: '프랭키. 새 배 + 사이보그. 강력한 동료.', type: 'good', title: '프랭키의 도크' },
          { label: '브룩 — 음악가', traits: ['이타'], text: '브룩. 50년의 외로움 후 합류.', type: 'good', title: '브룩의 음악' },
        ],
      },
      {
        entryLabel: '항해 도전 — 무엇?',
        entryTraits: ['용기'],
        text: '도전?',
        endings: [
          { label: '날씨 헌터 — 나미 훈련', traits: ['분석'], text: '날씨. 나미가 그랜드라인의 변동 패턴 마스터.', type: 'good', title: '나미의 마스터' },
          { label: '바다 왕 사냥', traits: ['용기','정면'], text: '바다왕. 거대 어룡 한 마리. 식량.', type: 'good', title: '바다왕 사냥' },
          { label: '에버메드 — 영원의 약', traits: ['이타'], text: '에버메드. 누군가의 병 치료. 평생 보람.', type: 'good', title: '영원의 약' },
          { label: '폭풍 한가운데', traits: ['용기'], text: '폭풍. 그러나 동료들이 함께 — 통과.', type: 'good', title: '폭풍 통과' },
        ],
      },
    ],
  },
  'onepiece-marineford': {
    startId: 15,
    target: 20,
    hubs: [
      {
        entryLabel: '해군 7무해 — 누구를 먼저?',
        entryTraits: ['분석'],
        text: '7무해 + 3대장 — 우선?',
        endings: [
          { label: '쿠잔 (아오키지) — 얼음', traits: ['정면'], text: '아오키지. 얼음의 힘으로 바다가 얼음. 그러나 에이스 못 살림.', type: 'bad', title: '얼음의 한계' },
          { label: '사카즈키 (아카이누) — 마그마', traits: ['정면','용기'], text: '아카이누. 그가 에이스를 한 방. 무력.', type: 'bad', title: '마그마의 한 방' },
          { label: '보르사리노 (키자루) — 빛', traits: ['용기'], text: '키자루. 빛의 속도. 너 못 따라옴.', type: 'bad', title: '빛의 부재' },
          { label: '센고쿠 — 부처', traits: ['원칙'], text: '센고쿠. 그가 사형 명령 — 거대 손.', type: 'bad', title: '부처의 명령' },
          { label: '미호크 — 검의 길', traits: ['용기'], text: '미호크. 검의 결투. 너 패배.', type: 'bad', title: '검의 결투' },
        ],
      },
      {
        entryLabel: '백수 해적단 — 동료',
        entryTraits: ['협력'],
        text: '백수 해적단의 누구?',
        endings: [
          { label: '에드워드 뉴게이트 (흰수염)', traits: ['용기','이타'], text: '흰수염. 그가 \"아들 살리려 죽는다.\" 그의 마지막.', type: 'good', title: '아버지의 마지막' },
          { label: '마르코 — 불사조', traits: ['협력','이타'], text: '마르코. 불사조의 깃털. 동맹.', type: 'good', title: '불사조의 깃털' },
          { label: '조즈 — 다이아몬드 신체', traits: ['용기'], text: '조즈. 다이아몬드 신체로 해군 막음.', type: 'good', title: '다이아몬드의 방패' },
          { label: '비스타 — 검술 1번대', traits: ['협력','용기'], text: '비스타. 그의 검술. 1번대 합공.', type: 'good', title: '1번대의 검' },
          { label: '에이스 직접', traits: ['이타'], text: '에이스. 그가 \"형 — 이미 늦었어.\" 마지막 미소.', type: 'bad', title: '에이스의 미소' },
        ],
      },
      {
        entryLabel: '루피 합류 — 동생 구하기',
        entryTraits: ['이타','용기'],
        text: '루피와 함께. 어떻게?',
        endings: [
          { label: '지로 함대 + 임펠다운 탈옥', traits: ['용기'], text: '지로. 임펠다운에서 함대 모음. 마린포드 입성.', type: 'good', title: '지로 함대' },
          { label: '이반코프 — 호르몬 회복', traits: ['이타'], text: '이반코프. 호르몬으로 루피 회복. 하지만 한계.', type: 'neutral', title: '호르몬의 한계' },
          { label: '직접 처형대로 돌진', traits: ['정면','용기'], text: '돌진. 처형대 위 에이스 — 한 발 늦었다.', type: 'bad', title: '한 발 늦음' },
          { label: '백수와 협력 작전', traits: ['협력','원칙'], text: '협력. 흰수염 + 루피 + 너. 합공으로 에이스 일시 구출.', type: 'good', title: '합공의 구출' },
          { label: '쿠마의 발길질로 사라짐', traits: ['회피'], text: '쿠마. 너를 다른 섬으로. 2년 수련.', type: 'neutral', title: '2년의 수련' },
        ],
      },
      {
        entryLabel: '결과 — 마린포드 이후',
        entryTraits: ['원칙'],
        text: '전투 끝나고 어떻게?',
        endings: [
          { label: '에이스 살림 + 흰수염 살림', traits: ['용기','이타'], text: '둘 다. 마린포드의 기적. 새 시대.', type: 'good', title: '마린포드의 기적' },
          { label: '둘 다 잃음 — 슬픔', traits: ['이타'], text: '둘 다. 루피와 너의 마음 깊이.', type: 'bad', title: '두 손실' },
          { label: '검은수염 — 흰수염 능력 흡수', traits: ['정면'], text: '검은수염. 흰수염의 능력 흡수. 새 황제 등장.', type: 'bad', title: '검은수염의 등장' },
          { label: '신세계로 — 새 시대', traits: ['용기'], text: '신세계. 너의 진짜 모험.', type: 'good', title: '새 시대의 시작' },
          { label: '2년 휴식 — 동료들과 약속', traits: ['원칙','협력'], text: '2년. 모든 동료와 \"다시 만나자.\"', type: 'good', title: '2년의 약속' },
          { label: '도망 — 마린포드 떠남', traits: ['회피'], text: '도망. 너의 길은 다른 곳.', type: 'neutral', title: '다른 길' },
        ],
      },
    ],
  },
  'onepiece-skypiea': {
    startId: 15,
    target: 17,
    hubs: [
      {
        entryLabel: '에넬 신 — 어떻게 막을까',
        entryTraits: ['분석'],
        text: '에넬. 번개의 신. 그러나 약점은?',
        endings: [
          { label: '루피 — 고무 신체', traits: ['용기'], text: '루피. 고무는 번개 무효. 그가 직접 한 방.', type: 'good', title: '고무의 무효' },
          { label: '황금 종 — 한 번의 일격', traits: ['원칙','용기'], text: '황금 종. 그것을 울려 4백년 만의 신호.', type: 'good', title: '황금 종의 신호' },
          { label: '에넬과 협상 — \"달로 보내드림\"', traits: ['직관','회피'], text: '협상. 그가 달로 떠남. 하늘섬 자유.', type: 'good', title: '달의 약속' },
          { label: '도망 — 번개 한 방', traits: ['회피'], text: '도망. 번개에 한 방.', type: 'bad', title: '번개의 끝' },
        ],
      },
      {
        entryLabel: '구름 위 항해 — 어떻게',
        entryTraits: ['용기'],
        text: '구름 바다. 어떤 항해?',
        endings: [
          { label: '구름 끓는 — 백색 바다 통과', traits: ['용기'], text: '백색 바다. 끓는 구름. 통과.', type: 'good', title: '백색 바다' },
          { label: '구름 가르기 — 노 비어머피', traits: ['협력'], text: '노. 동료가 함께 노 저음. 협력.', type: 'good', title: '노의 협력' },
          { label: '비행 — 쟈야 신호', traits: ['직관'], text: '쟈야. 4백년 전 도시의 신호. 비행.', type: 'good', title: '쟈야의 비행' },
          { label: '폭풍 — 구름 바다 폭풍', traits: ['회피'], text: '폭풍. 떨어짐.', type: 'bad', title: '구름의 폭풍' },
        ],
      },
      {
        entryLabel: '하늘 사람 — 동맹',
        entryTraits: ['협력'],
        text: '하늘 사람과 동맹.',
        endings: [
          { label: '와이퍼 — 슈란디아 전사', traits: ['용기','협력'], text: '와이퍼. 슈란디아의 전사. 동맹.', type: 'good', title: '슈란디아의 와이퍼' },
          { label: '코니스 — 가이드', traits: ['협력'], text: '코니스. 그녀가 안내. 안전 항해.', type: 'good', title: '코니스의 안내' },
          { label: '간 폴 — 옛 신관', traits: ['이타','협력'], text: '간 폴. 옛 신관. 진실을 알려줌.', type: 'good', title: '간 폴의 진실' },
          { label: '슈란디아 vs 하늘 사람 중재', traits: ['원칙','이타'], text: '중재. 4백년의 갈등 해소.', type: 'good', title: '4백년의 화해' },
        ],
      },
      {
        entryLabel: '황금 — 어떻게 가져갈까',
        entryTraits: ['실용'],
        text: '하늘섬의 황금. 어떻게?',
        endings: [
          { label: '전부 — 최대치', traits: ['자기'], text: '전부. 배가 무거워 침몰 직전.', type: 'neutral', title: '황금의 무게' },
          { label: '일부만 — 적당히', traits: ['실용','신중'], text: '일부. 적당량. 안전 귀환.', type: 'good', title: '적당의 귀환' },
          { label: '버림 — 하늘섬에', traits: ['이타','원칙'], text: '버림. 하늘섬에 두고 옴. 그들의 자원.', type: 'good', title: '하늘섬의 자원' },
          { label: '비밀 — 단서만', traits: ['분석','독자'], text: '단서. 다음 모험으로.', type: 'good', title: '다음의 단서' },
          { label: '나미 — 그녀에게', traits: ['이타','협력'], text: '나미. 그녀의 고향 재건. 우정.', type: 'good', title: '나미의 고향' },
        ],
      },
    ],
  },
  'onepiece-impeldown': {
    startId: 15,
    target: 19,
    hubs: [
      {
        entryLabel: '간수 — 누구를 먼저?',
        entryTraits: ['분석'],
        text: '간수장 마젤란. 그러나 그 전에?',
        endings: [
          { label: '한니발 — 짐승 부대', traits: ['용기'], text: '한니발. 짐승 부대 격파.', type: 'good', title: '짐승 부대' },
          { label: '사디 — 채찍의 여인', traits: ['용기'], text: '사디. 그녀의 채찍. 회피.', type: 'good', title: '채찍의 회피' },
          { label: '도미노 — 부 장관', traits: ['용기'], text: '도미노. 부 장관. 한 방.', type: 'good', title: '도미노의 한 방' },
          { label: '마젤란 직접', traits: ['정면','용기'], text: '마젤란. 독독 능력. 무력.', type: 'bad', title: '독의 끝' },
        ],
      },
      {
        entryLabel: '죄수 — 누구를 풀어줄까',
        entryTraits: ['이타','협력'],
        text: '풀어줄 죄수?',
        endings: [
          { label: '이반코프 — 혁명군', traits: ['협력'], text: '이반코프. 혁명군 합류. 동맹.', type: 'good', title: '혁명군 합류' },
          { label: '크로커다일 — 7무해', traits: ['용기'], text: '크로커다일. 그가 \"흰수염을 죽이러 가\" 합류.', type: 'good', title: '크로커다일 합류' },
          { label: '미스터 1 — 검의 사나이', traits: ['용기'], text: '미스터 1. 강철 신체. 합류.', type: 'good', title: '미스터 1' },
          { label: '에이스 — 사형수', traits: ['이타','용기'], text: '에이스. 그러나 옮겨졌다. 마린포드로.', type: 'neutral', title: '에이스의 이동' },
          { label: '버기 — 광대', traits: ['협력','직관'], text: '버기. 그가 \"같이 가자.\" 합류 + 코미디.', type: 'good', title: '버기의 광대' },
        ],
      },
      {
        entryLabel: '탈옥 경로 — 어떻게',
        entryTraits: ['분석'],
        text: '탈옥 경로?',
        endings: [
          { label: '엘리베이터 — 위로', traits: ['용기'], text: '엘리베이터. 빠르게 위로.', type: 'good', title: '엘리베이터의 속도' },
          { label: '카프와 사냥 코스', traits: ['직관'], text: '카프와. 그것을 타고. 빠른 탈출.', type: 'good', title: '카프와의 탈출' },
          { label: '잠수 — 지하 통로', traits: ['신중'], text: '잠수. 지하 통로. 안전.', type: 'good', title: '지하의 안전' },
          { label: '직접 돌파 — 정문', traits: ['정면','용기'], text: '정문. 무력. 그러나 동료들과 합공.', type: 'good', title: '정문의 합공' },
          { label: '독에 중독 — 실패', traits: ['회피'], text: '독. 마젤란의 독에 중독. 끝.', type: 'bad', title: '독의 중독' },
        ],
      },
      {
        entryLabel: '레벨 6 — 가장 깊은 곳',
        entryTraits: ['용기','정면'],
        text: '레벨 6. 가장 위험한 죄수.',
        endings: [
          { label: '검은수염 일행 만남', traits: ['정면'], text: '검은수염. 그가 \"동료가 필요해.\" 거절.', type: 'neutral', title: '검은수염의 제안' },
          { label: '시류 — 비의 시류', traits: ['용기'], text: '시류. 비의 능력. 무력.', type: 'bad', title: '비의 끝' },
          { label: '카타리나 데번', traits: ['용기'], text: '데번. 그녀의 능력. 회피.', type: 'good', title: '데번의 회피' },
          { label: '바스코 샷', traits: ['용기'], text: '바스코. 그러나 그가 검은수염 합류.', type: 'neutral', title: '바스코의 선택' },
          { label: '레벨 6 — 그냥 통과', traits: ['신중'], text: '통과. 가만히 — 안전.', type: 'good', title: '통과의 안전' },
        ],
      },
    ],
  },
  'onepiece-fishman': {
    startId: 15,
    target: 18,
    hubs: [
      {
        entryLabel: '왕 — 누구와 동맹',
        entryTraits: ['협력','원칙'],
        text: '어인섬 왕가. 누구와?',
        endings: [
          { label: '넵튠 왕', traits: ['협력'], text: '넵튠. 평화의 왕. 동맹.', type: 'good', title: '넵튠의 동맹' },
          { label: '시라호시 — 인어 공주', traits: ['이타'], text: '시라호시. 그녀의 능력 — 바다왕 부르기.', type: 'good', title: '시라호시의 부름' },
          { label: '징베 — 7무해 탈퇴', traits: ['협력','용기'], text: '징베. 7무해 탈퇴 후 합류.', type: 'good', title: '징베의 합류' },
          { label: '호디 존스 — 적 측', traits: ['정면'], text: '호디. 그러나 그가 적. 정면 결투.', type: 'good', title: '호디의 결투' },
        ],
      },
      {
        entryLabel: '신 인종 차별 — 어떻게',
        entryTraits: ['이타','원칙'],
        text: '인간 vs 어인. 갈등.',
        endings: [
          { label: '오토히메 왕비의 유언 따름', traits: ['이타','원칙'], text: '오토히메. 그녀의 유언 — 평화. 따름.', type: 'good', title: '오토히메의 유언' },
          { label: '인간 차별 받아들임 — 부정', traits: ['독자'], text: '부정. 어인은 어인끼리. 분리.', type: 'neutral', title: '분리의 길' },
          { label: '루피의 친구 발언 — \"같은 친구\"', traits: ['협력','이타'], text: '루피. 그가 \"인간이건 어인이건 — 친구.\" 평화.', type: 'good', title: '루피의 친구' },
          { label: '평화 협정 체결', traits: ['원칙','협력'], text: '협정. 인간 + 어인 정식 동맹.', type: 'good', title: '평화 협정' },
        ],
      },
      {
        entryLabel: '바다 깊이 — 어떻게 살까',
        entryTraits: ['분석'],
        text: '해저 1만m. 살기?',
        endings: [
          { label: '코팅 풍선 — 보호', traits: ['신중'], text: '코팅. 풍선 안전.', type: 'good', title: '코팅의 안전' },
          { label: '구장이 — 신화 어룡', traits: ['용기'], text: '구장이. 신화의 어룡. 그것 등 위.', type: 'good', title: '신화의 어룡' },
          { label: '하트의 능력 — 로의 룸', traits: ['협력'], text: '로. 그의 룸 능력. 안전 통과.', type: 'good', title: '로의 룸' },
          { label: '직접 — 코팅 없이', traits: ['용기','자기'], text: '직접. 압력으로 죽음.', type: 'bad', title: '압력의 끝' },
        ],
      },
      {
        entryLabel: '고대 무기 — 포세이돈',
        entryTraits: ['분석','원칙'],
        text: '포세이돈. 시라호시의 능력.',
        endings: [
          { label: '비밀 — 사용 안 함', traits: ['원칙','이타'], text: '비밀. 그녀의 평화 유지.', type: 'good', title: '비밀의 평화' },
          { label: '호디에게 빼앗기지 않기', traits: ['용기','협력'], text: '호디. 그가 시라호시 노림. 막음.', type: 'good', title: '시라호시 보호' },
          { label: '루피의 약속 — \"네가 결정\"', traits: ['이타','협력'], text: '루피. \"네가 결정해.\" 그녀가 평화 결정.', type: 'good', title: '결정의 자유' },
          { label: '능력 사용 — 바다왕 모음', traits: ['용기','분석'], text: '바다왕. 시라호시 부름. 모든 위기 해결.', type: 'good', title: '바다왕의 부름' },
          { label: '비밀 누설 — 정부에', traits: ['독자','자기'], text: '누설. 정부가 그녀를 노림.', type: 'bad', title: '누설의 대가' },
          { label: '시라호시 보호 평생', traits: ['이타','원칙'], text: '평생. 너가 그녀의 호위 기사.', type: 'good', title: '평생의 호위' },
        ],
      },
    ],
  },
  'onepiece-wano': {
    startId: 15,
    target: 18,
    hubs: [
      {
        entryLabel: '카이도 — 어떤 능력',
        entryTraits: ['분석'],
        text: '카이도. 황제. 능력은?',
        endings: [
          { label: '용 형태 — 거대', traits: ['용기'], text: '용. 거대 형태. 압도적.', type: 'bad', title: '용의 압도' },
          { label: '술 + 인간 형태 — 약점', traits: ['분석'], text: '술. 그가 술 깨면 약함. 그 순간.', type: 'good', title: '술의 약점' },
          { label: '전쟁의 신 — 역사 ✗', traits: ['정면'], text: '전쟁. 역사상 패배 ✗. 압도.', type: 'bad', title: '역사의 압도' },
          { label: '폭주 — 약점은 \"인간성\"', traits: ['이타','원칙'], text: '인간성. 그를 인간 면 자극. 흔들림.', type: 'good', title: '인간성의 자극' },
        ],
      },
      {
        entryLabel: '동맹 — 누구와',
        entryTraits: ['협력'],
        text: '와노 동맹.',
        endings: [
          { label: '쿄시로 — 사무라이', traits: ['용기'], text: '쿄시로. 그의 사무라이. 합류.', type: 'good', title: '쿄시로의 사무라이' },
          { label: '히요리 — 슈란디아 공주', traits: ['이타'], text: '히요리. 와노 공주. 동맹.', type: 'good', title: '히요리의 동맹' },
          { label: '키쿠노조 — 시노부와 함께', traits: ['협력'], text: '키쿠. 그녀의 검 + 시노부의 능력.', type: 'good', title: '두 여인의 합공' },
          { label: '레드 헤드 — 빅맘 차감', traits: ['협력','분석'], text: '빅맘. 그녀와 임시 동맹. 카이도 vs 빅맘.', type: 'neutral', title: '두 황제의 격돌' },
        ],
      },
      {
        entryLabel: '오니가시마 침투 — 어떻게',
        entryTraits: ['용기','정면'],
        text: '오니가시마 침투.',
        endings: [
          { label: '정면 진입 — 정문', traits: ['정면','용기'], text: '정문. 카이도 군 1만 vs 우리. 정면.', type: 'bad', title: '정문의 1만' },
          { label: '동굴 — 야마토 안내', traits: ['협력','분석'], text: '야마토. 그의 동굴 통로. 안전.', type: 'good', title: '야마토의 동굴' },
          { label: '바다 — 어인 잠수', traits: ['협력'], text: '잠수. 어인 친구의 안내. 안전.', type: 'good', title: '잠수의 안전' },
          { label: '하늘 — 오로치의 비행기', traits: ['직관'], text: '비행기. 그러나 격추.', type: 'bad', title: '비행기의 격추' },
        ],
      },
      {
        entryLabel: '와노의 미래 — 누가 왕',
        entryTraits: ['원칙'],
        text: '와노 새 왕?',
        endings: [
          { label: '히요리 — 정통', traits: ['원칙'], text: '히요리. 정통 와노 공주. 새 왕.', type: 'good', title: '히요리 왕' },
          { label: '모모노스케 — 어린 왕', traits: ['이타','협력'], text: '모모. 어린 왕. 그러나 큰 마음.', type: 'good', title: '모모의 왕좌' },
          { label: '와노 자유 — 왕 없음', traits: ['독자','원칙'], text: '자유. 왕 없는 자치국가.', type: 'good', title: '자유 와노' },
          { label: '국제 동맹', traits: ['협력','이타'], text: '동맹. 와노가 세계와 연결. 새 시대.', type: 'good', title: '국제 와노' },
          { label: '오니가시마 그대로 — 잔존 정복', traits: ['회피'], text: '오니가시마. 카이도 잔존이 다시. 와노 위험.', type: 'bad', title: '잔존의 위협' },
          { label: '쇼군 후보 — 모리아 합류', traits: ['독자'], text: '모리아. 그가 새 쇼군. 그러나 어두운 길.', type: 'neutral', title: '어두운 쇼군' },
        ],
      },
    ],
  },
  'onepiece-laftel': {
    startId: 15,
    target: 18,
    hubs: [
      {
        entryLabel: '진정한 보물 — 무엇',
        entryTraits: ['분석'],
        text: '원피스 — 진정한 보물?',
        endings: [
          { label: '황금 — 기대대로', traits: ['실용'], text: '황금. 기대대로. 그러나 의외 실망.', type: 'neutral', title: '황금의 실망' },
          { label: '진실의 책 — 100년 공백', traits: ['분석','원칙'], text: '진실. 100년의 공백 기록. 세상 바꿈.', type: 'good', title: '100년의 진실' },
          { label: '무 — 빈 섬', traits: ['독자'], text: '무. 라프텔은 빈 섬. 보물은 여행 자체.', type: 'good', title: '여행이 보물' },
          { label: '고대 무기 — 우라누스', traits: ['용기','분석'], text: '우라누스. 고대 무기. 위험한 보물.', type: 'neutral', title: '고대 무기' },
        ],
      },
      {
        entryLabel: '루피의 자리 — 해적왕',
        entryTraits: ['협력','이타'],
        text: '루피가 해적왕 됨.',
        endings: [
          { label: '동료들과 축하', traits: ['협력','이타'], text: '축하. 9명이 라프텔에서 술. 평생의 추억.', type: 'good', title: '9명의 축하' },
          { label: '루피의 결단 — 해체', traits: ['원칙'], text: '해체. \"이제 각자의 길\" 루피의 마지막.', type: 'neutral', title: '루피의 해체' },
          { label: '다음 황제 — 너', traits: ['용기','자기'], text: '너. 루피가 \"다음 황제는 너.\" 너의 길.', type: 'good', title: '다음 황제' },
          { label: '평화의 시대', traits: ['원칙','이타'], text: '평화. 해적왕 시대 후 평화.', type: 'good', title: '평화의 시대' },
        ],
      },
      {
        entryLabel: '진실 — 세계와 어떻게',
        entryTraits: ['원칙','이타'],
        text: '100년의 진실. 세상에?',
        endings: [
          { label: '전 세계 방송 — 베가펑크처럼', traits: ['원칙','이타'], text: '방송. 전 세계가 진실 알게 됨.', type: 'good', title: '진실의 방송' },
          { label: '비밀 — 너만 안다', traits: ['독자'], text: '비밀. 너만 알고 무덤까지.', type: 'neutral', title: '비밀의 무덤' },
          { label: '혁명군과 공유 — 다음 세대', traits: ['협력','이타'], text: '혁명군. 그들이 다음 세대에 전수.', type: 'good', title: '혁명의 전수' },
          { label: '책으로 — 도서관에', traits: ['이타','원칙'], text: '책. 모두가 읽을 수 있게. 공공.', type: 'good', title: '공공의 책' },
        ],
      },
      {
        entryLabel: '귀환 — 어디로',
        entryTraits: ['협력'],
        text: '라프텔 후 어디로?',
        endings: [
          { label: '동료들의 고향 순방', traits: ['이타','협력'], text: '순방. 9명의 고향을 방문. 평생의 여행.', type: 'good', title: '고향 순방' },
          { label: '고잉 메리 — 옛 배 추모', traits: ['이타'], text: '메리. 옛 배에 절. 추모.', type: 'good', title: '메리의 추모' },
          { label: '고도시 — 너의 고향', traits: ['이타'], text: '고향. 너의 가족.', type: 'good', title: '너의 고향' },
          { label: '세계 일주 다시 — 다른 길로', traits: ['용기'], text: '다시. 다른 길로 한 번 더.', type: 'good', title: '다시의 항해' },
          { label: '신세계 영원 — 정착', traits: ['독자'], text: '정착. 라프텔에 영원히.', type: 'neutral', title: '영원의 라프텔' },
          { label: '쉴드 한 명 — 동료의 마지막', traits: ['이타'], text: '쉴드. 동료 한 명을 지키며 마지막.', type: 'good', title: '쉴드의 마지막' },
        ],
      },
    ],
  },
  'onepiece-wano-prep': {
    startId: 19,
    target: 20,
    hubs: [
      {
        entryLabel: '준비 — 무기 vs 정보',
        entryTraits: ['분석'],
        text: '준비 우선?',
        endings: [
          { label: '카타나 단조 — 호젠지', traits: ['실용'], text: '카타나. 호젠지의 명검. 강력.', type: 'good', title: '호젠지의 카타나' },
          { label: '갑옷 — 와노 정통', traits: ['신중'], text: '갑옷. 정통 와노 갑옷.', type: 'good', title: '정통 갑옷' },
          { label: '약 — 죽음 회복', traits: ['이타','신중'], text: '약. 죽음 직전 회복약.', type: 'good', title: '회복약' },
          { label: '폭탄 — 일격 무기', traits: ['용기','정면'], text: '폭탄. 일격 다수 처리.', type: 'neutral', title: '폭탄의 거리' },
          { label: '아무것도 — 맨손', traits: ['용기','독자'], text: '맨손. 무모. 그러나 자유.', type: 'bad', title: '맨손의 한계' },
        ],
      },
      {
        entryLabel: '동맹 — 누구를 우선',
        entryTraits: ['협력'],
        text: '동맹 우선순위?',
        endings: [
          { label: '광부 1000명', traits: ['협력','이타'], text: '광부. 1000명 합류. 인해전술.', type: 'good', title: '광부 1000' },
          { label: '키드 + 로 — 3대장 동맹', traits: ['협력','용기'], text: '키드 + 로. 3대장 합공.', type: 'good', title: '3대장 합공' },
          { label: '야마토 — 카이도 자녀', traits: ['이타'], text: '야마토. 그가 카이도와 정면. 너 합류.', type: 'good', title: '야마토와 합류' },
          { label: '히요리 + 사무라이', traits: ['협력','원칙'], text: '히요리. 와노 사무라이 100명.', type: 'good', title: '와노 100' },
          { label: '혼자 — 동맹 없이', traits: ['독자'], text: '혼자. 무모.', type: 'bad', title: '혼자의 무모' },
        ],
      },
      {
        entryLabel: '정찰 — 어디부터',
        entryTraits: ['분석'],
        text: '정찰 우선?',
        endings: [
          { label: '오니가시마 정문', traits: ['용기'], text: '정문. 1만 명 카이도 군.', type: 'good', title: '정문 정찰' },
          { label: '동굴 통로 — 야마토와', traits: ['협력','분석'], text: '동굴. 비밀 통로 발견.', type: 'good', title: '동굴 발견' },
          { label: '카이도 본인 — 약점', traits: ['분석'], text: '약점. 술이 깰 때.', type: 'good', title: '술의 약점' },
          { label: '오로치 — 와노 쇼군', traits: ['분석','정면'], text: '오로치. 그가 적. 우선 처리.', type: 'good', title: '오로치 처리' },
          { label: '수도 — 시민 동원', traits: ['이타','협력'], text: '수도. 시민 합류 가능성.', type: 'good', title: '수도 시민' },
        ],
      },
      {
        entryLabel: '작전 — 정면 vs 우회',
        entryTraits: ['용기','분석'],
        text: '작전 결정.',
        endings: [
          { label: '정면 — 9명 합공', traits: ['정면','용기'], text: '정면. 9명. 카이도와 직접.', type: 'bad', title: '9명의 정면' },
          { label: '우회 — 동굴 + 광부', traits: ['분석','협력'], text: '우회. 동굴 + 광부 + 시민. 다중.', type: 'good', title: '다중 우회' },
          { label: '내부 분열 유도', traits: ['분석','독자'], text: '분열. 카이도 부하 분열 유도.', type: 'good', title: '분열의 유도' },
          { label: '협상 시도 — 카이도와', traits: ['회피'], text: '협상. 그가 \"협상은 약자가\" 거절.', type: 'bad', title: '협상의 거절' },
          { label: '대피 — 와노 시민 우선', traits: ['이타','신중'], text: '대피. 시민 안전 우선. 그러나 카이도 그대로.', type: 'neutral', title: '시민 대피' },
          { label: '루피 + 너 — 정상 침투', traits: ['용기','협력'], text: '정상. 루피 + 너. 카이도와 직접.', type: 'good', title: '정상의 둘' },
        ],
      },
    ],
  },
  'onepiece-arabasta': {
    startId: 18,
    target: 16,
    hubs: [
      {
        entryLabel: '바로크 워크스 — 누구를 먼저',
        entryTraits: ['분석'],
        text: '바로크 멤버.',
        endings: [
          { label: '미스터 0 (크로커다일)', traits: ['정면','용기'], text: '0. 우두머리. 정면.', type: 'bad', title: '0의 무력' },
          { label: '미스터 1 (다즈 본즈)', traits: ['용기'], text: '1. 강철 신체. 조로의 대결.', type: 'good', title: '1과 조로' },
          { label: '미스 더블 핑거', traits: ['용기'], text: '더블. 손가락 능력. 나미.', type: 'good', title: '더블의 손가락' },
          { label: '미스터 2 — 바라 바라', traits: ['협력'], text: '2. 그가 동료. 우정.', type: 'good', title: '2의 우정' },
        ],
      },
      {
        entryLabel: '비비 — 어떤 길',
        entryTraits: ['이타','협력'],
        text: '비비의 미래.',
        endings: [
          { label: '같이 가자 — 밀짚모자', traits: ['이타'], text: '같이. 그러나 그녀의 책임.', type: 'neutral', title: '책임의 무게' },
          { label: '왕국에 남기', traits: ['원칙'], text: '왕국. 평생 헌신.', type: 'good', title: '비비의 헌신' },
          { label: '결혼 — 코자', traits: ['이타','협력'], text: '코자. 그녀의 옛 친구. 결혼.', type: 'good', title: '비비의 결혼' },
          { label: '양국 친선 대사', traits: ['이타','원칙'], text: '대사. 알라바스타 + 세계.', type: 'good', title: '친선 대사' },
        ],
      },
      {
        entryLabel: '왕가 — 코브라',
        entryTraits: ['원칙'],
        text: '코브라 왕.',
        endings: [
          { label: '왕 보호 — 7무해의 위협', traits: ['이타','용기'], text: '보호. 7무해의 위협 격퇴.', type: 'good', title: '왕 보호' },
          { label: '왕의 비밀 — 포네그리프', traits: ['분석'], text: '포네그리프. 알라바스타의 비밀.', type: 'good', title: '포네그리프 발견' },
          { label: '왕의 사임 — 비비에게', traits: ['원칙','이타'], text: '사임. 비비가 새 왕.', type: 'good', title: '비비 왕' },
          { label: '암살 시도 — 막음', traits: ['용기'], text: '암살. 막음. 왕 안전.', type: 'good', title: '암살 막음' },
        ],
      },
      {
        entryLabel: '사막 — 알라바스타 미래',
        entryTraits: ['원칙'],
        text: '알라바스타 회복.',
        endings: [
          { label: '비 회복 — 댄스의 가루', traits: ['분석','이타'], text: '비. 댄스의 가루 회수. 비 회복.', type: 'good', title: '비의 회복' },
          { label: '오아시스 재건', traits: ['이타','협력'], text: '오아시스. 시민 자원 재건.', type: 'good', title: '오아시스 재건' },
          { label: '사막 영원 — 회복 ✗', traits: ['회피'], text: '영원. 비 회복 ✗.', type: 'bad', title: '영원의 사막' },
          { label: '광장 폭발 — 시계탑 파괴', traits: ['회피','자기'], text: '폭발. 광장 부서짐. 시민 피해.', type: 'bad', title: '광장의 폭발' },
        ],
      },
    ],
  },
  'onepiece-thriller': {
    startId: 18,
    target: 19,
    hubs: [
      {
        entryLabel: '능력자 — 누구의 그림자',
        entryTraits: ['분석'],
        text: '동료 그림자가 다른 사람에게 부착.',
        endings: [
          { label: '루피의 그림자 — 좀비 거인 오즈', traits: ['용기'], text: '오즈. 루피의 그림자. 거대 좀비.', type: 'bad', title: '오즈의 거인' },
          { label: '조로의 그림자 — 류마', traits: ['용기'], text: '류마. 죽은 사무라이. 그림자 회수.', type: 'good', title: '류마의 결투' },
          { label: '나미의 그림자 — 사신', traits: ['직관'], text: '사신. 나미의 그림자 + 사신 기술.', type: 'neutral', title: '사신의 그림자' },
          { label: '쵸파의 그림자 — 거대 코끼리', traits: ['이타'], text: '쵸파. 그림자가 코끼리에. 합류 후 회수.', type: 'good', title: '쵸파의 거대' },
        ],
      },
      {
        entryLabel: '브룩 — 영혼의 깊이',
        entryTraits: ['이타','협력'],
        text: '브룩의 50년 외로움.',
        endings: [
          { label: '그의 노래 — 빈크스의 술', traits: ['협력','이타'], text: '노래. 빈크스의 술. 동료들 감동.', type: 'good', title: '빈크스의 술' },
          { label: '동료 합류 약속', traits: ['협력'], text: '약속. 합류 + 9명.', type: 'good', title: '브룩의 약속' },
          { label: '그의 그림자 회수 — 기억 회복', traits: ['이타'], text: '회수. 50년의 기억 회복.', type: 'good', title: '50년의 회복' },
          { label: '브룩의 음악 — 모리아도 감동', traits: ['직관'], text: '음악. 모리아조차 잠시 멈춤.', type: 'good', title: '모리아의 멈춤' },
        ],
      },
      {
        entryLabel: '쿠마 — 7무해의 손',
        entryTraits: ['원칙'],
        text: '쿠마. 그의 손.',
        endings: [
          { label: '쿠마의 손길 — 다른 섬으로', traits: ['신중'], text: '쿠마. 9명을 다른 섬으로. 2년 수련.', type: 'neutral', title: '2년 분리' },
          { label: '루피 보호 — 쿠마와 협상', traits: ['이타','협력'], text: '협상. 쿠마가 루피 살림.', type: 'good', title: '쿠마의 자비' },
          { label: '쿠마와 정면', traits: ['정면'], text: '정면. 그의 능력 압도.', type: 'bad', title: '쿠마의 압도' },
          { label: '쿠마 — 사실은 동맹', traits: ['분석','협력'], text: '동맹. 그의 진짜 정체 — 혁명군.', type: 'good', title: '쿠마의 정체' },
        ],
      },
      {
        entryLabel: '나이트메어 루피',
        entryTraits: ['용기'],
        text: '나이트메어 루피. 100개 그림자.',
        endings: [
          { label: '100개 그림자 흡수 — 거대 루피', traits: ['용기','정면'], text: '거대. 100개 흡수. 모리아 압도.', type: 'good', title: '나이트메어의 거대' },
          { label: '한계 — 새벽까지', traits: ['신중'], text: '한계. 새벽 전에 끝내야.', type: 'good', title: '새벽의 한계' },
          { label: '몸 부서짐 — 너무 많은', traits: ['회피'], text: '부서짐. 100개는 너무 많음.', type: 'bad', title: '한계의 부서짐' },
          { label: '모리아의 패배 — 나이트메어로', traits: ['용기','정면'], text: '모리아. 나이트메어로 격파.', type: 'good', title: '나이트메어의 격파' },
          { label: '햇빛에 그림자 사라짐', traits: ['신중','원칙'], text: '햇빛. 그림자 사라짐. 효과 끝.', type: 'good', title: '햇빛의 끝' },
          { label: '그림자 영원 — 평생 너의 모습 변함', traits: ['독자'], text: '영원. 그림자가 너에게 영원.', type: 'neutral', title: '영원의 그림자' },
        ],
      },
    ],
  },
  'onepiece-water7': {
    startId: 19,
    target: 20,
    hubs: [
      {
        entryLabel: 'CP9 — 누구를 먼저',
        entryTraits: ['용기'],
        text: 'CP9 5명.',
        endings: [
          { label: '루치 — 표범 폼', traits: ['정면','용기'], text: '루치. 표범. 일격.', type: 'good', title: '루치의 표범' },
          { label: '카쿠 — 기린 폼', traits: ['용기'], text: '카쿠. 기린. 조로의 대결.', type: 'good', title: '기린의 조로' },
          { label: '쿠마돌리', traits: ['용기'], text: '쿠마돌리. 산디의 대결.', type: 'good', title: '쿠마돌리와 산디' },
          { label: '제프 — 칼리파', traits: ['용기'], text: '칼리파. 비누 능력.', type: 'good', title: '칼리파의 비누' },
        ],
      },
      {
        entryLabel: '로빈 — 그녀의 비밀',
        entryTraits: ['이타','분석'],
        text: '로빈의 결정.',
        endings: [
          { label: '\"살고 싶어!\" — 9명의 답', traits: ['이타'], text: '살고 싶어. 9명이 답. 명장면.', type: 'good', title: '9명의 답' },
          { label: '오하라 — 그녀의 출신', traits: ['분석'], text: '오하라. 학자의 섬. 그녀의 출신.', type: 'good', title: '오하라의 출신' },
          { label: '폴 네그리프 해독 — 로빈만 가능', traits: ['분석'], text: '해독. 그녀만 가능. 진실.', type: 'good', title: '진실의 해독' },
          { label: '버스터 콜 — 회피', traits: ['신중'], text: '버스터. 함대 5척. 회피.', type: 'good', title: '버스터의 회피' },
        ],
      },
      {
        entryLabel: '프랭키 — 도크 1',
        entryTraits: ['협력','실용'],
        text: '프랭키.',
        endings: [
          { label: '썬섐버호 — 새 배', traits: ['협력','이타'], text: '썬섐버. 그가 만든 새 배.', type: 'good', title: '썬섐버의 출항' },
          { label: '프랭키 합류 — 동료', traits: ['협력'], text: '프랭키. 8번째 동료.', type: 'good', title: '프랭키 동료' },
          { label: 'WBC — 우람 분리분리', traits: ['직관'], text: 'WBC. 콜라로 우람 분리.', type: 'good', title: 'WBC' },
          { label: '도크 1 부서짐 — 슬픔', traits: ['이타','회피'], text: '도크. 부서짐. 그러나 새 시작.', type: 'neutral', title: '도크의 끝' },
        ],
      },
      {
        entryLabel: '에니에스 로비 — 정의의 문',
        entryTraits: ['용기','정면'],
        text: '정의의 문.',
        endings: [
          { label: '깃발 정복 — 시민 보는 앞에서', traits: ['용기','원칙'], text: '깃발. 정의의 깃발 정복.', type: 'good', title: '정의의 깃발' },
          { label: '버스터 콜 회피 — 새벽', traits: ['신중'], text: '버스터. 새벽 전 회피.', type: 'good', title: '새벽의 회피' },
          { label: '루치 격파 — 마지막 한 방', traits: ['용기','정면'], text: '루치. 마지막. 격파.', type: 'good', title: '루치의 격파' },
          { label: '메리호 — 마지막 항해', traits: ['이타'], text: '메리. 마지막 항해. 작별.', type: 'bad', title: '메리의 작별' },
          { label: '울워 — 노인 사후', traits: ['이타','협력'], text: '노인. 그의 도움. 평화 회복.', type: 'good', title: '노인의 도움' },
          { label: '시민의 박수', traits: ['협력','이타'], text: '시민. 워터 세븐 박수.', type: 'good', title: '시민의 박수' },
          { label: '기차 추격전 — 폴츠 대장', traits: ['용기'], text: '기차. 폴츠. 격파.', type: 'good', title: '폴츠 격파' },
          { label: '엘리베이터 — 카쿠와 결투', traits: ['협력'], text: '엘리베이터. 카쿠. 조로 합공.', type: 'good', title: '엘리베이터 합공' },
        ],
      },
    ],
  },
  'onepiece-dressrosa': {
    startId: 18,
    target: 18,
    hubs: [
      {
        entryLabel: '도플라밍고 — 어떤 능력',
        entryTraits: ['분석'],
        text: '실 능력.',
        endings: [
          { label: '실 인형 — 시민 조종', traits: ['분석','정면'], text: '실. 시민 조종. 분석 후 격파.', type: 'good', title: '실의 분석' },
          { label: '버드 케이지 — 도시 봉쇄', traits: ['용기','정면'], text: '버드. 도시 봉쇄. 1시간 안에.', type: 'good', title: '1시간의 격파' },
          { label: '신의 실 — 일격 무기', traits: ['용기'], text: '신의 실. 일격 무기. 회피.', type: 'good', title: '신의 실 회피' },
          { label: '능력 봉인 — 해수 무기', traits: ['분석','이타'], text: '봉인. 해수. 능력 봉인 + 격파.', type: 'good', title: '해수의 봉인' },
        ],
      },
      {
        entryLabel: '리쿠 왕가 — 부활',
        entryTraits: ['원칙','이타'],
        text: '리쿠 왕.',
        endings: [
          { label: '리쿠 왕 부활 — 시민의 박수', traits: ['이타','협력'], text: '부활. 시민 박수.', type: 'good', title: '리쿠 부활' },
          { label: '리벨라 공주 — 새 여왕', traits: ['원칙'], text: '리벨라. 새 여왕. 평화.', type: 'good', title: '리벨라 여왕' },
          { label: '동맹 — 어인섬과', traits: ['협력','이타'], text: '동맹. 어인섬과 평화.', type: 'good', title: '어인 동맹' },
          { label: '리벨라와 결혼', traits: ['이타','협력'], text: '결혼. 너와 리벨라. 새 시대.', type: 'good', title: '리벨라와 결혼' },
        ],
      },
      {
        entryLabel: '사보 — 멜라멜라',
        entryTraits: ['용기','이타'],
        text: '사보. 형의 의지.',
        endings: [
          { label: '사보 합류 — 혁명군', traits: ['협력','이타'], text: '사보. 혁명군 동맹.', type: 'good', title: '혁명군 동맹' },
          { label: '에이스의 의지 — 사보가 계승', traits: ['이타','원칙'], text: '의지. 사보가 계승. 의미.', type: 'good', title: '에이스의 계승' },
          { label: '사보 vs 콜리세움', traits: ['용기','정면'], text: '콜리세움. 사보 우승.', type: 'good', title: '사보 우승' },
          { label: '사보 격파 — 너가 승리', traits: ['용기','자기'], text: '너. 사보 격파. 멜라멜라 너.', type: 'neutral', title: '너의 멜라멜라' },
          { label: '사보 + 너 — 동맹', traits: ['협력','이타'], text: '동맹. 사보 + 너 평생.', type: 'good', title: '평생 동맹' },
        ],
      },
      {
        entryLabel: '드워프 + 시민 — 봉기',
        entryTraits: ['협력','이타'],
        text: '봉기.',
        endings: [
          { label: '드워프 — 토토랜드 소국', traits: ['이타'], text: '드워프. 작은 사람들. 도움.', type: 'good', title: '드워프의 도움' },
          { label: '시민 1만명 봉기', traits: ['협력','이타'], text: '봉기. 1만 명 시민.', type: 'good', title: '1만명 봉기' },
          { label: '레오 — 작은 영웅', traits: ['이타'], text: '레오. 작은 영웅 활약.', type: 'good', title: '레오의 영웅' },
          { label: '봉기 실패 — 도플라밍고 압도', traits: ['회피'], text: '실패. 압도.', type: 'bad', title: '봉기 실패' },
          { label: '비올라 — 그녀의 정보', traits: ['협력','분석'], text: '비올라. 그녀의 정보. 결정.', type: 'good', title: '비올라의 정보' },
        ],
      },
    ],
  },
  'onepiece-egghead': {
    startId: 18,
    target: 18,
    hubs: [
      {
        entryLabel: '베가펑크 위성 — 누구',
        entryTraits: ['분석'],
        text: '6명의 위성.',
        endings: [
          { label: '식 (지능) — 그의 도움', traits: ['분석','협력'], text: '식. 모든 정보. 도움.', type: 'good', title: '식의 도움' },
          { label: '리리스 (탐욕) — 위험', traits: ['독자'], text: '리리스. 탐욕의 위성. 위험.', type: 'neutral', title: '리리스 위험' },
          { label: '아툴라스 (폭력)', traits: ['용기','정면'], text: '아툴라스. 폭력. 정면.', type: 'good', title: '아툴라스 격파' },
          { label: '에지 (선) — 평화의 위성', traits: ['이타'], text: '에지. 평화. 동맹.', type: 'good', title: '에지의 평화' },
          { label: '핏 (악) — 어두운 위성', traits: ['정면'], text: '핏. 악의 위성. 정면.', type: 'bad', title: '핏의 어두움' },
        ],
      },
      {
        entryLabel: '5인의 강림 — 누구가 직접',
        entryTraits: ['용기'],
        text: '5인 중 누가?',
        endings: [
          { label: '워큐리 — 평화의 신', traits: ['용기'], text: '워큐리. 평화의 신. 그녀의 능력.', type: 'bad', title: '워큐리의 강림' },
          { label: '톱맨 — 농담의 신', traits: ['직관'], text: '톱맨. 농담. 회피.', type: 'good', title: '톱맨의 회피' },
          { label: '나스 — 별의 신', traits: ['신중'], text: '나스. 별. 무력.', type: 'bad', title: '별의 무력' },
          { label: '셰퍼드 — 양치기 신', traits: ['이타'], text: '셰퍼드. 양치기. 너를 양처럼.', type: 'neutral', title: '양의 길' },
        ],
      },
      {
        entryLabel: '비밀 5번 — 어떤 진실',
        entryTraits: ['분석','원칙'],
        text: '5번의 진실?',
        endings: [
          { label: '세계 정부의 거짓 — 100년 공백', traits: ['원칙','이타'], text: '거짓. 100년 공백 진실.', type: 'good', title: '100년의 거짓' },
          { label: '천룡인 — 그들의 정체', traits: ['분석'], text: '천룡인. 정체. 충격.', type: 'good', title: '천룡인 정체' },
          { label: '바닥의 자장 — 세계의 끝', traits: ['분석'], text: '자장. 세계의 끝. 미스터리.', type: 'neutral', title: '세계의 끝' },
          { label: '월의 사람들 — 외계?', traits: ['분석','용기'], text: '월. 외계 사람들. 충격.', type: 'good', title: '월의 사람들' },
        ],
      },
      {
        entryLabel: '탈출 — 어떻게',
        entryTraits: ['용기','신중'],
        text: '탈출.',
        endings: [
          { label: '썬섐버 — 9명 배', traits: ['협력','이타'], text: '썬섐버. 9명 배. 안전.', type: 'good', title: '9명의 탈출' },
          { label: '베가펑크 비행기', traits: ['분석'], text: '비행기. 베가펑크의 발명품.', type: 'good', title: '비행기 탈출' },
          { label: '스텔스 — 위성의 도움', traits: ['협력','분석'], text: '스텔스. 위성. 안전.', type: 'good', title: '스텔스 탈출' },
          { label: '직접 정면 — 5인 통과', traits: ['용기','정면'], text: '정면. 무력.', type: 'bad', title: '정면의 끝' },
          { label: '베가펑크 본체 함께 — 마지막', traits: ['이타','원칙'], text: '본체. 그의 마지막 부탁. 함께.', type: 'good', title: '본체의 부탁' },
        ],
      },
    ],
  },
};

// 적용
for (const [id, def] of Object.entries(SCENARIOS)) {
  const scenarioPath = path.join('assets', 'scenarios', id + '.json');
  const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
  const node1 = data.find((n) => n.nodeId === 1);

  let nodeId = def.startId;
  for (const hub of def.hubs) {
    const hubId = nodeId++;
    const choices = [];
    const endingNodes = [];
    for (const e of hub.endings) {
      const eId = nodeId++;
      choices.push({
        label: e.label,
        nextNodeId: eId,
        requiredItem: null,
        grantItem: null,
        traits: e.traits || [],
      });
      endingNodes.push({
        nodeId: eId,
        text: e.text,
        choices: [],
        endingType: e.type,
        endingTitle: e.title,
      });
    }
    data.push({ nodeId: hubId, text: hub.text, choices });
    data.push(...endingNodes);
    node1.choices.push({
      label: hub.entryLabel,
      nextNodeId: hubId,
      requiredItem: null,
      grantItem: null,
      traits: hub.entryTraits || [],
    });
  }

  // 검증
  const byId = new Map(data.map((n) => [n.nodeId, n]));
  const v = new Set();
  const q = [1];
  while (q.length) {
    const nid = q.shift();
    if (v.has(nid)) continue;
    v.add(nid);
    const n = byId.get(nid);
    if (!n) continue;
    for (const c of n.choices || []) if (!v.has(c.nextNodeId)) q.push(c.nextNodeId);
  }
  const u = data.filter((n) => !v.has(n.nodeId));
  const e = data.filter((n) => (n.choices || []).length === 0).length;

  fs.writeFileSync(scenarioPath, JSON.stringify(data, null, 2));
  console.log(`${id.padEnd(22)} nodes=${data.length} endings=${e}${u.length ? ' UNREACHABLE: ' + u.map((n) => n.nodeId).join(',') : ' OK'}`);
}
