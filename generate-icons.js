/**
 * Simple icon generator using pure Node.js (no native deps).
 * Creates minimal solid-color PNG icons for the extension.
 * Run: node generate-icons.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal PNG writer (pure JS, no canvas needed)
function createSolidPNG(size, r, g, b) {
  const pixels = size * size;
  const rawData = new Uint8Array(pixels * 4);
  for (let i = 0; i < pixels; i++) {
    rawData[i * 4] = r;
    rawData[i * 4 + 1] = g;
    rawData[i * 4 + 2] = b;
    rawData[i * 4 + 3] = 255;
  }

  // Apply PNG filter (none = 0) per row
  const filtered = new Uint8Array(pixels * 4 + size);
  for (let row = 0; row < size; row++) {
    filtered[row * (size * 4 + 1)] = 0; // filter type: none
    filtered.set(rawData.slice(row * size * 4, (row + 1) * size * 4), row * (size * 4 + 1) + 1);
  }

  const deflated = deflate(filtered);

  const png = buildPNG(size, deflated);
  return Buffer.from(png);
}

function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const byte of data) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32BE(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

function deflate(data) {
  // Minimal uncompressed deflate
  const blocks = [];
  const chunkSize = 65535;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const last = i + chunkSize >= data.length ? 1 : 0;
    blocks.push(last, chunk.length & 0xff, (chunk.length >> 8) & 0xff,
      (~chunk.length) & 0xff, ((~chunk.length) >> 8) & 0xff, ...chunk);
  }
  // zlib header + deflate blocks + adler32
  const adler = adler32(data);
  return [0x78, 0x01, ...blocks, ...uint32BE(adler)];
}

function adler32(data) {
  let s1 = 1, s2 = 0;
  for (const b of data) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521; }
  return (s2 << 16) | s1;
}

function buildPNG(size, idatData) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  function chunk(type, data) {
    const typeBytes = [...type].map(c => c.charCodeAt(0));
    const crcData = [...typeBytes, ...data];
    return [...uint32BE(data.length), ...typeBytes, ...data, ...uint32BE(crc32(crcData))];
  }

  const ihdr = [
    ...uint32BE(size), ...uint32BE(size),
    8, 2, 0, 0, 0 // bit depth, color type (RGB), compression, filter, interlace
  ];

  return new Uint8Array([
    ...signature,
    ...chunk('IHDR', ihdr),
    ...chunk('IDAT', idatData),
    ...chunk('IEND', []),
  ]);
}

// Indigo color #6366f1 = rgb(99, 102, 241)
const R = 99, G = 102, B = 241;

const iconsDir = join(__dirname, 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const buf = createSolidPNG(size, R, G, B);
  const path = join(iconsDir, `icon${size}.png`);
  writeFileSync(path, buf);
  console.log(`Created ${path} (${buf.length} bytes)`);
}

console.log('Icons generated successfully!');
