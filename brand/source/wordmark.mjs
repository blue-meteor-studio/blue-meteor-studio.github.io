// The studio's name as the site sets it, for the brand's own files.
//
// Nothing about the name is decided here. How it is set (the typeface, the spacing, the size of the
// small line, where the ring stands) is read from the site's component,
// src/components/Wordmark.astro; a browser lays it out; and the letters' outlines are taken from
// the font file. Change the component, run `npm run brand`, and these files follow.

import { readFile } from "node:fs/promises";
import { create } from "fontkitten";
import { colors, logo } from "./logo.mjs";

const component = new URL("../../src/components/Wordmark.astro", import.meta.url);
const fontFile = new URL("../../src/assets/fonts/jost-latin-500-normal.woff2", import.meta.url);

/** The name. The ring stands where the "o" of Meteor would. */
const name = { before: "Blue Mete", after: "r", small: "Studio" };

/**
 * CSS that sets the name on a plain page: the typeface, the two values the site's CSS takes from
 * its own variables, and the component's rules as they are written.
 */
export async function wordmarkStyles() {
  const source = await readFile(component, "utf8");
  const rules = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if (!rules) throw new Error("src/components/Wordmark.astro has no <style> block to read the name's setting from.");
  // The component reaches the logo, which is another component, through :global(). A plain page has no such fences.
  const plain = rules.replace(/:global\(([^()]*)\)/g, "$1");
  for (const part of [".wordmark {", ".wordmark__title {", ".wordmark__sub {", ".wordmark__o {"]) {
    if (!plain.includes(part)) {
      throw new Error(`The styles in src/components/Wordmark.astro no longer have a rule "${part}", which brand/source/wordmark.mjs relies on.`);
    }
  }
  return `@font-face { font-family: "Jost"; font-weight: 500; font-style: normal; src: url("${fontFile.href}") format("woff2"); }
:root { --font-wordmark: "Jost"; --moon: ${colors.smallOnDark}; }
${plain}`;
}

/** The name's markup, as the component writes it (without the hidden letter it keeps for copying and search). */
export function wordmarkMarkup() {
  const { ring } = logo;
  const o = `<svg class="wordmark__o" viewBox="${logo.frames.letter}" style="overflow: visible"><circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" fill="none" stroke="currentColor" stroke-width="${ring.width}"/><path d="${logo.light}" fill="${colors.light}"/></svg>`;
  return `<span class="wordmark"><span class="wordmark__title">${name.before}${o}${name.after}</span> <span class="wordmark__sub">${name.small}</span></span>`;
}

// Run in the page: where everything in the name stands, in em of the name's font size, from the top left of its box.
const measure = `(() => {
  const wordmark = document.querySelector(".wordmark");
  const box = wordmark.getBoundingClientRect();
  const em = parseFloat(getComputedStyle(wordmark).fontSize);
  const line = (selector) => {
    const element = wordmark.querySelector(selector);
    const style = getComputedStyle(element);
    // An empty box standing on the baseline says where the baseline is.
    const probe = element.appendChild(document.createElement("span"));
    probe.style.cssText = "display: inline-block; width: 0; height: 0; vertical-align: baseline";
    const baseline = probe.getBoundingClientRect().bottom;
    probe.remove();
    const letters = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode()); ) {
      for (let i = 0; i < node.data.length; i++) {
        if (!node.data[i].trim()) continue;
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        letters.push({
          letter: style.textTransform === "uppercase" ? node.data[i].toUpperCase() : node.data[i],
          x: (range.getBoundingClientRect().left - box.left) / em,
        });
      }
    }
    return { size: parseFloat(style.fontSize) / em, baseline: (baseline - box.top) / em, letters };
  };
  const ring = wordmark.querySelector(".wordmark__o").getBoundingClientRect();
  return {
    typeface: [...document.fonts].some((face) => face.family.replace(/"/g, "") === "Jost" && face.status === "loaded"),
    width: box.width / em,
    height: box.height / em,
    title: line(".wordmark__title"),
    small: line(".wordmark__sub"),
    ring: { x: (ring.left - box.left) / em, y: (ring.top - box.top) / em, size: ring.width / em },
  };
})()`;

/**
 * Lays the name out in the browser and reports where its letters and its ring stand.
 * `stage` is { show(name, html, size), read(js) }.
 */
export async function measureWordmark(stage) {
  // One pixel to each unit of the typeface (1000 to the em), so positions come out at full precision.
  const html = `<!doctype html>
<meta charset="utf-8">
<style>
${await wordmarkStyles()}
html, body { margin: 0; }
.stage { position: absolute; left: 0; top: 0; font-size: 1000px; }
</style>
<div class="stage">${wordmarkMarkup()}</div>
`;
  await stage.show("wordmark.html", html, { width: 1280, height: 800 });
  const measured = await stage.read(measure);
  if (!measured.typeface) throw new Error("The name's typeface (Jost) did not load, so the name cannot be measured.");
  return measured;
}

/**
 * Where the trail of light on the site's first screen ends: the point of the ring's edge nearest
 * the upper left, in em from the top left of the name.
 */
export function trailEnd(measured) {
  const radius = measured.ring.size / 2;
  const inward = radius * Math.SQRT1_2;
  return { x: +(measured.ring.x + radius - inward).toFixed(3), y: +(measured.ring.y + radius - inward).toFixed(3) };
}

const round = (value) => +value.toFixed(2);
const text = (value) => String(round(value));

/**
 * The name as a drawing of its own (SVG): every letter an outline, so the file needs no typeface
 * and looks the same in any program. 100 units to the em of the title. `colouring` is
 * { letters, light, small }.
 */
export async function wordmarkSvg(measured, colouring) {
  const font = create(await readFile(fontFile));
  const unit = 100;
  const lines = [measured.title, measured.small].map((line) => ({
    scale: (line.size * unit) / font.unitsPerEm,
    baseline: line.baseline * unit,
    letters: line.letters.map(({ letter, x }) => {
      const code = letter.codePointAt(0);
      if (!font.hasGlyphForCodePoint(code)) throw new Error(`The name's typeface has no letter "${letter}".`);
      return { glyph: font.glyphForCodePoint(code), x: x * unit };
    }),
  }));
  const ring = { x: measured.ring.x * unit, y: measured.ring.y * unit, scale: (measured.ring.size * unit) / 100 };

  // The edges of everything drawn, and the same clear space round it as the logo's master files
  // keep, in proportion to the ring.
  const edges = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  const cover = (left, top, right, bottom) => {
    edges.left = Math.min(edges.left, left);
    edges.top = Math.min(edges.top, top);
    edges.right = Math.max(edges.right, right);
    edges.bottom = Math.max(edges.bottom, bottom);
  };
  for (const { scale, baseline, letters } of lines) {
    for (const { glyph, x } of letters) {
      cover(x + glyph.bbox.minX * scale, baseline - glyph.bbox.maxY * scale, x + glyph.bbox.maxX * scale, baseline - glyph.bbox.minY * scale);
    }
  }
  cover(ring.x, ring.y, ring.x + logo.extent * ring.scale, ring.y + logo.extent * ring.scale);
  const space = (logo.master.margin / logo.master.scale) * ring.scale;
  const shift = { x: round(space - edges.left), y: round(space - edges.top) };

  const outline = ({ glyph, x }, { scale, baseline }) => {
    const X = (value) => text(shift.x + x + value * scale);
    const Y = (value) => text(shift.y + baseline - value * scale);
    const d = glyph.path.commands
      .map(({ command, args: a }) => {
        if (command === "moveTo") return `M${X(a[0])} ${Y(a[1])}`;
        if (command === "lineTo") return `L${X(a[0])} ${Y(a[1])}`;
        if (command === "quadraticCurveTo") return `Q${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])}`;
        if (command === "bezierCurveTo") return `C${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])} ${X(a[4])} ${Y(a[5])}`;
        return "Z";
      })
      .join(" ");
    return `<path d="${d}"/>`;
  };
  const placed = logo.place({ x: shift.x + ring.x, y: shift.y + ring.y, scale: ring.scale });
  const [title, small] = lines;
  // The title in reading order: the ring among its letters.
  const titleShapes = [
    ...title.letters.filter((letter) => letter.x < ring.x).map((letter) => outline(letter, title)),
    `<path fill-rule="evenodd" d="${placed.ring}"/>`,
    ...title.letters.filter((letter) => letter.x >= ring.x).map((letter) => outline(letter, title)),
  ];
  const smallShapes = small.letters.map((letter) => outline(letter, small));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${text(edges.right - edges.left + 2 * space)} ${text(edges.bottom - edges.top + 2 * space)}">
  <title>Blue Meteor Studio</title>
  <g fill="${colouring.letters}">
    ${titleShapes.join("\n    ")}
  </g>
  <path d="${placed.light}" fill="${colouring.light}"/>
  <g fill="${colouring.small}">
    ${smallShapes.join("\n    ")}
  </g>
</svg>
`;
}
