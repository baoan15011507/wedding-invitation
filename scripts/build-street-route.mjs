/**
 * Tạo src/data/street-route.json:
 * 1) OSRM lấy hình học đường
 * 2) Photometa (không key) lấy pano Street View — ưu tiên ảnh tháng 7/2026
 *
 * Chạy: node scripts/build-street-route.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

/** Điểm đầu: https://maps.app.goo.gl/5NSdRAGNA7cjTfCV9 */
const origin = {
  lat: 10.9597235,
  lng: 108.1433945,
  heading: 107.88,
  pitch: -7,
  fov: 75,
  pano: '39-LETotK94RdbsF24lX-A',
  imageDate: '2026-07',
  mapsUrl: 'https://maps.app.goo.gl/5NSdRAGNA7cjTfCV9',
}

const destination = {
  lat: 10.9611142,
  lng: 108.1618585,
  mapsUrl: 'https://maps.app.goo.gl/ZmPpUDbQ442QPcLbA',
}

const TARGET_DATE = { year: 2026, month: 7 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function hav(a, b) {
  const R = 6371000
  const toRad = Math.PI / 180
  const dLat = (b.lat - a.lat) * toRad
  const dLng = (b.lng - a.lng) * toRad
  const la1 = a.lat * toRad
  const la2 = b.lat * toRad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function bearing(a, b) {
  const toRad = Math.PI / 180
  const φ1 = a.lat * toRad
  const φ2 = b.lat * toRad
  const Δλ = (b.lng - a.lng) * toRad
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

async function fetchPhotometa(pano) {
  const u =
    'https://www.google.com/maps/photometa/v1?authuser=0&hl=vi&gl=vn&pb=' +
    encodeURIComponent(
      `!1m4!1smaps_sv.tactile!11m2!2m1!1b1!2m2!1svi!2svn!3m3!1m2!1e2!2s${pano}!4m57!1e1!1e2!1e3!1e4!1e5!1e6!1e8!1e12!2m1!1e1!4m1!1i48!5m1!1e1!5m1!1e2!6m1!1e1!6m1!1e2!9m36!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e3!2b1!3e2!1m3!1e3!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e1!2b0!3e3!1m3!1e4!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e3`,
    )
  const raw = await (
    await fetch(u, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
  ).text()
  return JSON.parse(raw.replace(/^\)\]\}'\n?/, ''))
}

function parseMeta(j, pano) {
  const root = j?.[1]?.[0]
  if (!root) return null
  const lat = root?.[5]?.[0]?.[1]?.[0]?.[2]
  const lng = root?.[5]?.[0]?.[1]?.[0]?.[3]
  const dateArr = root?.[6]?.[7]
  const imageDate =
    Array.isArray(dateArr) && dateArr.length >= 2
      ? `${dateArr[0]}-${String(dateArr[1]).padStart(2, '0')}`
      : null
  const links = []
  const rawLinks = root?.[5]?.[0]?.[3]?.[0] || []
  for (const item of rawLinks) {
    const idWrap = item?.[0]
    const id = idWrap?.[1]
    const kind = idWrap?.[0]
    const ll = item?.[2]?.[0]
    const plat = ll?.[2]
    const plng = ll?.[3]
    if (typeof id === 'string' && typeof plat === 'number' && typeof plng === 'number') {
      // kind 2 = street view pano thường; bỏ qua kind 10 (ảnh khác)
      if (kind === 10) continue
      links.push({ pano: id, lat: plat, lng: plng })
    }
  }
  return {
    pano,
    lat: typeof lat === 'number' ? lat : null,
    lng: typeof lng === 'number' ? lng : null,
    imageDate,
    links,
  }
}

const metaCache = new Map()
async function getMeta(pano) {
  if (metaCache.has(pano)) return metaCache.get(pano)
  await sleep(120)
  try {
    const j = await fetchPhotometa(pano)
    const m = parseMeta(j, pano)
    metaCache.set(pano, m)
    return m
  } catch (e) {
    console.warn('photometa fail', pano, e.message)
    metaCache.set(pano, null)
    return null
  }
}

function isTargetDate(imageDate) {
  if (!imageDate) return false
  const [y, m] = imageDate.split('-').map(Number)
  return y === TARGET_DATE.year && m === TARGET_DATE.month
}

// --- OSRM geometry (để gắn milestone / progress) ---
const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
const osrmRes = await fetch(osrmUrl)
const osrmText = await osrmRes.text()
if (osrmText.trimStart().startsWith('<')) {
  console.error('OSRM trả HTML — thử lại sau.')
  process.exit(1)
}
const osrm = JSON.parse(osrmText)
if (osrm.code !== 'Ok') {
  console.error(osrm)
  process.exit(1)
}
const routeDistance = Math.round(osrm.routes[0].distance)

console.log('Đi bộ chuỗi Street View ưu tiên', `${TARGET_DATE.year}-${String(TARGET_DATE.month).padStart(2, '0')}…`)

const frames = []
const visited = new Set()
let current = origin.pano
let guard = 0
const maxHops = 220

while (guard++ < maxHops) {
  if (visited.has(current)) break
  visited.add(current)

  const meta = await getMeta(current)
  if (!meta || meta.lat == null) {
    console.warn('Mất meta tại', current)
    break
  }

  const distToDest = hav(
    { lat: meta.lat, lng: meta.lng },
    destination,
  )

  const prev = frames[frames.length - 1]
  const heading = prev
    ? bearing(prev, { lat: meta.lat, lng: meta.lng })
    : origin.heading

  // Chỉ giữ pano đúng tháng 7/2026 (điểm đầu đã xác nhận)
  if (isTargetDate(meta.imageDate) || current === origin.pano) {
    // bỏ điểm quá sát điểm trước
    if (!prev || hav(prev, meta) > 12) {
      frames.push({
        lat: +meta.lat.toFixed(6),
        lng: +meta.lng.toFixed(6),
        heading: +heading.toFixed(1),
        pitch: frames.length === 0 ? origin.pitch : 5,
        fov: origin.fov,
        pano: meta.pano,
        imageDate: meta.imageDate || origin.imageDate,
      })
      process.stdout.write(
        `\r  frames=${frames.length} distToDest=${Math.round(distToDest)}m pano=${meta.pano.slice(0, 12)}…`,
      )
    }
  }

  if (distToDest < 35) break

  // Chọn link tiến gần đích nhất; ưu tiên đã biết đúng tháng 7/2026
  const candidates = []
  for (const link of meta.links) {
    if (visited.has(link.pano)) continue
    const progress = distToDest - hav(link, destination)
    if (progress < -5) continue // đi lùi rõ
    candidates.push({ ...link, progress })
  }
  candidates.sort((a, b) => b.progress - a.progress)

  let next = null
  // Thử vài ứng viên gần đích nhất, chọn cái đúng tháng 7/2026
  for (const c of candidates.slice(0, 8)) {
    const cm = await getMeta(c.pano)
    if (cm && isTargetDate(cm.imageDate)) {
      next = c.pano
      break
    }
  }
  // Fallback: tiến gần đích dù khác tháng (vẫn ghi imageDate thật)
  if (!next && candidates[0]) {
    next = candidates[0].pano
  }
  if (!next) break
  current = next
}

console.log(`\nThu được ${frames.length} khung`)

// Gắn heading nhìn về điểm kế tiếp + milestone
const destPt = { lat: destination.lat, lng: destination.lng }
if (!frames.length || hav(frames[frames.length - 1], destPt) > 20) {
  frames.push({
    lat: destination.lat,
    lng: destination.lng,
    heading: frames.length
      ? bearing(frames[frames.length - 1], destPt)
      : 0,
    pitch: 5,
    fov: 75,
  })
}

const cum = [0]
let acc = 0
for (let i = 1; i < frames.length; i++) {
  acc += hav(frames[i - 1], frames[i])
  cum.push(acc)
}
const total = acc || 1

const withMeta = frames.map((p, i) => {
  const next = frames[Math.min(i + 1, frames.length - 1)]
  const ratio = cum[i] / total
  let milestone = 'Đầu đường'
  let milestoneIndex = 0
  if (ratio >= 0.95) {
    milestone = 'Nhà'
    milestoneIndex = 3
  } else if (ratio >= 0.66) {
    milestone = 'Gần nhà'
    milestoneIndex = 2
  } else if (ratio >= 0.33) {
    milestone = 'Giữa đường'
    milestoneIndex = 1
  }
  return {
    ...p,
    heading: +bearing(p, next).toFixed(1),
    milestone,
    milestoneIndex,
  }
})
// điểm đầu: giữ heading từ link Maps của bạn
withMeta[0].heading = origin.heading
withMeta[0].pitch = origin.pitch
withMeta[0].pano = origin.pano
withMeta[0].imageDate = origin.imageDate

const pick = (r) =>
  withMeta[Math.min(withMeta.length - 1, Math.floor(withMeta.length * r))]
const milestones = [
  {
    label: 'Đầu đường',
    lat: withMeta[0].lat,
    lng: withMeta[0].lng,
    heading: withMeta[0].heading,
    pano: withMeta[0].pano,
  },
  {
    label: 'Giữa đường',
    lat: pick(0.33).lat,
    lng: pick(0.33).lng,
    heading: pick(0.33).heading,
    pano: pick(0.33).pano,
  },
  {
    label: 'Gần nhà',
    lat: pick(0.66).lat,
    lng: pick(0.66).lng,
    heading: pick(0.66).heading,
    pano: pick(0.66).pano,
  },
  {
    label: 'Nhà',
    lat: withMeta[withMeta.length - 1].lat,
    lng: withMeta[withMeta.length - 1].lng,
    heading: withMeta[withMeta.length - 1].heading,
    pano: withMeta[withMeta.length - 1].pano,
  },
]

const dated = withMeta.filter((f) => f.imageDate === '2026-07').length

const out = {
  source: 'osrm+photometa',
  note: 'Street View Embed dùng pano tháng 7/2026 khi có. Không cần Maps JavaScript API.',
  generatedAt: new Date().toISOString(),
  preferImageDate: '2026-07',
  framesWithDate2026_07: dated,
  origin,
  destination,
  distanceMeters: routeDistance,
  stepMs: 1200,
  milestones,
  frames: withMeta,
}

const destFile = path.join(root, 'src', 'data', 'street-route.json')
fs.writeFileSync(destFile, JSON.stringify(out, null, 2))
console.log(`Saved ${destFile}`)
console.log(
  `frames=${withMeta.length} dated_2026-07=${dated} distance=${routeDistance}m`,
)
