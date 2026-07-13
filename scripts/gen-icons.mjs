import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svgPath = "scripts/icon.svg";

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  await sharp(svgPath).resize(t.size, t.size).png().toFile(t.file);
  console.log("wrote", t.file);
}

// Maskable icon: same art but with ~20% safe-zone padding so platform masks don't clip the glyph.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#121214" },
})
  .composite([{ input: await sharp(svgPath).resize(320, 320).toBuffer(), top: 96, left: 96 }])
  .png()
  .toFile("public/icons/icon-512-maskable.png");
console.log("wrote public/icons/icon-512-maskable.png");
