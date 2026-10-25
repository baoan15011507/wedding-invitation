import { wedding } from '../data/wedding'

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21s-6.7-4.35-9.33-7.4C.6 11.2.7 8.1 2.8 6.4c1.8-1.45 4.4-1.2 5.9.5L12 10.2l3.3-3.3c1.5-1.7 4.1-1.95 5.9-.5 2.1 1.7 2.2 4.8.13 7.2C18.7 16.65 12 21 12 21z"
      />
    </svg>
  )
}

export default function CalendarNov2026() {
  const { calendar, groom, bride } = wedding
  const blanks = Array.from({ length: calendar.startWeekday }, (_, i) => i)
  const days = Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1)

  return (
    <div className="cal-panel">
      <div className="cal-names">
        <span className="cal-name">{groom.shortName}</span>
        <HeartIcon className="cal-heart" />
        <span className="cal-name">{bride.shortName}</span>
      </div>

      <p className="cal-month">{calendar.monthLabel}</p>

      <div className="cal-grid" role="grid" aria-label={calendar.monthLabel}>
        {calendar.weekdays.map((d) => (
          <div key={d} className="cal-weekday" role="columnheader">
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
            >
              {highlight ? (
                <span className="cal-day-heart">
                  <HeartIcon />
                  <span>{day}</span>
                </span>
              ) : (
                day
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
