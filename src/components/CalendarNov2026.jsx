import { wedding } from '../data/wedding'
import './CalendarNov2026.css'

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
  const { calendar } = wedding
  const blanks = Array.from({ length: calendar.startWeekday }, (_, i) => i)
  const days = Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1)

  const now = new Date()
  const todayDay =
    now.getFullYear() === calendar.year && now.getMonth() + 1 === calendar.month
      ? now.getDate()
      : null

  return (
    <section className="cal-section" aria-label="Lịch hôn lễ">
      <h2 className="cal-title">{calendar.monthLabel}</h2>

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
          const classes = [
            'cal-day',
            highlight ? 'is-highlight' : '',
            isToday && !highlight ? 'is-today' : '',
          ]
            .filter(Boolean)
            .join(' ')

          let aria
          if (highlight) aria = `Ngày ${day} tháng 11 — ngày hôn lễ`
          else if (isToday) aria = `Ngày ${day} tháng 11 — hôm nay`

          return (
            <div key={day} className={classes} role="gridcell" aria-label={aria}>
              {highlight ? (
                <span className="cal-day-heart">
                  <HeartIcon />
                  <span className="cal-day-num">{day}</span>
                </span>
              ) : isToday ? (
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
    </section>
  )
}
