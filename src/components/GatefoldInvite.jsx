import { useRef } from 'react'
import tulips from '../assets/tulips.svg'
import { wedding } from '../data/wedding'
import CalendarNov2026 from './CalendarNov2026'

export default function GatefoldInvite({
  opened,
  onOpen,
  panel,
  onPanelChange,
  onGoFormal,
}) {
  const touchStart = useRef(null)

  const handleTouchStart = (e) => {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (!opened) {
      if (Math.abs(dx) > 40 || Math.abs(dy) > 40 || Math.hypot(dx, dy) < 12) {
        onOpen()
      }
      return
    }

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && panel === 0) onPanelChange(1)
      if (dx > 0 && panel === 1) onPanelChange(0)
      return
    }

    if (dy < -60 && Math.abs(dy) > Math.abs(dx)) {
      onGoFormal()
    }
  }

  return (
    <section
      className={`gatefold${opened ? ' is-open' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Thiệp mời gấp đôi"
    >
      {!opened ? (
        <button type="button" className="gatefold-cover" onClick={onOpen}>
          <div className="gatefold-cover-inner">
            <p className="gatefold-cover-names">
              {wedding.groom.shortName} &amp; {wedding.bride.shortName}
            </p>
            <p className="gatefold-cover-hint">{wedding.copy.openHint}</p>
          </div>
        </button>
      ) : null}

      <div className={`gatefold-stage panel-${panel}`}>
        <article className="gate-leaf gate-left">
          <div className="gate-leaf-face paper-card">
            <CalendarNov2026 />
            <img className="tulip-mark tulip-bl" src={tulips} alt="" />
          </div>
        </article>

        <article className="gate-leaf gate-right">
          <div className="gate-leaf-face paper-card invite-copy">
            <p className="invite-lead">{wedding.copy.inviteLead}</p>
            <p className="invite-body">
              {wedding.copy.inviteBody}{' '}
              <strong>{wedding.party.venueType}</strong>
            </p>
            <p className="invite-address">{wedding.party.address}</p>
            <p className="invite-when">
              VÀO LÚC{' '}
              <strong>
                {wedding.party.time} - {wedding.party.weekday} NGÀY{' '}
                {wedding.party.day} THÁNG {wedding.party.month} NĂM{' '}
                {wedding.party.year}
              </strong>
            </p>
            <p className="invite-lunar">({wedding.party.lunar})</p>
            <p className="invite-closing">{wedding.copy.closing}</p>
            <img className="tulip-mark tulip-br" src={tulips} alt="" />
          </div>
        </article>
      </div>

      {opened && (
        <div className="gatefold-nav">
          <div className="gatefold-dots" aria-hidden="true">
            <span className={panel === 0 ? 'is-active' : ''} />
            <span className={panel === 1 ? 'is-active' : ''} />
          </div>
          <div className="gatefold-actions">
            {panel === 0 ? (
              <button type="button" onClick={() => onPanelChange(1)}>
                Lời mời →
              </button>
            ) : (
              <button type="button" onClick={() => onPanelChange(0)}>
                ← Lịch
              </button>
            )}
            <button type="button" className="is-primary" onClick={onGoFormal}>
              {wedding.copy.nextPage} ↓
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
