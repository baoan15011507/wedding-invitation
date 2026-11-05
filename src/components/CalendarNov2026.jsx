import { useEffect, useRef, useState } from 'react'
import { useWedding } from '../WeddingContext'
import './CalendarNov2026.css'

const FLIP_MS = 700
const DAY_STAGGER_MS = 28
const AFTER_DAYS_MS = 120
const TODAY_HEART_MS = 380
const WEDDING_HEART_MS = 420

function HeartIcon({ className, outline = false }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={outline ? 'none' : 'currentColor'}
        stroke={outline ? 'currentColor' : 'none'}
        strokeWidth={outline ? 1.6 : 0}
        strokeLinejoin="round"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

export default function CalendarNov2026() {
  const { wedding } = useWedding()
  const { calendar } = wedding
  const blanks = Array.from({ length: calendar.startWeekday }, (_, i) => i)
  const days = Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1)

  const now = new Date()
  const todayDay =
    now.getFullYear() === calendar.year && now.getMonth() + 1 === calendar.month
      ? now.getDate()
      : null

  const rootRef = useRef(null)
  const playedRef = useRef(false)
  const timersRef = useRef([])
  // idle → flip → days → todayHeart → weddingHeart → rays
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

    const daysDuration = calendar.daysInMonth * DAY_STAGGER_MS + 200

    const play = () => {
      if (playedRef.current) return
      playedRef.current = true
      clearTimers()
      setIntro('flip')

      const hasToday =
        todayDay != null && todayDay !== calendar.highlightDay

      let t = FLIP_MS
      timersRef.current.push(
        window.setTimeout(() => setIntro('days'), t),
      )
      t += daysDuration + AFTER_DAYS_MS

      if (hasToday) {
        timersRef.current.push(
          window.setTimeout(() => setIntro('todayHeart'), t),
        )
        t += TODAY_HEART_MS
      }

      timersRef.current.push(
        window.setTimeout(() => setIntro('weddingHeart'), t),
      )
      t += WEDDING_HEART_MS

      timersRef.current.push(
        window.setTimeout(() => setIntro('rays'), t),
      )
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          clearTimers()
          setIntro('idle')
          playedRef.current = false
          return
        }
        play()
      },
      { root: scrollRoot, threshold: 0.2 },
    )

    io.observe(el)
    return () => {
      clearTimers()
      io.disconnect()
    }
  }, [calendar.daysInMonth, calendar.highlightDay, todayDay])

  const phaseRank = {
    idle: 0,
    flip: 1,
    days: 2,
    todayHeart: 3,
    weddingHeart: 4,
    rays: 5,
  }
  const rank = phaseRank[intro] ?? 0
  const showTodayHeart = rank >= 3
  const showWeddingHeart = rank >= 4
  const showRays = rank >= 5

  return (
    <section
      ref={rootRef}
      className={`cal-section is-intro-${intro}`}
      aria-label="Lịch hôn lễ"
    >
      <h2 className="cal-title">{calendar.monthLabel}</h2>

      <div className="cal-flip">
        <div className="cal-grid" role="grid" aria-label={calendar.monthLabel}>
          {calendar.weekdays.map((d) => (
            <div
              key={d}
              className={`cal-weekday${d === 'CN' ? ' is-sunday' : ''}`}
              role="columnheader"
            >
              {d}
            </div>
          ))}
          {blanks.map((b) => (
            <div key={`b-${b}`} className="cal-day is-empty" />
          ))}
          {days.map((day) => {
            const highlight = day === calendar.highlightDay
            const isToday = todayDay != null && day === todayDay
            const useWeddingHeart = highlight && showWeddingHeart
            const useTodayHeart =
              isToday && !highlight && showTodayHeart

            const classes = [
              'cal-day',
              highlight ? 'is-highlight' : '',
              isToday && !highlight ? 'is-today' : '',
              useWeddingHeart ? 'has-wedding-heart' : '',
              useTodayHeart ? 'has-today-heart' : '',
            ]
              .filter(Boolean)
              .join(' ')

            let aria
            if (highlight) aria = `Ngày ${day} tháng 11 — ngày hôn lễ`
            else if (isToday) aria = `Ngày ${day} tháng 11 — hôm nay`

            return (
              <div
                key={day}
                className={classes}
                role="gridcell"
                aria-label={aria}
                style={{ '--cal-day-i': day }}
              >
                {useWeddingHeart ? (
                  <span className="cal-day-heart">
                    {showRays && (
                      <span className="cal-rays" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, i) => (
                          <span
                            key={i}
                            className="cal-ray"
                            style={{ '--ray-i': i }}
                          />
                        ))}
                      </span>
                    )}
                    <HeartIcon />
                    <span className="cal-day-num">{day}</span>
                  </span>
                ) : useTodayHeart ? (
                  <span className="cal-day-heart cal-day-heart--today">
                    <HeartIcon outline />
                    <span className="cal-day-num cal-day-num--today">{day}</span>
                  </span>
                ) : (
                  day
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
