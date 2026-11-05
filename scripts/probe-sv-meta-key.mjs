import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8')
const key = (env.match(/VITE_GOOGLE_MAPS_EMBED_KEY\s*=\s*(.+)/) || [])[1]?.trim()
if (!key) {
  console.error('no key')
  process.exit(1)
}

const pts = [
  [10.927072, 108.065653],
  [10.924842, 108.059624],
  [10.921752, 108.058067],
]

for (const [lat, lng] of pts) {
  const u = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&source=outdoor&key=${key}`
  const j = await (await fetch(u)).json()
  console.log(lat, lng, j.status, j.date || null, j.pano_id ? j.pano_id.slice(0, 16) : null, j.location)
}
