import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './WeddingAlbum.css'

const AUTO_MS = 4200
const TITLE_MS = 650
const SLIDES_FLIP_MS = 980

/**
 * Album slide 3D — vuốt ngang; chạm ảnh giữa → xem full + nút đóng.
 * Intro: tiêu đề lật từ dưới → từng ảnh lật lần lượt.
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
  const [intro, setIntro] = useState('idle') // idle | title | slides | done
  const touchRef = useRef(null)
  const rootRef = useRef(null)
  const playedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    if (active > n - 1) setActive(0)
  }, [active, n])

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }

    const el = rootRef.current
    if (!el || !n) return undefined

    const scrollRoot =
      el.closest('.invitation-scroll') ||
      el.closest('.phone-shell') ||
      null

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          clearTimers()
          setIntro('idle')
          playedRef.current = false
          return
        }
        if (playedRef.current) return
        playedRef.current = true
        clearTimers()
        setIntro('title')
        timersRef.current.push(
          window.setTimeout(() => setIntro('slides'), TITLE_MS),
          window.setTimeout(
            () => setIntro('done'),
            TITLE_MS + SLIDES_FLIP_MS,
          ),
        )
      },
      { root: scrollRoot, threshold: 0.18 },
    )

    io.observe(el)
    return () => {
      clearTimers()
      io.disconnect()
    }
  }, [n])

  const go = (dir) => {
    if (!n || intro !== 'done') return
    setActive((i) => (i + dir + n) % n)
  }

  const openLightbox = () => {
    if (intro !== 'done') return
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
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

  useEffect(() => {
    if (intro !== 'done' || paused || lightbox || n < 2) return undefined
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % n)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [paused, lightbox, n, active, intro])

  const onTouchStart = (e) => {
    if (lightbox || intro !== 'done') return
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
    setPaused(true)
  }

  const onTouchEnd = (e) => {
    if (lightbox || intro !== 'done' || !touchRef.current) return
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
    <section
      ref={rootRef}
      className={`wed-album is-intro-${intro}`}
      aria-label="Ảnh cưới"
    >
      <h2 className="wed-album-title">ẢNH CƯỚI</h2>

      <div
        className="wed-album-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => {
          if (intro === 'done') setPaused(true)
        }}
        onMouseLeave={() => {
          if (!lightbox && intro === 'done') setPaused(false)
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
                style={{ '--wed-i': i }}
                onClick={() => {
                  if (intro !== 'done') return
                  if (slot === 'center') {
                    openLightbox()
                    return
                  }
                  if (slot === 'left' || slot === 'far-left') go(-1)
                  if (slot === 'right' || slot === 'far-right') go(1)
                }}
                tabIndex={slot === 'center' && intro === 'done' ? 0 : -1}
                aria-hidden={slot === 'hidden'}
                aria-label={slot === 'center' ? 'Xem ảnh lớn' : 'Ảnh cưới'}
              >
                <span className="wed-album-flip">
                  <span className="wed-album-frame">
                    <img src={p.src} alt="" draggable={false} />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {lightbox &&
        current &&
        createPortal(
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
          </div>,
          document.body,
        )}
    </section>
  )
}
