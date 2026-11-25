// The studio's logo: a ring (the meteor) with a crescent of blue light on its lower right, where the
// meteor pushes the air aside. The same drawing is the "O" of the name wherever the site draws the
// name (header, hero, footer) and the symbol on its own (the header on a narrow phone). Its shapes
// and colours are kept here, in one place, so that the places that draw it cannot drift apart.
// public/favicon.svg and the files in brand/ repeat this drawing by hand: change them together with
// this file.

/**
 * Drawn in a box of 100 that the ring fills. The crescent reaches outside that box, to 116.96 on the
 * right and below.
 */
export const logoShapes = {
  /** The meteor: a circle drawn as a stroke of this width. */
  ring: { cx: 50, cy: 50, r: 42.6, width: 14.8 },
  /** The light where the meteor pushes the air aside. */
  light: "M104.31 26.95 A54.94 54.94 0 0 1 26.95 104.31 A59 59 0 0 0 104.31 26.95 Z",
} as const;

/** The two ways to frame the drawing (an svg viewBox). */
export const logoFrames = {
  /** The whole drawing in a square, with the same margin as the files in brand/ (44 in 512). */
  symbol: "-12.14 -12.14 141.23 141.23",
  /** The ring alone fills the box, to stand among letters as an "O". The crescent hangs outside it. */
  letter: "0 0 100 100",
} as const;

/**
 * The ring has no colour of its own: it takes the colour of the text around it (near-white on the
 * site's dark background, navy on a white one). The light is this blue on every background.
 */
export const logoColors = {
  light: "#3c6dec",
} as const;
