import { useEffect, useRef, useState } from 'react'
import photo from '../assets/anh_cuoi_0nen.png'
import './ThankYouArch.css'

const FRAME_MS = 780
const PHOTO_MS = 620
const HEARTS_MS = 520
const LABEL_MS = 480

function TwinHearts() {
  return (
    <div className="ty-hearts" aria-hidden="true">
      <svg className="ty-hearts-svg" viewBox="0 0 78 52" fill="none">
        <defs>
          <path
            id="ty-heart-l"
            d="M27 49S5.5 33.5 5.5 19.8C5.5 12 11.2 7.2 18.2 7.2c4.8 0 8.3 2.5 10.8 6.5C31.5 9.7 35 7.2 39.8 7.2 46.8 7.2 52.5 12 52.5 19.8 52.5 33.5 27 49 27 49Z"
          />
          <path
            id="ty-heart-r"
            d="M51 49S29.5 33.5 29.5 19.8C29.5 12 35.2 7.2 42.2 7.2c4.8 0 8.3 2.5 10.8 6.5C55.5 9.7 59 7.2 63.8 7.2 70.8 7.2 76.5 12 76.5 19.8 76.5 33.5 51 49 51 49Z"
          />
          <linearGradient id="ty-gold-shine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="78" y2="0">
            <stop offset="0%" stopColor="#b8962e" />
            <stop offset="40%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#fff6c8" />
            <stop offset="60%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#b8962e" />
            <animate
              attributeName="x1"
              values="-78;78"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0;156"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <use xlinkHref="#ty-heart-l" href="#ty-heart-l" className="ty-heart-shape" />
        <use xlinkHref="#ty-heart-r" href="#ty-heart-r" className="ty-heart-shape" />
        <use xlinkHref="#ty-heart-l" href="#ty-heart-l" className="ty-heart-fill" />
        <use xlinkHref="#ty-heart-r" href="#ty-heart-r" className="ty-heart-fill" />
      </svg>
      <span className="ty-hearts-label">Wedding</span>
    </div>
  )
}

/**
 * Intro: khung lật → ảnh → 2 tim → chữ Wedding; viền vàng tim có ánh sáng chạy.
 */
export default function ThankYouArch() {
  const rootRef = useRef(null)
  const playedRef = useRef(false)
  const timersRef = useRef([])
  // idle | frame | photo | hearts | label | done
  const [intro, setIntro] = useState('idle')

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
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
          clearTimers()
          setIntro('idle')
          playedRef.current = false
          return
        }
        if (playedRef.current) return
        playedRef.current = true
        clearTimers()
        setIntro('frame')
        let t = FRAME_MS
        timersRef.current.push(
          window.setTimeout(() => setIntro('photo'), t),
        )
        t += PHOTO_MS
        timersRef.current.push(
          window.setTimeout(() => setIntro('hearts'), t),
        )
        t += HEARTS_MS
        timersRef.current.push(
          window.setTimeout(() => setIntro('label'), t),
        )
        t += LABEL_MS
        timersRef.current.push(
          window.setTimeout(() => setIntro('done'), t),
        )
      },
      { root: scrollRoot, threshold: 0.2 },
    )

    io.observe(el)
    return () => {
      clearTimers()
      io.disconnect()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      className={`ty-arch is-intro-${intro}`}
      aria-label="Lời cảm ơn"
    >
      <div className="ty-arch-wrap">
        <TwinHearts />

        <div className="ty-arch-frame">
          <div className="ty-arch-clip">
            <span className="ty-arch-hy hy-blink" aria-hidden="true">
              囍
            </span>
            <img
              className="ty-arch-photo"
              src={photo}
              alt=""
              loading="lazy"
              draggable={false}
            />
            <div className="ty-arch-copy">
              <p className="ty-arch-thanks">Thank You!</p>
              <p className="ty-arch-honor">Rất hân hạnh được đón tiếp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
