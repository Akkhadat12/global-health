import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "assets");
const stage = { r: 228, g: 235, b: 241 };

const sources = {
  pens: "https://www.novonordisk.com/content/dam/nncorp/global/en/media/images/media-kit/wegovy-pens-green.png",
  oval: "https://www.novonordisk.com/content/dam/nncorp/global/en/media/images/media-kit/download/oval-pill.png",
  bottle: "https://www.novonordisk.com/content/dam/nncorp/global/en/media/images/media-kit/wegovy-pill-bottle.png",
  foundayo:
    "https://delivery-p137454-e1438138.adobeaemcloud.com/adobe/assets/urn:aaid:aem:863a2b05-44bd-405c-b43c-ff781729c0b0/original/as/Lilly_OFG_Tablet_G1_TopView_JPG.jpg",
};

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function punch(data, tolerance, sample) {
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - sample[0];
    const dg = data[i + 1] - sample[1];
    const db = data[i + 2] - sample[2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= tolerance) data[i + 3] = 0;
    else if (dist < tolerance + 14) {
      data[i + 3] = Math.round((255 * (dist - tolerance)) / 14);
    }
  }
  return data;
}

function keyConnectedBackground(data, width, height, sample) {
  const count = width * height;
  const dist = new Float32Array(count);
  for (let p = 0, i = 0; p < count; p++, i += 4) {
    dist[p] = Math.hypot(data[i] - sample[0], data[i + 1] - sample[1], data[i + 2] - sample[2]);
  }
  const background = new Uint8Array(count);
  const stack = [];
  const consider = (p) => {
    if (background[p] || dist[p] > 18) return;
    background[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < width; x++) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    consider(y * width);
    consider(y * width + width - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    const y = (p / width) | 0;
    if (x > 0) consider(p - 1);
    if (x < width - 1) consider(p + 1);
    if (y > 0) consider(p - width);
    if (y < height - 1) consider(p + width);
  }
  for (let p = 0, i = 0; p < count; p++, i += 4) data[i + 3] = background[p] ? 0 : 255;
  return data;
}

async function keyedPng(input, sample, tolerance, maxSide) {
  const base = sharp(input).resize({
    width: maxSide,
    height: maxSide,
    fit: "inside",
    withoutEnlargement: true,
  });
  const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  punch(data, tolerance, sample);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function onStage(png, { shadow = true, quality = 82 } = {}) {
  const cut = sharp(png);
  const meta = await cut.metadata();
  const pad = 36;
  const width = meta.width + pad * 2;
  const height = meta.height + pad * 2;
  const layers = [];
  if (shadow) {
    layers.push({
      input: await sharp({
        create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([
          {
            input: await sharp(png).resize(Math.round(meta.width * 0.96), Math.round(meta.height * 0.96)).modulate({ brightness: 0 }).ensureAlpha(0.22).blur(18).toBuffer(),
            gravity: "centre",
          },
        ])
        .png()
        .toBuffer(),
      gravity: "centre",
    });
  }
  layers.push({ input: png, gravity: "centre" });

  const flat = sharp({
    create: { width, height, channels: 3, background: stage },
  }).composite(layers);
  if (quality >= 100) return flat.webp({ lossless: true }).toBuffer();
  return flat.webp({ quality }).toBuffer();
}

async function keyedPens(input) {
  const sample = [223, 239, 238];
  const base = sharp(input).resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true });
  const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  keyConnectedBackground(data, info.width, info.height, sample);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const jobs = [
  ["wegovy-flex-pens.webp", async () => onStage(await keyedPens(await fetchBuffer(sources.pens)), { shadow: false, quality: 100 })],
  ["wegovy-pill-25mg.webp", async () => onStage(await sharp(await fetchBuffer(sources.oval)).resize(900, 900, { fit: "inside" }).png().toBuffer())],
  ["wegovy-pill-bottle.webp", async () => onStage(await sharp(await fetchBuffer(sources.bottle)).resize(720, 720, { fit: "inside" }).png().toBuffer())],
  ["foundayo-tablet-0.8mg.webp", async () => onStage(await keyedPng(await fetchBuffer(sources.foundayo), [243, 243, 243], 16, 760))],
];

await mkdir(outDir, { recursive: true });
for (const [name, make] of jobs) {
  const webp = await make();
  await writeFile(path.join(outDir, name), webp);
  console.log(name, webp.length);
}
