// Packs the 98,325 per-location files in data/detailed_locations into one file
// per 1x1 degree tile in public/data/locations. Cloudflare Workers static
// assets allow 20,000 files per deploy on the free plan, so the raw files
// cannot be deployed one by one.
//
// Tile file: public/data/locations/<floor(lat)>_<floor(lon)>.json
//   { "firstYear": 1970, "points": [[lat, lon, [value1970, value1971, ...]], ...] }
// lat and lon keep the 6 decimals of the raw file names, so the client can
// match a point with toFixed(6), as it matched the raw file names before.
import { readdir, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'data', 'detailed_locations');
const targetDir = path.join(root, 'public', 'data', 'locations');

const names = (await readdir(sourceDir)).filter((name) => name.endsWith('.json'));
const tiles = new Map();
let firstYear = null;
let yearCount = null;

for (const name of names) {
  const [, latText, lonText] = name.slice(0, -'.json'.length).split('_');
  const lat = Number(latText);
  const lon = Number(lonText);
  const raw = JSON.parse(await readFile(path.join(sourceDir, name), 'utf8'));
  const years = Object.keys(raw.data).map(Number).sort((a, b) => a - b);

  firstYear ??= years[0];
  yearCount ??= years.length;
  if (years[0] !== firstYear || years.length !== yearCount || years.at(-1) !== firstYear + yearCount - 1) {
    throw new Error(`${name}: years ${years[0]}-${years.at(-1)} (${years.length}) differ from ${firstYear} (${yearCount})`);
  }

  const key = `${Math.floor(lat)}_${Math.floor(lon)}`;
  if (!tiles.has(key)) {
    tiles.set(key, []);
  }
  tiles.get(key).push([lat, lon, years.map((year) => raw.data[year])]);
}

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });
for (const [key, points] of tiles) {
  await writeFile(path.join(targetDir, `${key}.json`), JSON.stringify({ firstYear, points }));
}

console.log(`Packed ${names.length} locations into ${tiles.size} tiles (${firstYear}-${firstYear + yearCount - 1}).`);
