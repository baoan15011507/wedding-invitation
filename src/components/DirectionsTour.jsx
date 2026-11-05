import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import routeGroom from '../data/street-route.json'
import routeBride from '../data/street-route-co-dau.json'
import { useWedding } from '../WeddingContext'
import './DirectionsTour.css'

const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY || ''
const ROUTES = {
  groom: routeGroom,
  bride: routeBride,
}

const REVEAL_VARIANTS = ['left', 'right', 'up', 'down', 'fade', 'scale']

function pickVariant() {
  return REVEAL_VARIANTS[Math.floor(Math.random() * REVEAL_VARIANTS.length)]
}

function pickDelay(base = 0) {
  return base + Math.floor(Math.random() * 180)
}

function buildStreetViewSrc(point, key) {
  const params = new URLSearchParams({
    key,
    heading: String(Math.round(point.heading ?? 0)),
    pitch: String(Math.round(point.pitch ?? 5)),
    fov: String(Math.round(point.fov ?? 75)),
  })
  // pano = đúng panorama (vd. tháng 7/2026); không có thì fallback location
  if (point.pano) {
    params.set('pano', point.pano)
  } else {
    params.set('location', `${point.lat},${point.lng}`)
  }
  return `https://www.google.com/maps/embed/v1/streetview?${params}`
}

/** Embed chỉ điểm đến (không gắn tuyến từ đầu đường) */
function buildPlaceSrc(lat, lng, key) {
  const params = new URLSearchParams({
    key,
    q: `${lat},${lng}`,
    zoom: '16',
    language: 'vi',
    region: 'VN',
  })
  return `https://www.google.com/maps/embed/v1/place?${params}`
}

/** Chỉ đường từ vị trí hiện tại của khách → điểm đến */
function buildDirectionsFromHereUrl(lat, lng) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${lat},${lng}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params}`
}

function buildOsmEmbed(lat, lng) {
  const d = 0.012
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}

export default function DirectionsTour() {
  const { wedding } = useWedding()
  const { directions, party, streetRoute } = wedding
  const route = ROUTES[streetRoute] || routeGroom
  const frames = route.frames || []
  const milestones = route.milestones || []
  const MIN_DWELL_MS = route.stepMs ?? 1200

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(0)
  const [slotSrc, setSlotSrc] = useState(['', ''])
  const [shown, setShown] = useState(false)
  const [fx, setFx] = useState(() => ({
    title: 'up',
    addr: 'fade',
    route: 'fade',
    sv: 'scale',
    progress: 'fade',
    play: 'left',
    pause: 'right',
    dots: milestones.map(() => 'up'),
    map: 'up',
    links: ['fade', 'fade'],
    delays: {},
  }))
  const hasKey = Boolean(EMBED_KEY)
  const frame = frames[step] || frames[0]
  const rootRef = useRef(null)

  const pendingStep = useRef(null)
  const shownAt = useRef(Date.now())
  const timerRef = useRef(null)
  const playingRef = useRef(false)
  const visibleRef = useRef(0)
  const stepRef = useRef(0)

  const reshuffleFx = useCallback(() => {
    setFx({
      title: pickVariant(),
      addr: pickVariant(),
      route: pickVariant(),
      sv: pickVariant(),
      progress: pickVariant(),
      play: pickVariant(),
      pause: pickVariant(),
      dots: milestones.map(() => pickVariant()),
      map: pickVariant(),
      links: [pickVariant(), pickVariant()],
      delays: {
        title: pickDelay(0),
        addr: pickDelay(60),
        route: pickDelay(100),
        sv: pickDelay(140),
        progress: pickDelay(220),
        play: pickDelay(260),
        pause: pickDelay(300),
        dots: milestones.map((_, i) => pickDelay(340 + i * 70)),
        map: pickDelay(420 + milestones.length * 40),
        links: [pickDelay(520), pickDelay(580)],
      },
    })
  }, [milestones])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined

    const scrollRoot =
      el.closest('.invitation-scroll') ||
      el.closest('.phone-shell') ||
      null

    let enterRaf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (enterRaf) {
          cancelAnimationFrame(enterRaf)
          enterRaf = 0
        }
        if (!entry.isIntersecting) {
          setShown(false)
          return
        }
        // Đổi hướng ngẫu nhiên trước, rồi mới hiện — để transition chạy đúng
        setShown(false)
        reshuffleFx()
        enterRaf = requestAnimationFrame(() => {
          enterRaf = requestAnimationFrame(() => {
            setShown(true)
            enterRaf = 0
          })
        })
      },
      { root: scrollRoot, threshold: 0.12 },
    )

    io.observe(el)
    return () => {
      if (enterRaf) cancelAnimationFrame(enterRaf)
      io.disconnect()
    }
  }, [reshuffleFx])

  playingRef.current = playing
  visibleRef.current = visible
  stepRef.current = step

  const destLat = route.destination.lat
  const destLng = route.destination.lng

  const placeSrc = useMemo(() => {
    if (!hasKey) return ''
    return buildPlaceSrc(destLat, destLng, EMBED_KEY)
  }, [hasKey, destLat, destLng])

  const openMapsUrl = route.destination.mapsUrl
  const openDirectionsUrl = buildDirectionsFromHereUrl(destLat, destLng)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const showFrame = useCallback(
    (index, { playAfter = false } = {}) => {
      if (!hasKey || !frames[index]) return
      clearTimer()
      pendingStep.current = null
      const src = buildStreetViewSrc(frames[index], EMBED_KEY)
      setStep(index)
      setVisible(0)
      setSlotSrc([src, ''])
      shownAt.current = Date.now()
      if (playAfter) setPlaying(true)
    },
    [hasKey, frames],
  )

  const commitSwap = useCallback(
    (slot, nextStep) => {
      pendingStep.current = null
      setVisible(slot)
      setStep(nextStep)
      shownAt.current = Date.now()
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        preloadNextRef.current?.(nextStep)
      }, MIN_DWELL_MS)
    },
    [MIN_DWELL_MS],
  )

  const preloadNext = useCallback(
    (fromStep) => {
      if (!playingRef.current || !hasKey) return
      if (fromStep >= frames.length - 1) {
        setPlaying(false)
        return
      }
      const next = fromStep + 1
      const nextSrc = buildStreetViewSrc(frames[next], EMBED_KEY)
      const hidden = visibleRef.current === 0 ? 1 : 0
      pendingStep.current = next
      setSlotSrc((prev) => {
        const nextSlots = [...prev]
        nextSlots[hidden] = nextSrc
        return nextSlots
      })
      // Nếu iframe không kịp onLoad, vẫn chuyển sau tối đa ~3.5s
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        if (!playingRef.current || pendingStep.current !== next) return
        commitSwap(hidden, next)
      }, Math.max(MIN_DWELL_MS, 3500))
    },
    [hasKey, frames, commitSwap, MIN_DWELL_MS],
  )

  const preloadNextRef = useRef(preloadNext)
  preloadNextRef.current = preloadNext

  const onSlotLoad = (slot) => {
    const isVisible = slot === visibleRef.current
    const pending = pendingStep.current

    if (isVisible && pending == null) {
      // Khung đang xem vừa load xong — giữ tối thiểu MIN_DWELL rồi preload điểm sau
      shownAt.current = Date.now()
      if (!playingRef.current) return
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        preloadNext(stepRef.current)
      }, MIN_DWELL_MS)
      return
    }

    // Buffer ẩn vừa load xong điểm tiếp theo
    if (!isVisible && pending != null) {
      const elapsed = Date.now() - shownAt.current
      const wait = Math.max(0, MIN_DWELL_MS - elapsed)
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        if (!playingRef.current || pendingStep.current == null) return
        commitSwap(slot, pendingStep.current)
      }, wait)
    }
  }

  useEffect(() => {
    setStep(0)
    setPlaying(false)
    setVisible(0)
    setSlotSrc(['', ''])
    if (!hasKey || frames.length === 0) return undefined
    showFrame(0)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps -- đổi tuyến theo variant
  }, [hasKey, streetRoute])

  useEffect(() => {
    if (!playing || !hasKey) {
      clearTimer()
      pendingStep.current = null
      return undefined
    }
    // Bắt đầu / tiếp tục: preload điểm kế từ bước hiện tại
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      preloadNext(stepRef.current)
    }, MIN_DWELL_MS)
    return clearTimer
  }, [playing, hasKey, preloadNext])

  const progress = frames.length
    ? Math.round((step / Math.max(1, frames.length - 1)) * 100)
    : 0

  const jumpToMilestone = (label) => {
    // Ưu tiên đúng pano của mốc (điểm cuối = Tiệc), tránh dính khung cùng nhãn ở giữa tuyến
    const meta = milestones.find((m) => m.label === label)
    let idx = -1
    if (meta?.pano) {
      idx = frames.findIndex((f) => f.pano === meta.pano)
    }
    if (idx < 0) {
      for (let i = frames.length - 1; i >= 0; i -= 1) {
        if (frames[i].milestone === label) {
          idx = i
          break
        }
      }
    }
    if (idx >= 0) {
      setPlaying(false)
      showFrame(idx)
    }
  }

  const startClip = () => {
    showFrame(0, { playAfter: true })
  }

  const fxClass = (key) =>
    `dir-fx from-${fx[key] || 'fade'}${shown ? ' is-shown' : ''}`

  const fxStyle = (key) => ({
    transitionDelay: `${fx.delays?.[key] ?? 0}ms`,
  })

  return (
    <section
      ref={rootRef}
      className={`dir-tour${shown ? ' is-shown' : ''}`}
      aria-label={directions.title || 'Chỉ đường'}
    >
      <h2 className={`dir-tour-title ${fxClass('title')}`} style={fxStyle('title')}>
        {directions.title || 'Chỉ đường đến tư gia'}
      </h2>
      <p className={`dir-tour-addr ${fxClass('addr')}`} style={fxStyle('addr')}>
        {party.address}
      </p>
      <p className={`dir-tour-route ${fxClass('route')}`} style={fxStyle('route')}>
        {directions.destinationLabel}
      </p>

      {!hasKey && (
        <>
          <div
            className={`dir-tour-frame dir-tour-frame--map ${fxClass('map')}`}
            style={fxStyle('map')}
          >
            <iframe
              title={directions.viewPlaceLabel || 'Bản đồ địa điểm'}
              src={buildOsmEmbed(route.destination.lat, route.destination.lng)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className={`dir-tour-setup ${fxClass('route')}`} style={fxStyle('route')}>
            <p>
              Đã có {frames.length} điểm dọc đường trong{' '}
              <code>street-route.json</code>. Thêm Embed key vào{' '}
              <code>.env</code> để tự chạy Street View qua từng điểm (không cần
              Maps JavaScript API).
            </p>
          </div>
        </>
      )}

      {hasKey && frame && (
        <>
          <div
            className={`dir-tour-frame ${fxClass('sv')}`}
            style={fxStyle('sv')}
          >
            {[0, 1].map((slot) =>
              slotSrc[slot] ? (
                <iframe
                  key={`sv-${slot}`}
                  className={`dir-tour-sv${visible === slot ? ' is-show' : ''}`}
                  title={
                    visible === slot
                      ? `Street View — ${frame.milestone}`
                      : 'Street View đang tải'
                  }
                  src={slotSrc[slot]}
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => onSlotLoad(slot)}
                />
              ) : null,
            )}
            <div className="dir-tour-overlay">
              <span>{frame.milestone}</span>
              <span>
                {step + 1}/{frames.length}
              </span>
            </div>
          </div>

          <div
            className={`dir-tour-progress ${fxClass('progress')}`}
            style={fxStyle('progress')}
            aria-hidden="true"
          >
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="dir-tour-controls">
            <button
              type="button"
              className={`dir-tour-btn ${fxClass('play')}`}
              style={fxStyle('play')}
              onClick={startClip}
            >
              {playing ? 'Đang chạy…' : '▶ Xem đường tự động'}
            </button>
            <button
              type="button"
              className={`dir-tour-btn is-ghost ${fxClass('pause')}`}
              style={fxStyle('pause')}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Tạm dừng' : 'Tiếp tục'}
            </button>
          </div>

          <div className="dir-tour-steps">
            {milestones.map((m, i) => (
              <button
                key={m.label}
                type="button"
                className={`dir-tour-dot${frame.milestone === m.label ? ' is-on' : ''} dir-fx from-${fx.dots[i] || 'up'}${shown ? ' is-shown' : ''}`}
                style={{ transitionDelay: `${fx.delays?.dots?.[i] ?? 340 + i * 70}ms` }}
                onClick={() => jumpToMilestone(m.label)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div
            className={`dir-tour-frame dir-tour-frame--map ${fxClass('map')}`}
            style={fxStyle('map')}
          >
            <iframe
              title={directions.viewPlaceLabel || 'Vị trí địa điểm'}
              src={placeSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </>
      )}

      <div className="dir-tour-links">
        <a
          className={`dir-tour-open dir-fx from-${fx.links[0] || 'fade'}${shown ? ' is-shown' : ''}`}
          style={{ transitionDelay: `${fx.delays?.links?.[0] ?? 520}ms` }}
          href={openDirectionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Mở Google Maps chỉ đường
        </a>
        <a
          className={`dir-tour-open dir-fx from-${fx.links[1] || 'fade'}${shown ? ' is-shown' : ''}`}
          style={{ transitionDelay: `${fx.delays?.links?.[1] ?? 580}ms` }}
          href={openMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          {directions.viewPlaceLabel || 'Xem vị trí tư gia'}
        </a>
      </div>
    </section>
  )
}
