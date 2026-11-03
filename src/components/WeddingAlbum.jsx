import { useEffect, useMemo, useRef, useState } from 'react'
import './WeddingAlbum.css'

const AUTO_MS = 4200

/**
 * Album slide 3D — 10 khung, sân khấu giữa + 2 bên nghiêng, film-strip, tự chạy.
 */
export default function WeddingAlbum({ photos }) {
  const slides = useMemo(() => {
    const list = (photos || []).filter((p) => p?.src).slice(0, 10)
    return list
  }, [photos])
  const n = slides.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const touchRef = useRef(null)

  useEffect(() => {
    if (active > n - 1) setActive(0)
  }, [active, n])

  const go = (dir) => {
    if (!n) return
    setActive((i) => (i + dir + n) % n)
    setTick((t) => t + 1)
  }

  const jump = (i) => {
    setActive(i)
    setTick((t) => t + 1)
  }

  useEffect(() => {
    if (paused || n < 2) return undefined
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % n)
      setTick((t) => t + 1)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [paused, n, tick])

  const onTouchStart = (e) => {
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
    setPaused(true)
  }

  const onTouchEnd = (e) => {
    if (!touchRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null
    window.setTimeout(() => setPaused(false), 2400)
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) go(1)
    else go(-1)
  }

  if (!n) return null

  const slotOf = (index) => {
    const diff = ((index - active) % n + n) % n
    if (diff === 0) return 'center'
    if (diff === 1) return 'right'
    if (diff === n - 1) return 'left'
    if (diff === 2) return 'far-right'
    if (diff === n - 2) return 'far-left'
    return 'hidden'
  }

  return (
    <section className="wed-album" aria-label="Ảnh cưới">
      <h2 className="wed-album-title">ẢNH CƯỚI</h2>

      <div
        className="wed-album-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        role="region"
        aria-roledescription="carousel"
        aria-label="Slide ảnh cưới"
      >
        <div className="wed-album-orbit">
          {slides.map((p, i) => {
            const slot = slotOf(i)
            return (
              <button
                key={`slide-${i}`}
                type="button"
                className={`wed-album-card is-${slot}`}
                onClick={() => {
                  if (slot === 'center') {
                    setPaused((v) => !v)
                    return
                  }
                  if (slot === 'left' || slot === 'far-left') go(-1)
                  if (slot === 'right' || slot === 'far-right') go(1)
                }}
                tabIndex={slot === 'center' ? 0 : -1}
                aria-hidden={slot === 'hidden'}
                aria-label="Ảnh cưới"
              >
                <span className="wed-album-frame">
                  <img src={p.src} alt="" draggable={false} />
                </span>
              </button>
            )
          })}
        </div>

        <div className="wed-album-progress" aria-hidden="true">
          <div
            key={tick}
            className={`wed-album-progress-bar${paused ? ' is-paused' : ''}`}
            style={{ animationDuration: `${AUTO_MS}ms` }}
          />
        </div>

        <div className="wed-album-meta">
          <button
            type="button"
            className="wed-album-arrow"
            onClick={() => go(-1)}
            aria-label="Ảnh trước"
          >
            ‹
          </button>
          <p className="wed-album-count">
            <span>{String(active + 1).padStart(2, '0')}</span>
            <em>/</em>
            <span>{String(n).padStart(2, '0')}</span>
          </p>
          <button
            type="button"
            className="wed-album-arrow"
            onClick={() => go(1)}
            aria-label="Ảnh sau"
          >
            ›
          </button>
        </div>
      </div>

      <div className="wed-album-strip" role="tablist" aria-label="Chọn ảnh">
        {slides.map((p, i) => (
          <button
            key={`thumb-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`wed-album-thumb${i === active ? ' is-on' : ''}`}
            onClick={() => jump(i)}
            aria-label="Chọn ảnh"
          >
            <img src={p.src} alt="" draggable={false} />
          </button>
        ))}
      </div>
    </section>
  )
}
