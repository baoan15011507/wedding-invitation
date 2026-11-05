const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function findPano(lat, lng) {
  const urls = [
    `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m7!1e1!3m5!1s!2e0!6s!7i16384!8i8192`,
    `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,0,,0,5`,
    `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`,
  ]

  for (const url of urls) {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      },
    })
    const finalUrl = r.url
    const t = await r.text()
    console.log('url', url.slice(0, 70), '->', finalUrl.slice(0, 120), 'len', t.length)

    const patterns = [
      /!1s([0-9a-zA-Z_-]{10,})!2e0/,
      /pano[=:]([0-9a-zA-Z_-]{10,})/,
      /"panoId"\s*:\s*"([^"]+)"/,
      /"pano_id"\s*:\s*"([^"]+)"/,
      /\[\[\"([0-9a-zA-Z_-]{22,})\"/,
      /photometa[^"]*"([0-9a-zA-Z_-]{20,})"/,
    ]
    for (const p of patterns) {
      const m = t.match(p)
      if (m) console.log('  match', p, m[1])
    }
    const mUrl = finalUrl.match(/!1s([0-9a-zA-Z_-]{10,})!/)
    if (mUrl) console.log('  finalUrl pano', mUrl[1])
  }
}

await findPano(10.927072, 108.065653)
await sleep(300)
await findPano(10.921752, 108.058067)
