// Generates teal app icons with a white "P" (parking) glyph. Pure Node, no deps.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function makePng(size, filename) {
  const W = size;
  const H = size;
  const bg = [15, 118, 110]; // teal
  const fg = [255, 255, 255]; // white
  const buf = Buffer.alloc(W * H * 4);

  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = 255;
  };

  // Background
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) set(x, y, bg);

  // Draw a "P" using rectangles, scaled to size.
  const u = size / 16; // unit grid
  const rect = (gx, gy, gw, gh) => {
    for (let y = Math.round(gy * u); y < Math.round((gy + gh) * u); y++)
      for (let x = Math.round(gx * u); x < Math.round((gx + gw) * u); x++) set(x, y, fg);
  };
  // stem
  rect(5, 4, 2, 8);
  // top bar
  rect(5, 4, 5, 2);
  // right bar of bowl
  rect(8, 4, 2, 5);
  // middle bar
  rect(5, 7, 5, 2);

  // PNG encoding (RGBA, 8-bit)
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0; // filter type 0
    buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const idat = deflateSync(raw);

  const crcTable = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (b) => {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(filename, png);
  console.log('wrote', filename, png.length, 'bytes');
}

makePng(192, 'public/icon-192.png');
makePng(512, 'public/icon-512.png');
