// Makes every file of the brand from its sources, so that none of them is the only copy of
// anything and none has to be drawn again by hand.
//
//   npm run brand          writes the files
//   npm run brand:check    writes nothing: says whether each file is what the sources give
//
// The sources are few: logo.mjs (the drawing and its colours), the site's Wordmark.astro with its
// font file (how the name is set), share-image.mjs (the share image) and the sizes written below.
// brand/README.md says which to change for what.

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openBrowser } from "./browser.mjs";
import { colors, logo } from "./logo.mjs";
import { comparePng } from "./png.mjs";
import { shareImage, shareImageSize } from "./share-image.mjs";
import { measureWordmark, trailEnd, wordmarkMarkup, wordmarkStyles, wordmarkSvg } from "./wordmark.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const checking = process.argv.includes("--check");

// The colourings each drawing is kept in. `letters` is also the ring's colour: the ring is a letter.
const colourings = {
  "on-dark": { letters: colors.onDark, light: colors.light, small: colors.smallOnDark },
  "on-light": { letters: colors.onLight, light: colors.light, small: colors.smallOnLight },
  "mono-white": { letters: colors.white, light: colors.white, small: colors.white },
  "mono-navy": { letters: colors.onLight, light: colors.onLight, small: colors.onLight },
};

// ---- The logo's master files: brand/logo-mark-*.svg -------------------------------------------

const { size, margin, scale } = logo.master;
const shapes = logo.place({ x: margin, y: margin, scale });
const mark = ({ letters, light }) => [`<path fill-rule="evenodd" d="${shapes.ring}" fill="${letters}"/>`, `<path d="${shapes.light}" fill="${light}"/>`];
const markFile = (colouring) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <title>Blue Meteor Studio</title>
  ${mark(colouring).join("\n  ")}
</svg>
`;

// ---- The browser-tab icon: public/favicon.svg and favicon-32.png ------------------------------

// A dark tile with rounded corners, so that the logo holds on light and dark tab bars alike.
// The tile is 160 units wide and the drawing sits 20 in from its top left: at 32 pixels that is
// 5 units to a pixel, so the ring is exactly 20 pixels across and its edges fall on the pixel grid.
const tab = { tile: 160, corner: 35, inset: 20 };
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tab.tile} ${tab.tile}">
  <rect width="${tab.tile}" height="${tab.tile}" rx="${tab.corner}" fill="${colors.ground}"/>
  <g transform="translate(${tab.inset} ${tab.inset})">
    <circle cx="${logo.ring.cx}" cy="${logo.ring.cy}" r="${logo.ring.r}" fill="none" stroke="${colors.onDark}" stroke-width="${logo.ring.width}"/>
    <path d="${logo.light}" fill="${colors.light}"/>
  </g>
</svg>
`;

// ---- The pictures: public/*.png ---------------------------------------------------------------

// A page that is nothing but one drawing, filling the window.
const page = (background, drawing) => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:${background}}svg{display:block;width:100vw;height:100vh}</style>
${drawing}
`;
// The home-screen icon and the square logo for search engines: the master drawing on the ground
// colour from edge to edge (the device rounds the corners itself), a little smaller about its centre.
const square = (shrink) =>
  page(
    colors.ground,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${colors.ground}"/><g transform="translate(${size / 2} ${size / 2}) scale(${shrink}) translate(${-size / 2} ${-size / 2})">${mark(colourings["on-dark"]).join("")}</g></svg>`,
  );
/** Each picture: the page to photograph, and the window to photograph it in. */
const pictures = ({ styles, wordmark, trail }) => [
  { path: "public/favicon-32.png", html: page("transparent", favicon), window: { width: 32, height: 32 }, transparent: true },
  { path: "public/apple-touch-icon.png", html: square(0.8), window: { width: 180, height: 180 } },
  { path: "public/icon-512.png", html: square(0.84), window: { width: 512, height: 512 } },
  { path: "public/og.png", html: shareImage({ styles, wordmark, trailEnd: trail }), window: { ...shareImageSize, settle: 800 } },
];

// ---- Making them, and saying what changed -----------------------------------------------------

const report = [];
let unsettled = false;

/** Compares one file with what the sources give, and writes it unless only checking. */
async function settle(path, made) {
  const file = join(root, path);
  const present = await readFile(file).catch(() => null);
  let state = "same";
  if (!present) state = "missing";
  else if (typeof made === "string") state = present.toString("utf8") === made ? "same" : "differs";
  else if (!present.equals(made)) {
    // A picture is the same picture if its pixels are, however its bytes are packed.
    const { same, differing, worst } = comparePng(present, made);
    state = same ? "same" : `differs (${differing} pixels, by up to ${worst} of 255)`;
  }
  if (state !== "same") {
    unsettled = true;
    if (!checking) {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, made);
    }
  }
  const told =
    state === "same"
      ? "same"
      : checking
        ? state.replace(/^\w+/, (word) => word.toUpperCase())
        : state === "missing"
          ? "written (new)"
          : `written (${state.replace("differs", "was different")})`;
  report.push(`  ${path.padEnd(34)} ${told}`);
}

async function make() {
  // What needs no browser: the drawings that are only shapes.
  for (const [name, colouring] of Object.entries(colourings)) await settle(`brand/logo-mark-${name}.svg`, markFile(colouring));
  await settle("public/favicon.svg", favicon);

  const browser = await openBrowser();
  const pages = await mkdtemp(join(tmpdir(), "brand-pages-"));
  try {
    // Pages are written to a folder of their own and opened from there.
    const stage = {
      async show(name, html, window) {
        const file = join(pages, name);
        await writeFile(file, html);
        await browser.show(pathToFileURL(file).href, window);
      },
      read: browser.read,
    };

    // The name, measured as the site sets it; then the name as a drawing of its own.
    const measured = await measureWordmark(stage);
    for (const [name, colouring] of Object.entries(colourings)) await settle(`brand/wordmark-${name}.svg`, await wordmarkSvg(measured, colouring));

    const trail = trailEnd(measured);
    const all = pictures({ styles: await wordmarkStyles(), wordmark: wordmarkMarkup(), trail });
    for (const [index, { path, html, window, transparent }] of all.entries()) {
      await stage.show(`picture-${index}.html`, html, window);
      await settle(path, await browser.picture({ transparent }));
    }
    return { browser: browser.name, trail };
  } finally {
    await browser.close();
    await rm(pages, { recursive: true, force: true });
  }
}

let made;
try {
  made = await make();
} catch (error) {
  if (report.length) console.log(report.join("\n"));
  console.error(`\nStopped before the end: ${error.message}`);
  process.exit(1);
}

console.log(`${checking ? "Checked against" : "Made from"} the sources (pictures by ${made.browser}):`);
console.log(report.join("\n"));

// The site's first screen ends its trail of light on the ring of the name, at a place it has
// written down (src/components/Hero.astro, .hero__trail). The place is measured here: say so if
// the two disagree, as they will when the name's spacing or the ring's size is changed.
const hero = await readFile(join(root, "src/components/Hero.astro"), "utf8");
const written = {
  x: Number(hero.match(/left:\s*calc\(([\d.]+)em\s*-\s*var\(--trail\)\)/)?.[1]),
  y: Number(hero.match(/top:\s*calc\(([\d.]+)em\s*-\s*var\(--trail-w\)/)?.[1]),
};
const trailAgrees = written.x === made.trail.x && written.y === made.trail.y;
console.log(
  trailAgrees
    ? `  ${"Hero.astro, where the trail ends".padEnd(34)} same (${made.trail.x}em, ${made.trail.y}em)`
    : `\nThe ring of the name now stands with its upper left edge at ${made.trail.x}em, ${made.trail.y}em, but src/components/Hero.astro\nends its trail at ${written.x}em, ${written.y}em. Put the new numbers in .hero__trail (left and top) and in the comment above it.`,
);

if (checking && unsettled) console.log("\nSome files are not what the sources give. `npm run brand` writes them again.");
process.exit((checking && unsettled) || !trailAgrees ? 1 : 0);
