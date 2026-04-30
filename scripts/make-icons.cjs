// 외부 의존성 없이 PNG 아이콘 생성. zlib + 수동 CRC32 사용.
// 디자인: 둥근 사각형 오렌지 배경 + 흰색 "F" 글자 (블록 폰트)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const crcTable = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = (crcTable[(c ^ b) & 0xff] ^ (c >>> 8)) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePNG(size, draw) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const rowBytes = 1 + size * 3;
  const data = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    data.writeUInt8(0, y * rowBytes); // filter type 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = draw(x, y);
      const off = y * rowBytes + 1 + x * 3;
      data.writeUInt8(r, off);
      data.writeUInt8(g, off + 1);
      data.writeUInt8(b, off + 2);
    }
  }
  const compressed = zlib.deflateSync(data);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// 둥근 사각형 + 흰색 "F" 글자
function drawIcon(size, x, y) {
  const bg = [0x16, 0x17, 0x1f]; // #16171f (진한 배경)
  const accent = [0xff, 0xaa, 0x00]; // #ffaa00 (오렌지)
  const white = [0xff, 0xff, 0xff];

  // 둥근 사각형 마스크 (반경 = size * 0.18)
  const r = size * 0.18;
  const inX = Math.max(0, x - r) < r ? Math.max(0, r - x) : Math.max(0, (size - r) - x < 0 ? x - (size - r) : 0);
  const inY = Math.max(0, y - r) < r ? Math.max(0, r - y) : Math.max(0, (size - r) - y < 0 ? y - (size - r) : 0);
  if (inX > 0 && inY > 0 && inX * inX + inY * inY > r * r) return bg;

  // 글자 "F" 영역 — 중앙 60% 영역, 블록 폰트
  // F 그리드: 4w x 5h, 가로 4 세로 5
  // F 픽셀 패턴
  const F = [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ];

  const fontW = size * 0.36; // F 글자 너비 (4 cells)
  const fontH = size * 0.45; // F 글자 높이 (5 cells)
  const fontX = (size - fontW) / 2;
  const fontY = (size - fontH) / 2;
  const cellW = fontW / 4;
  const cellH = fontH / 5;

  if (x >= fontX && x < fontX + fontW && y >= fontY && y < fontY + fontH) {
    const col = Math.floor((x - fontX) / cellW);
    const row = Math.floor((y - fontY) / cellH);
    if (F[row] && F[row][col] === 1) return white;
  }

  return accent;
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png = makePNG(size, (x, y) => drawIcon(size, x, y));
  const out = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`Wrote ${out} (${png.length} bytes)`);
}

// 마스크 가능 (maskable) 아이콘 — 안전 영역에 더 작게 그림
function drawMaskable(size, x, y) {
  const bg = [0xff, 0xaa, 0x00]; // 전체 오렌지
  const white = [0xff, 0xff, 0xff];

  const F = [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ];
  // safe zone 80% — 글자 더 작게
  const fontW = size * 0.28;
  const fontH = size * 0.36;
  const fontX = (size - fontW) / 2;
  const fontY = (size - fontH) / 2;
  const cellW = fontW / 4;
  const cellH = fontH / 5;

  if (x >= fontX && x < fontX + fontW && y >= fontY && y < fontY + fontH) {
    const col = Math.floor((x - fontX) / cellW);
    const row = Math.floor((y - fontY) / cellH);
    if (F[row] && F[row][col] === 1) return white;
  }
  return bg;
}

for (const size of [192, 512]) {
  const png = makePNG(size, (x, y) => drawMaskable(size, x, y));
  const out = path.join(outDir, `icon-maskable-${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`Wrote ${out} (${png.length} bytes)`);
}
