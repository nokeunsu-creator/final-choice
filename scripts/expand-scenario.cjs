// 시나리오 JSON에 hub + endings를 자동 추가하는 헬퍼.
// 사용법: node scripts/expand-scenario.cjs <scenarioId> <jsonAdditionsFile>
// jsonAdditionsFile은 { node1Choices: [...], hubs: [{nodeId, text, choices}], endings: [{nodeId, text, endingType, endingTitle}] }
const fs = require('fs');
const path = require('path');

const [scenarioId, additionsFile] = process.argv.slice(2);
if (!scenarioId || !additionsFile) {
  console.error('Usage: node expand-scenario.cjs <id> <additions.json>');
  process.exit(1);
}

const scenarioPath = path.join('assets', 'scenarios', scenarioId + '.json');
const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
const add = JSON.parse(fs.readFileSync(additionsFile, 'utf8'));

// node 1에 새 선택지 추가
const node1 = data.find((n) => n.nodeId === 1);
if (!node1) throw new Error('node 1 not found');
node1.choices.push(...add.node1Choices);

// hubs와 endings 추가
for (const hub of add.hubs || []) {
  data.push({
    nodeId: hub.nodeId,
    text: hub.text,
    choices: hub.choices.map((c) => ({
      label: c.label,
      nextNodeId: c.nextNodeId,
      requiredItem: c.requiredItem ?? null,
      grantItem: c.grantItem ?? null,
      traits: c.traits ?? [],
    })),
  });
}
for (const e of add.endings || []) {
  data.push({
    nodeId: e.nodeId,
    text: e.text,
    choices: [],
    endingType: e.endingType,
    endingTitle: e.endingTitle,
  });
}

// reachability 검증
const byId = new Map(data.map((n) => [n.nodeId, n]));
const v = new Set();
const q = [1];
while (q.length) {
  const id = q.shift();
  if (v.has(id)) continue;
  v.add(id);
  const n = byId.get(id);
  if (!n) continue;
  for (const c of n.choices || []) if (!v.has(c.nextNodeId)) q.push(c.nextNodeId);
}
const unreachable = data.filter((n) => !v.has(n.nodeId));
if (unreachable.length) {
  console.error('UNREACHABLE:', unreachable.map((n) => n.nodeId).join(','));
  process.exit(2);
}

const endings = data.filter((n) => (n.choices || []).length === 0).length;
fs.writeFileSync(scenarioPath, JSON.stringify(data, null, 2));
console.log(`${scenarioId}: nodes=${data.length} endings=${endings}`);
