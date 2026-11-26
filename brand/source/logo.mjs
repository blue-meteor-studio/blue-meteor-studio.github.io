// The studio's logo, as the numbers it is drawn from. This is the one place they are kept.
//
// The logo is the "O" of the name BLUE METEOR on its own: a ring (the meteor, falling to the lower
// right) with a crescent of blue light on its lower right (where the meteor pushes the air aside).
// Two flat shapes: no gradients, no outlines, and the same drawing at every size.
//
// What follows from this file:
//   - the site draws the logo from it (src/components/Logo.astro imports it);
//   - the files in brand/ and the icons and share image in public/ are made from it by
//     `npm run brand` (build.mjs, beside this file). See brand/README.md.

/** Colours. The ring has none of its own: it takes the colour of the text it stands in. */
export const colors = {
  /** The crescent of light. The same on every background. */
  light: "#3c6dec",
  /** The ring, and the letters of the name, on a dark background (--core in the site's CSS). */
  onDark: "#e9fbf6",
  /** The ring and the letters on white and other light backgrounds (--midnight). */
  onLight: "#10132a",
  /** "Studio", the small second line of the name: on dark (--moon) and on light (--dusk). */
  smallOnDark: "#c9d6ff",
  smallOnLight: "#252c57",
  /** The dark that the icons and the share image stand on (--void). */
  ground: "#080a18",
  /** For the versions in one colour. */
  white: "#ffffff",
};

/**
 * The handles: change these to change the drawing.
 * Units: the ring fills a box of 100, its outer edge touching all four sides.
 */
export const handles = {
  ring: {
    /** Radius of the middle of the ring's band, and the band's width. radius + width / 2 must come to 50. */
    radius: 42.6,
    width: 14.8,
  },
  light: {
    /** Clear space between the ring and the light. */
    gap: 9,
    /** How far round the ring the light reaches, in degrees. It is centred on the lower right. */
    spread: 136,
    /** How thick the light is at its middle. It narrows to a point at each end. */
    thickness: 12.93,
  },
};

/** The box of the master files in brand/, and the clear space they keep on every side. */
const master = { size: 512, margin: 44 };

/** The drawing is kept on a grid of 0.01. */
const round = (value) => +value.toFixed(2);
const text = (value) => String(round(value));

function draw({ ring, light }) {
  const centre = 50;
  const outer = ring.radius + ring.width / 2;
  if (Math.abs(outer - 50) > 1e-9) {
    throw new Error(`The ring must fill its box of 100: radius + width / 2 comes to ${outer}, not 50.`);
  }
  if (!(light.gap >= 0 && light.thickness > 0 && light.spread > 0 && light.spread <= 180)) {
    throw new Error("The light needs a gap of 0 or more, a thickness above 0 and a spread of up to 180 degrees.");
  }

  // The light's inner edge is a circle round the ring's centre. Its two ends lie on that circle, the
  // same angle to either side of the lower right (the direction of the fall).
  const inner = round(outer + light.gap);
  const half = ((light.spread / 2) * Math.PI) / 180;
  const fall = Math.PI / 4;
  const end = (angle) => [round(centre + inner * Math.cos(angle)), round(centre + inner * Math.sin(angle))];
  const upper = end(fall - half);
  const lower = end(fall + half);
  if (lower[0] < 0) throw new Error("The light reaches past the ring's left and top edges; the frames below assume it does not.");

  // Its outer edge is the circle through both ends that passes `thickness` outside the inner edge at
  // the middle. `chord` is half the distance between the ends; `reach` is how far the outer edge
  // stands out from the straight line between them.
  const chord = inner * Math.sin(half);
  const reach = inner + light.thickness - inner * Math.cos(half);
  const bulge = round((chord * chord + reach * reach) / (2 * reach));
  // Whether that circle's centre lies beyond the line between the ends (then the edge is its longer arc).
  const beyond = reach > bulge;

  // How far the whole drawing reaches to the right and downwards (the same, as it is symmetrical
  // about the diagonal). To the left and upwards it stops at the ring: 0.
  const middle = (upper[0] + lower[0]) / 2;
  const back = Math.sqrt(bulge * bulge - ((upper[0] - lower[0]) ** 2 + (upper[1] - lower[1]) ** 2) / 4);
  const bulgeCentre = middle + (beyond ? back : -back) * Math.SQRT1_2;
  // The outer edge only reaches its circle's rightmost point if it turns through that direction.
  const turnsRight = beyond || Math.asin(Math.min(1, Math.hypot(upper[0] - lower[0], upper[1] - lower[1]) / 2 / bulge)) >= Math.PI / 4;
  const extent = Math.max(2 * centre, turnsRight ? bulgeCentre + bulge : upper[0]);

  /**
   * The two shapes as filled outlines, moved to (x, y) and scaled. Files use this form: the ring is
   * a shape with a hole, not a stroke, because other tools do not all scale a stroke with its drawing.
   */
  const place = ({ x = 0, y = 0, scale = 1 } = {}) => {
    const cx = x + centre * scale;
    const cy = y + centre * scale;
    const circle = (r, sweep) =>
      `M${text(cx)} ${text(cy - r)} A${text(r)} ${text(r)} 0 1 ${sweep} ${text(cx)} ${text(cy + r)} A${text(r)} ${text(r)} 0 1 ${sweep} ${text(cx)} ${text(cy - r)} Z`;
    const at = ([px, py]) => `${text(x + px * scale)} ${text(y + py * scale)}`;
    const radii = (r) => `${text(r * scale)} ${text(r * scale)}`;
    return {
      ring: `${circle(outer * scale, 0)} ${circle((ring.radius - ring.width / 2) * scale, 1)}`,
      light: `M${at(upper)} A${radii(bulge)} 0 ${beyond ? 1 : 0} 1 ${at(lower)} A${radii(inner)} 0 0 0 ${at(upper)} Z`,
    };
  };

  const scale = (master.size - 2 * master.margin) / extent;
  const symbolEdge = text(-master.margin / scale);
  const symbolSide = text(master.size / scale);

  return {
    /** The ring, to be drawn as a stroke of this width (the site does, so that it takes the text's colour). */
    ring: { cx: centre, cy: centre, r: ring.radius, width: ring.width },
    /** The light, as path data in the box of 100. */
    light: place().light,
    /** Right and bottom edge of the whole drawing, in the box of 100. */
    extent,
    /** Ways to frame the drawing (SVG viewBox values). */
    frames: {
      /** The ring alone fills the box, to stand among letters as an "O". The light hangs outside it. */
      letter: `0 0 ${2 * centre} ${2 * centre}`,
      /** The whole drawing in a square, with the same clear space as the master files. */
      symbol: `${symbolEdge} ${symbolEdge} ${symbolSide} ${symbolSide}`,
    },
    /** The master files' box, and where the drawing sits in it. */
    master: { ...master, scale },
    place,
  };
}

export const logo = draw(handles);
