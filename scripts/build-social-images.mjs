// Generates the static share/icon files in public/ (run after changing the
// source photo or the mark; outputs are committed):
//   og-image.jpg          1200x630 Open Graph / Twitter card image
//   apple-touch-icon.png  180x180 iOS home-screen icon
//   favicon.ico           16x16 + 32x32 for browsers/crawlers that ask for /favicon.ico
// The icons reuse the "AZ" mark from public/favicon.svg until the real logo
// (with a simplified small-size mark) arrives from the client.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const OG_SOURCE = "src/images/homepage/teens-adults-class.jpg";

await sharp(OG_SOURCE)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og-image.jpg");

// Full-bleed square (iOS rounds the corners itself).
const mark = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#14130F"/>
  <text x="16" y="22" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="15" fill="#E2C173">AZ</text>
</svg>`);

await sharp(mark(180)).png().toFile("public/apple-touch-icon.png");

// ICO container holding PNG images (supported by every current browser).
const pngs = await Promise.all([16, 32].map((s) => sharp(mark(s)).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const size = [16, 32][i];
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0);
  e.writeUInt8(size, 1);
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync("public/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));

console.log("Wrote public/og-image.jpg, public/apple-touch-icon.png, public/favicon.ico");
