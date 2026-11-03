import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { wedding } from '../data/wedding'
import route from '../data/street-route.json'
import './DirectionsTour.css'

const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY || ''
/** Thời gian tối thiểu giữ mỗi điểm trước khi chuyển (ms) */
const MIN_DWELL_MS = route.stepMs ?? 1200

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

function buildDirectionsSrc(origin, destination, key) {
  const params = new URLSearchParams({
    key,
    origin,
    destination,
    mode: 'driving',
    language: 'vi',
    region: 'VN',
  })
  return `https://www.google.com/maps/embed/v1/directions?${params}`
}

function buildOpenMapsUrl(origin, destination) {
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
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
  const { directions, party } = wedding
  const frames = route.frames || []
  const milestones = route.milestones || []

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(0)
  const [slotSrc, setSlotSrc] = useState(['', ''])
  const hasKey = Boolean(EMBED_KEY)
  const frame = frames[step] || frames[0]

  const pendingStep = useRef(null)
  const shownAt = useRef(Date.now())
  const timerRef = useRef(null)
  const playingRef = useRef(false)
  const visibleRef = useRef(0)
  const stepRef = useRef(0)

  playingRef.current = playing
  visibleRef.current = visible
  stepRef.current = step

  const origin = `${route.origin.lat},${route.origin.lng}`
  const destination = `${route.destination.lat},${route.destination.lng}`

  const directionsSrc = useMemo(() => {
    if (!hasKey) return ''
    return buildDirectionsSrc(origin, destination, EMBED_KEY)
  }, [hasKey, origin, destination])

  const openMapsUrl = route.destination.mapsUrl
  const openDirectionsUrl = buildOpenMapsUrl(origin, destination)

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

  const commitSwap = useCallback((slot, nextStep) => {
    pendingStep.current = null
    setVisible(slot)
    setStep(nextStep)
    shownAt.current = Date.now()
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      preloadNextRef.current?.(nextStep)
    }, MIN_DWELL_MS)
  }, [])

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
    [hasKey, frames, commitSwap],
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
    if (!hasKey || frames.length === 0) return
    showFrame(0)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ init khi có key
  }, [hasKey])

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
    const idx = frames.findIndex((f) => f.milestone === label)
    if (idx >= 0) {
      setPlaying(false)
      showFrame(idx)
    }
  }

  const startClip = () => {
    showFrame(0, { playAfter: true })
  }

  return (
    <section className="dir-tour" aria-label="Chỉ đường đến tư gia">
      <h2 className="dir-tour-title">Chỉ đường đến tư gia</h2>
      <p className="dir-tour-addr">{party.address}</p>
      <p className="dir-tour-route">
        {directions.originLabel} → {directions.destinationLabel}
      </p>

      {!hasKey && (
        <>
          <div className="dir-tour-frame dir-tour-frame--map">
            <iframe
              title="Bản đồ tư gia (OpenStreetMap)"
              src={buildOsmEmbed(route.destination.lat, route.destination.lng)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="dir-tour-setup">
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
          <div className="dir-tour-frame">
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

          <div className="dir-tour-progress" aria-hidden="true">
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="dir-tour-controls">
            <button type="button" className="dir-tour-btn" onClick={startClip}>
              {playing ? 'Đang chạy…' : '▶ Xem đường tự động'}
            </button>
            <button
              type="button"
              className="dir-tour-btn is-ghost"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Tạm dừng' : 'Tiếp tục'}
            </button>
          </div>

          <div className="dir-tour-steps">
            {milestones.map((m) => (
              <button
                key={m.label}
                type="button"
                className={`dir-tour-dot${frame.milestone === m.label ? ' is-on' : ''}`}
                onClick={() => jumpToMilestone(m.label)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="dir-tour-frame dir-tour-frame--map">
            <iframe
              title="Bản đồ chỉ đường"
              src={directionsSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </>
      )}

      <div className="dir-tour-links">
        <a
          className="dir-tour-open"
          href={openDirectionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Mở Google Maps chỉ đường
        </a>
        <a
          className="dir-tour-open"
          href={openMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Xem vị trí tư gia
        </a>
      </div>
    </section>
  )
}
