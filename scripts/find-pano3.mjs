async function singleImageSearch(lat, lng) {
  const pb =
    `!1m7!1m3!1e2!2b1!3e2!1m3!1e3!2b1!3e2!1m3!1e10!2b1!3e2!2m3!1e0!2svi!3sVN!3m5!2s${lat}%2C${lng}!3s0!5e0!6shttps:%2F%2Fmaps.googleapis.com%2Fmaps%2Fapi%2Fjs%2FStaticMapService.GetMapImage!7i1!8i1`
  const url = `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=${encodeURIComponent(pb)}&callback=_cb`
  const t = await (
    await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.google.com/',
      },
    })
  ).text()
  console.log('raw head', t.slice(0, 300))
  const jsonText = t.replace(/^\/\*\*\/_cb\(/, '').replace(/\);?\s*$/, '')
  try {
    const j = JSON.parse(jsonText)
    // Deep-ish scan for pano id and dates
    const s = JSON.stringify(j)
    console.log('json len', s.length)
    const pano = s.match(/\"([A-Za-z0-9_-]{22,})\"/)
    console.log('first long str', pano?.[1])
    // print structure keys
    console.log(JSON.stringify(j).slice(0, 800))
  } catch (e) {
    console.log('parse fail', e.message)
  }
}

await singleImageSearch(10.927072, 108.065653)
console.log('---')
await singleImageSearch(10.921752, 108.058067)
