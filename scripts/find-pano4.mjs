function panoidsUrl(lat, lon, radius = 80) {
  return `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${lat}!4d${lon}!2d${radius}!3m10!2m2!1svi!2sVN!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=_xdc_._v2mub5`
}

function parsePanoids(text) {
  const pans = [
    ...text.matchAll(
      /\[(\d+),"([^"]+)"\][\s\S]*?\[\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)/g,
    ),
  ].map((m) => ({
    panoid: m[2],
    lat: +m[3],
    lon: +m[4],
  }))

  // dedupe
  const seen = new Set()
  const uniq = []
  for (const p of pans) {
    if (seen.has(p.panoid)) continue
    seen.add(p.panoid)
    uniq.push(p)
  }

  let dates = [...text.matchAll(/\[(20\d{2}),(\d{1,2})\]/g)].map((m) => [
    +m[1],
    +m[2],
  ])
  dates = dates.filter((d) => d[1] >= 1 && d[1] <= 12)

  // date assignment heuristic from streetview.py
  if (dates.length && uniq.length) {
    const last = dates[dates.length - 1]
    uniq[0].year = last[0]
    uniq[0].month = last[1]
    const rest = dates.slice(0, -1).reverse()
    for (let i = 0; i < rest.length; i++) {
      const idx = uniq.length - 1 - i
      if (idx <= 0) break
      uniq[idx].year = rest[i][0]
      uniq[idx].month = rest[i][1]
    }
  }
  return uniq
}

async function probe(lat, lon) {
  const url = panoidsUrl(lat, lon, 100)
  const text = await (
    await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://maps.google.com/',
      },
    })
  ).text()
  console.log('status text head', text.slice(0, 120))
  if (text.includes('Search returned no images')) {
    console.log('no images')
    return
  }
  const pans = parsePanoids(text)
  console.log(
    'pans',
    pans.map((p) => ({
      id: p.panoid.slice(0, 14),
      date: p.year ? `${p.year}-${String(p.month).padStart(2, '0')}` : null,
      lat: p.lat,
      lon: p.lon,
    })),
  )
}

await probe(10.927072, 108.065653)
console.log('---')
await probe(10.921752, 108.058067)
console.log('--- mid')
await probe(10.924842, 108.059624)
