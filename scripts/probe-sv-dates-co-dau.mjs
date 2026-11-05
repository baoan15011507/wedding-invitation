/**
 * Dò pano gần origin/dest + vài điểm OSRM, liệt kê imageDate có sẵn.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const route = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../src/data/street-route-co-dau.json'),
    'utf8',
  ),
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

/** Tìm pano gần lat/lng qua endpoint không chính thức */
async function findPanoNear(lat, lng) {
  const attempts = [
    `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&source=outdoor`,
    `https://www.google.com/maps/rpc/photo/listentityphotos?authuser=0&hl=vi&gl=vn&pb=!1e3!4b1!5m2!1e1!1e2!6m3!1s${lat}%2C${lng}!2e1!3e1`,
  ]
  // Proto SingleImageSearch-ish via maps
  const pb = `!1m7!1m2!1m1!1s${lat},${lng}!2svi!3sVN!2m2!1e0!2e0!3m4!1s!2s!3s!4s`
  attempts.push(
    `https://maps.googleapis.com/$rpc/google.internal.maps.photosphere.v1.StreetViewService/GetPanorama?key=`,
  )

  // Thử CBK cổ điển
  const cbks = [
    `https://maps.google.com/cbk?output=json&ll=${lat},${lng}&radius=120`,
    `https://maps.google.com/cbk?output=json&ll=${lat},${lng}&radius=250`,
    `https://cbks0.google.com/cbk?output=json&ll=${lat},${lng}&radius=200`,
  ]
  for (const u of cbks) {
    try {
      const r = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      const ct = r.headers.get('content-type') || ''
      const t = await r.text()
      if (t.startsWith('{') || t.startsWith('[')) {
        const j = JSON.parse(t)
        const pano = j?.Location?.panoId || j?.Location?.pano_id || j?.panoId
        console.log('cbk ok', u.slice(0, 60), pano, j?.Location?.zoomLevels || j?.Data)
        if (pano) return pano
      } else {
        console.log('cbk not json', r.status, ct, t.slice(0, 80))
      }
    } catch (e) {
      console.log('cbk fail', e.message)
    }
  }
  return null
}

const samples = []
const frames = route.frames || []
for (const i of [0, Math.floor(frames.length / 3), Math.floor((frames.length * 2) / 3), frames.length - 1]) {
  samples.push(frames[i])
}

for (const p of samples) {
  console.log('\n== point', p.lat, p.lng, p.milestone)
  const pano = await findPanoNear(p.lat, p.lng)
  if (!pano) continue
  await sleep(150)
  try {
    const j = await fetchPhotometa(pano)
    const m = parseMeta(j, pano)
    console.log('meta', m?.imageDate, m?.lat, m?.lng, 'links', m?.links?.length)
    const dates = new Set()
    if (m?.imageDate) dates.add(m.imageDate)
    for (const link of (m?.links || []).slice(0, 12)) {
      await sleep(100)
      const lm = parseMeta(await fetchPhotometa(link.pano), link.pano)
      if (lm?.imageDate) dates.add(lm.imageDate)
    }
    console.log('nearby dates', [...dates].sort())
  } catch (e) {
    console.log('photometa err', e.message)
  }
}
