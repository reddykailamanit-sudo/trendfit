import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  // Create RGBA image with dark slate background, rounded icon, vibrant gradient and trend curve
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Distance from center
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep dark slate / indigo gradient
      let r = Math.round(15 + nx * 20);
      let g = Math.round(23 + ny * 25);
      let b = Math.round(42 + (nx + ny) * 35);
      let a = 255;

      // Sleek rounded rect or circular app badge container
      const cornerRadius = 0.22;
      const qx = Math.max(0, Math.abs(dx) - (0.42 - cornerRadius));
      const qy = Math.max(0, Math.abs(dy) - (0.42 - cornerRadius));
      const inBadge = Math.sqrt(qx * qx + qy * qy) <= cornerRadius;

      if (inBadge) {
        // Inner badge: rich indigo-violet gradient
        r = Math.round(99 + nx * 50);
        g = Math.round(102 - ny * 30);
        b = Math.round(241 + ny * 14);

        // Trend curve: y = A * (x - 0.2)^2 + ...
        // Smooth exponential / polynomial curve
        const curveY = 0.72 - 0.45 * Math.pow((nx - 0.2) / 0.6, 1.8);
        const curveDist = Math.abs(ny - curveY);

        if (nx >= 0.22 && nx <= 0.78) {
          // Glow and line
          if (curveDist < 0.022) {
            // Bright cyan / emerald curve
            r = 56;
            g = 220;
            b = 255;
          } else if (curveDist < 0.06) {
            const glow = 1 - (curveDist - 0.022) / 0.038;
            r = Math.round(r * (1 - glow) + 56 * glow);
            g = Math.round(g * (1 - glow) + 200 * glow);
            b = Math.round(b * (1 - glow) + 255 * glow);
          }
        }

        // Draw 3 accent scatter points
        const points = [
          [0.32, 0.64],
          [0.50, 0.46],
          [0.68, 0.31]
        ];
        for (const [px, py] of points) {
          const pd = Math.sqrt((nx - px) * (nx - px) + (ny - py) * (ny - py));
          if (pd < 0.035) {
            r = 255;
            g = 255;
            b = 255;
          } else if (pd < 0.055) {
            const ptGlow = 1 - (pd - 0.035) / 0.02;
            r = Math.round(r * (1 - ptGlow) + 255 * ptGlow);
            g = Math.round(g * (1 - ptGlow) + 255 * ptGlow);
            b = Math.round(b * (1 - ptGlow) + 255 * ptGlow);
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', generatePng(192));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180));
console.log('Successfully generated PWA icons in public/ directory!');
