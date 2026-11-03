/**
 * build-css.mjs
 * Minifică public/assets/css/global.css → public/assets/css/global.min.css
 * Rulat automat înainte de `astro build` prin npm run build:css
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, "../public/assets/css/global.css");
const outPath = join(__dirname, "../public/assets/css/global.min.css");

function minifyCss(css) {
  return css
    // Elimină comentarii /* ... */
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Colapsează whitespace multiplu într-un singur spațiu
    .replace(/\s+/g, " ")
    // Elimină spații în jurul caracterelor CSS speciale
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    // Elimină ultimul ; înainte de }
    .replace(/;}/g, "}")
    // Elimină spații la început/final
    .trim();
}

const source = readFileSync(srcPath, "utf-8");
const minified = minifyCss(source);
writeFileSync(outPath, minified, "utf-8");

const srcSize = Buffer.byteLength(source, "utf-8");
const outSize = Buffer.byteLength(minified, "utf-8");
const reduction = (((srcSize - outSize) / srcSize) * 100).toFixed(1);

console.log(`CSS minified: ${srcSize} → ${outSize} bytes (${reduction}% reduction)`);
