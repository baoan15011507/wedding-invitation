import { useEffect, useRef, useState } from 'react'
import './PhotoCarousel.css'

const SIDE_MS = 650
const CENTER_DELAY = 680

/**
 * 3 ảnh coverflow.
 * Lần đầu vào khung: 2 bên trượt vào cùng lúc → ảnh giữa lật từ đáy lên.
 * Sau đó vuốt ngang để xoay vòng.
 */
export default function PhotoCarousel({ photos, enabled = true }) {
  const [active, setActive] = useState(0)
  const [intro, setIntro] = useState('idle') // idle | sides | done
  const rootRef = useRef(null)
  const touchRef = useRef(null)
  const playedRef = useRef(false)
  const n = photos.length

  useEffect(() => {
    if (!enabled) {
      setIntro('idle')
      playedRef.current = false
      return undefined
    }

    const el = rootRef.current
    if (!el) return undefined

    const scrollRoot =
      el.closest('.invitation-scroll') ||
      el.closest('.phone-shell') ||
      null

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Ra khỏi khung → lần sau vào chạy lại intro
          setIntro('idle')
          playedRef.current = false
          return
        }
        if (playedRef.current) return
        playedRef.current = true
        setIntro('sides')
        window.setTimeout(() => setIntro('done'), CENTER_DELAY)
      },
      { root: scrollRoot, threshold: 0.25 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  const go = (dir) => {
    if (intro !== 'done') return
    setActive((i) => (i + dir + n) % n)
  }

  const slotOf = (index) => {
    const diff = ((index - active) % n + n) % n
    if (diff === 0) return 'center'
    if (diff === 1) return 'right'
    return 'left'
  }

  const onTouchStart = (e) => {
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e) => {
    if (!touchRef.current || intro !== 'done') return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) go(1)
    else go(-1)
  }

  return (
    <div
      ref={rootRef}
      className={`photo-carousel is-intro-${intro}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Album ảnh cưới"
    >
      <div className="photo-carousel-stage">
        {photos.map((p, i) => {
          const slot = slotOf(i)
          return (
            <button
              key={`${p.src}-${i}`}
              type="button"
              className={`photo-carousel-card is-${slot}`}
              onClick={() => {
                if (intro !== 'done') return
                if (slot === 'left') go(-1)
                if (slot === 'right') go(1)
              }}
              aria-label={slot === 'center' ? p.alt : `Xem ${p.alt}`}
              tabIndex={slot === 'center' ? 0 : -1}
              style={{
                transitionDuration:
                  slot === 'center' ? '0.7s' : `${SIDE_MS}ms`,
              }}
            >
              <img src={p.src} alt={p.alt} draggable={false} />
            </button>
          )
        })}
      </div>
      <div className="photo-carousel-dots" aria-hidden="true">
        {photos.map((_, i) => (
          <span key={i} className={i === active ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}
