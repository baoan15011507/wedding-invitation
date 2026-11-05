const lat = 10.927072
const lng = 108.065653
const url = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,0,,0,5`
const r = await fetch(url, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
})
const t = await r.text()

const needles = ['pano', 'Pano', 'streetview', 'Street View', 'APRIL', '2024', '2025', '2026', 'photometa', '1e1!3m']
for (const n of needles) {
  const i = t.indexOf(n)
  console.log(n, i)
  if (i >= 0) console.log(t.slice(Math.max(0, i - 40), i + 80).replace(/\n/g, ' '))
}

// collect token-like ids near streetview blobs
const ids = new Set()
for (const m of t.matchAll(/[A-Za-z0-9_-]{22,44}/g)) {
  const s = m[0]
  if (/[A-Za-z]/.test(s) && /\d/.test(s) && !s.includes('http')) ids.add(s)
}
console.log('candidate count', ids.size)
console.log([...ids].slice(0, 30))

// APP_INITIALIZATION
const appIdx = t.indexOf('APP_INITIALIZATION_STATE')
console.log('APP_INIT', appIdx)
if (appIdx >= 0) console.log(t.slice(appIdx, appIdx + 500))
