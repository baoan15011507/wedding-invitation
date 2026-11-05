/** Thử photometa / preview với tọa độ */
async function tryUrl(label, url) {
  const r = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.google.com/maps',
    },
  })
  const t = await r.text()
  console.log('\n==', label, r.status, t.slice(0, 200).replace(/\n/g, ' '))
  const panos = [...t.matchAll(/"([A-Za-z0-9_-]{22})"/g)].map((m) => m[1])
  const uniq = [...new Set(panos)].slice(0, 15)
  console.log('22char', uniq)
  const dates = [...t.matchAll(/\[(20\d{2}),(\d{1,2})\]/g)]
    .map((m) => `${m[1]}-${m[2]}`)
    .slice(0, 20)
  console.log('dates', dates)
}

const lat = 10.927072
const lng = 108.065653

await tryUrl(
  'photometa e10',
  'https://www.google.com/maps/photometa/v1?authuser=0&hl=vi&gl=vn&pb=' +
    encodeURIComponent(
      `!1m4!1smaps_sv.tactile!11m2!2m1!1b1!2m2!1svi!2svn!3m3!1m2!1e10!2s${lat},${lng}!4m57!1e1!1e2!1e3!1e4!1e5!1e6!1e8!1e12!2m1!1e1!4m1!1i48!5m1!1e1!5m1!1e2!6m1!1e1!6m1!1e2!9m36!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e3!2b1!3e2!1m3!1e3!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e1!2b0!3e3!1m3!1e4!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e3`,
    ),
)

await tryUrl(
  'preview reveal',
  `https://www.google.com/maps/preview/reveal?authuser=0&hl=vi&gl=vn&pb=!1m16!1s!2m2!1m1!1e1!3m7!1m3!1e2!2b1!3e2!1m3!1e3!2b1!3e2!2m2!1e0!2e0!3m5!2s${lat}%2C${lng}!3s0!5e0!6b1!7i1!8i1`,
)

await tryUrl(
  'vt streetview',
  `https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i12!2i${Math.floor(((lng + 180) / 360) * 2 ** 12)}!3i${Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** 12)}!2e1!3e0!3m3!2svi!3sVN!5e1105!12m1!1e3!12m1!1e4!12m1!1e5!4e0!5m1!1e0!23i4111425`,
)
