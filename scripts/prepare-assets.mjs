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

async function onStage(png) {
  const cut = sharp(png);
  const meta = await cut.metadata();
  const pad = 36;
  const width = meta.width + pad * 2;
  const height = meta.height + pad * 2;
  const shadow = await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: await sharp(png).resize(Math.round(meta.width * 0.96), Math.round(meta.height * 0.96)).modulate({ brightness: 0 }).ensureAlpha(0.22).blur(18).toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 3, background: stage },
  })
    .composite([
      { input: shadow, gravity: "centre" },
      { input: png, gravity: "centre" },
    ])
    .webp({ quality: 80 })
    .toBuffer();
}

const jobs = [
  ["wegovy-flex-pens.webp", async () => keyedPng(await fetchBuffer(sources.pens), [223, 239, 238], 18, 720)],
  ["wegovy-pill-25mg.webp", async () => sharp(await fetchBuffer(sources.oval)).resize(900, 900, { fit: "inside" }).png().toBuffer()],
  ["wegovy-pill-bottle.webp", async () => sharp(await fetchBuffer(sources.bottle)).resize(720, 720, { fit: "inside" }).png().toBuffer()],
  ["foundayo-tablet-0.8mg.webp", async () => keyedPng(await fetchBuffer(sources.foundayo), [243, 243, 243], 16, 760)],
];

await mkdir(outDir, { recursive: true });
for (const [name, make] of jobs) {
  const png = await make();
  const webp = await onStage(png);
  await writeFile(path.join(outDir, name), webp);
  console.log(name, webp.length);
}
