import { useRef, useState } from 'react'
import './PhotoCarousel.css'

/**
 * 3 ảnh coverflow: giữa cao hơn, 2 bên thấp hơn.
 * Vuốt ngang để xoay vòng.
 */
export default function PhotoCarousel({ photos }) {
  const [active, setActive] = useState(0)
  const touchRef = useRef(null)
  const n = photos.length

  const go = (dir) => {
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
    if (!touchRef.current) return
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
      className="photo-carousel"
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
                if (slot === 'left') go(-1)
                if (slot === 'right') go(1)
              }}
              aria-label={slot === 'center' ? p.alt : `Xem ${p.alt}`}
              tabIndex={slot === 'center' ? 0 : -1}
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
