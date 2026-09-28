// Renders the app icons (PNG) from the master SVG logo in public/favicon.svg.
// The SVG is the single source of truth; PNGs are rasterized with @resvg/resvg-js.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svg = readFileSync(resolve(root, "public/favicon.svg"), "utf8");

function render(size, filename) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "rgba(0,0,0,0)",
  });
  const png = resvg.render().asPng();
  const out = resolve(root, filename);
  writeFileSync(out, png);
  console.log("wrote", filename, png.length, "bytes");
}

render(192, "public/icon-192.png");
render(512, "public/icon-512.png");
