// The share image: the card that a link to the site unfolds into (public/og.png).
//
// It is composed like the site's first screen: the name over the horizon of the arena floor, and
// the meteor's trail of light coming down from the upper left to the name's "O".
// The sky, the floor and the trail are written here. The name is the site's own (see wordmark.mjs).

import { colors } from "./logo.mjs";

export const shareImageSize = { width: 1200, height: 630 };

/** The handles of the composition. */
const layout = {
  /** Font size of the name, in pixels. */
  name: 92,
  /** How far down the horizon lies, in percent of the height. */
  horizon: 66,
  /** Space between the name and the horizon, in pixels. */
  gap: 58,
  /** Length and thickness of the trail of light, in pixels. */
  trail: 640,
  trailWidth: 3.2,
  /** Strength of the blue glow in the upper left of the sky, from 0 to 1. */
  glow: 0.2,
};

/**
 * The page to photograph.
 *   styles    CSS that sets the name (wordmarkStyles)
 *   wordmark  the name's markup (wordmarkMarkup)
 *   trailEnd  where on the name the trail ends, in em from its top left (trailEnd)
 */
export function shareImage({ styles, wordmark, trailEnd }) {
  const floor = 100 - layout.horizon;
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<style>
${styles}
  html, body { margin: 0; }
  body { position: relative; width: ${shareImageSize.width}px; height: ${shareImageSize.height}px; overflow: hidden; background: radial-gradient(90% 70% at 24% 6%, rgb(29 78 216 / ${layout.glow}), transparent 62%), linear-gradient(180deg, #060815 0%, ${colors.ground} 55%, #0b1030 100%); color: ${colors.onDark}; }
  #stars { position: absolute; inset: 0; }
  .floor { position: absolute; inset: auto 0 0 0; height: ${floor}%; overflow: hidden; perspective: 380px; perspective-origin: 50% 0%; -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 36%); }
  .grid { position: absolute; top: 0; left: -75%; width: 250%; height: 420%; transform-origin: 50% 0%; transform: rotateX(74deg); background-image: linear-gradient(90deg, rgb(91 140 255 / 0.6) 2px, transparent 2px), linear-gradient(180deg, rgb(91 140 255 / 0.6) 2px, transparent 2px); background-size: 84px 84px; background-position: 50% 0; }
  .horizon { position: absolute; inset: auto 0 ${floor}% 0; height: 1px; background: linear-gradient(90deg, transparent, rgb(111 211 255 / 0.6) 30%, rgb(111 211 255 / 0.6) 70%, transparent); box-shadow: 0 0 40px 10px rgb(91 140 255 / 0.25); }
  .shade { position: absolute; inset: auto 0 0 0; height: ${floor}%; background: linear-gradient(0deg, rgb(8 10 24 / 0.7) 0%, transparent 60%); }
  /* The sky ends at the horizon; the name stands at its foot. Its top fades out, so the trail has no cut end. */
  .sky { position: absolute; inset: 0 0 ${floor}% 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: ${layout.gap}px; -webkit-mask-image: linear-gradient(180deg, transparent 8px, #000 104px); mask-image: linear-gradient(180deg, transparent 8px, #000 104px); }
  .title { position: relative; display: flex; font-size: ${layout.name}px; line-height: 1; }
  /* A thin wedge of light at 45 degrees, turned about its bright end, which lies on the ring. */
  .trail { position: absolute; left: calc(${trailEnd.x}em - ${layout.trail}px); top: calc(${trailEnd.y}em - ${layout.trailWidth / 2}px); width: ${layout.trail}px; height: ${layout.trailWidth}px; transform-origin: 100% 50%; rotate: 45deg; background: linear-gradient(90deg, rgb(91 140 255 / 0) 0%, rgb(91 140 255 / 0) 22%, rgb(91 140 255 / 0.5) 80%, rgb(201 214 255 / 0.9) 96%, rgb(233 251 246 / 0.95) 100%); clip-path: polygon(0 50%, 100% 0, 100% 100%); }
</style>
<svg id="stars" viewBox="0 0 ${shareImageSize.width} ${shareImageSize.height}"></svg>
<div class="floor"><div class="grid"></div></div>
<div class="horizon"></div>
<div class="shade"></div>
<div class="sky"><div class="title">${wordmark}<span class="trail"></span></div></div>
<script>
  // The same seeded sky as the site's first screen (src/components/Hero.astro).
  let seed = 20261124;
  const random = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let n = Math.imul(seed ^ (seed >>> 15), 1 | seed); n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n; return ((n ^ (n >>> 14)) >>> 0) / 4294967296; };
  const sky = document.getElementById("stars");
  for (let i = 0; i < 110; i++) {
    const size = random();
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", (random() * ${shareImageSize.width}).toFixed(1));
    c.setAttribute("cy", (Math.pow(random(), 1.35) * ${shareImageSize.height}).toFixed(1));
    c.setAttribute("r", size > 0.93 ? 1.9 : size > 0.7 ? 1.3 : 0.8);
    c.setAttribute("fill", "${colors.smallOnDark}");
    c.setAttribute("opacity", (0.35 + random() * 0.6).toFixed(2));
    sky.appendChild(c);
  }
</script>
</html>
`;
}
