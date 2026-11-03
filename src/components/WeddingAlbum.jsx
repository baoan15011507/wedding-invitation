import { useEffect, useMemo, useRef, useState } from 'react'
import './WeddingAlbum.css'

const AUTO_MS = 4200

/**
 * Album slide 3D — vuốt ngang; chạm ảnh giữa → xem full + nút đóng.
 */
export default function WeddingAlbum({ photos }) {
  const slides = useMemo(() => {
    const list = (photos || []).filter((p) => p?.src).slice(0, 10)
    return list
  }, [photos])
  const n = slides.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const touchRef = useRef(null)

  useEffect(() => {
    if (active > n - 1) setActive(0)
  }, [active, n])

  const go = (dir) => {
    if (!n) return
    setActive((i) => (i + dir + n) % n)
  }

  const openLightbox = () => {
    setPaused(true)
    setLightbox(true)
  }

  const closeLightbox = () => {
    setLightbox(false)
    window.setTimeout(() => setPaused(false), 800)
  }

  useEffect(() => {
    if (!lightbox) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  useEffect(() => {
    if (paused || lightbox || n < 2) return undefined
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % n)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [paused, lightbox, n, active])

  const onTouchStart = (e) => {
    if (lightbox) return
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
    setPaused(true)
  }

  const onTouchEnd = (e) => {
    if (lightbox || !touchRef.current) return
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

  const current = slides[active]

  return (
    <section className="wed-album" aria-label="Ảnh cưới">
      <h2 className="wed-album-title">ẢNH CƯỚI</h2>

      <div
        className="wed-album-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (!lightbox) setPaused(false)
        }}
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
                    openLightbox()
                    return
                  }
                  if (slot === 'left' || slot === 'far-left') go(-1)
                  if (slot === 'right' || slot === 'far-right') go(1)
                }}
                tabIndex={slot === 'center' ? 0 : -1}
                aria-hidden={slot === 'hidden'}
                aria-label={slot === 'center' ? 'Xem ảnh lớn' : 'Ảnh cưới'}
              >
                <span className="wed-album-frame">
                  <img src={p.src} alt="" draggable={false} />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {lightbox && current && (
        <div
          className="wed-album-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh đầy đủ"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="wed-album-lightbox-close"
            onClick={closeLightbox}
            aria-label="Đóng"
          >
            ×
          </button>
          <img
            className="wed-album-lightbox-img"
            src={current.src}
            alt=""
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
