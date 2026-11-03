import { wedding } from '../data/wedding'
import './CalendarNov2026.css'

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

export default function CalendarNov2026() {
  const { calendar } = wedding
  const blanks = Array.from({ length: calendar.startWeekday }, (_, i) => i)
  const days = Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1)

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
          return (
            <div
              key={day}
              className={`cal-day${highlight ? ' is-highlight' : ''}`}
              role="gridcell"
              aria-label={
                highlight ? `Ngày ${day} tháng 11 — ngày hôn lễ` : undefined
              }
            >
              {highlight ? (
                <span className="cal-day-heart">
                  <HeartIcon />
                  <span className="cal-day-num">{day}</span>
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
