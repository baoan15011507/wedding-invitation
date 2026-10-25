import { useRef } from 'react'
import monogram from '../assets/monogram.svg'
import tulips from '../assets/tulips.svg'
import { wedding } from '../data/wedding'

function FamilyBlock({ family }) {
  return (
    <div className="family-block">
      <p className="family-label">{family.label}</p>
      <p className="family-parent">
        Ông: <strong>{family.father}</strong>
      </p>
      <p className="family-parent">
        Bà: <strong>{family.mother}</strong>
      </p>
      <p className="family-address">{family.address}</p>
    </div>
  )
}

export default function FormalCard({ onBack }) {
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
    if (dy > 60 && Math.abs(dy) > Math.abs(dx)) onBack()
  }

  const { ceremony, copy, groom, bride, groomFamily, brideFamily } = wedding

  return (
    <section
      className="formal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Thiệp báo tin lễ tân hôn"
    >
      <article className="formal-card">
        <p className="formal-std">{copy.saveTheDate}</p>
        <img className="formal-mono" src={monogram} alt="Monogram A · T" />

        <div className="formal-families">
          <FamilyBlock family={groomFamily} />
          <div className="formal-divider" aria-hidden="true" />
          <FamilyBlock family={brideFamily} />
        </div>

        <p className="formal-announce">{copy.announce}</p>

        <div className="formal-couple">
          <div className="formal-person">
            <p className="formal-fullname">{groom.fullName}</p>
            <p className="formal-role">({groom.role})</p>
          </div>
          <span className="formal-amp" aria-hidden="true">
            &amp;
          </span>
          <div className="formal-person">
            <p className="formal-fullname">{bride.fullName}</p>
            <p className="formal-role">({bride.role})</p>
          </div>
        </div>

        <div className="formal-date-block">
          <p className="formal-ceremony-lead">
            {copy.ceremonyLead} <strong>{ceremony.time}</strong>
          </p>
          <p className="formal-big-date">
            {ceremony.weekday}
            <br />
            {ceremony.day} THÁNG {ceremony.month} NĂM {ceremony.year}
          </p>
          <p className="formal-lunar">({ceremony.lunar})</p>
        </div>

        <img className="tulip-mark tulip-formal" src={tulips} alt="" />
      </article>

      <div className="formal-nav">
        <button type="button" onClick={onBack}>
          ↑ {copy.prevPage}
        </button>
      </div>
    </section>
  )
}
