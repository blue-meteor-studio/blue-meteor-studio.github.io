// Reads the pixels of a PNG, to tell whether two pictures are the same picture whatever their
// bytes are (two programs can write the same picture as different files).
// It reads what a browser's screenshot is: 8 bits to a channel, RGB or RGBA, not interlaced.

import { inflateSync } from "node:zlib";

/** The picture's size and its pixels as RGBA, four bytes each, row by row. */
export function readPng(file) {
  if (file.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("not a PNG file");
  let width = 0;
  let height = 0;
  let channels = 0;
  const packed = [];
  for (let at = 8; at < file.length; ) {
    const length = file.readUInt32BE(at);
    const type = file.toString("latin1", at + 4, at + 8);
    const body = file.subarray(at + 8, at + 8 + length);
    at += 12 + length;
    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      if (body[8] !== 8 || (body[9] !== 2 && body[9] !== 6) || body[12] !== 0) throw new Error("a kind of PNG this reader does not read");
      channels = body[9] === 6 ? 4 : 3;
    } else if (type === "IDAT") {
      packed.push(body);
    }
  }
  const raw = inflateSync(Buffer.concat(packed));
  const stride = width * channels;
  const pixels = new Uint8Array(width * height * 4);
  let above = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    const line = Uint8Array.from(raw.subarray(start + 1, start + 1 + stride));
    // Each row is stored as its difference from the pixel to the left, the row above, or both.
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? line[x - channels] : 0;
      const up = above[x];
      const upLeft = x >= channels ? above[x - channels] : 0;
      let from = 0;
      if (filter === 1) from = left;
      else if (filter === 2) from = up;
      else if (filter === 3) from = (left + up) >> 1;
      else if (filter === 4) {
        const guess = left + up - upLeft;
        const byLeft = Math.abs(guess - left);
        const byUp = Math.abs(guess - up);
        const byUpLeft = Math.abs(guess - upLeft);
        from = byLeft <= byUp && byLeft <= byUpLeft ? left : byUp <= byUpLeft ? up : upLeft;
      }
      line[x] = (line[x] + from) & 255;
    }
    for (let x = 0; x < width; x++) {
      const to = (y * width + x) * 4;
      const at = x * channels;
      pixels[to] = line[at];
      pixels[to + 1] = line[at + 1];
      pixels[to + 2] = line[at + 2];
      pixels[to + 3] = channels === 4 ? line[at + 3] : 255;
    }
    above = line;
  }
  return { width, height, pixels };
}

/**
 * How two PNG files differ as pictures: { same, differing, worst }, where `differing` is the number
 * of pixels that are not equal and `worst` the largest difference in any channel (of 255).
 * Pictures of different sizes, or a file that cannot be read, count as wholly different.
 */
export function comparePng(fileA, fileB) {
  let a;
  let b;
  try {
    a = readPng(fileA);
    b = readPng(fileB);
  } catch {
    return { same: false, differing: Infinity, worst: 255 };
  }
  if (a.width !== b.width || a.height !== b.height) return { same: false, differing: Infinity, worst: 255 };
  let differing = 0;
  let worst = 0;
  for (let i = 0; i < a.pixels.length; i += 4) {
    const d = Math.max(
      Math.abs(a.pixels[i] - b.pixels[i]),
      Math.abs(a.pixels[i + 1] - b.pixels[i + 1]),
      Math.abs(a.pixels[i + 2] - b.pixels[i + 2]),
      Math.abs(a.pixels[i + 3] - b.pixels[i + 3]),
    );
    if (d) differing++;
    if (d > worst) worst = d;
  }
  return { same: differing === 0, differing, worst };
}
