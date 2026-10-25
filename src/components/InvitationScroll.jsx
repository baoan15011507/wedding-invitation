import photo1 from '../assets/TR__4771.JPG'
import photo2 from '../assets/TR__4785.JPG'
import { wedding } from '../data/wedding'
import HySeal from './HySeal'
import Reveal from './Reveal'
import './InvitationScroll.css'

function FamilyCol({ family }) {
  return (
    <div className="inv-family">
      <p className="inv-family-label">{family.label}</p>
      <p className="inv-family-line">
        Ông: <strong>{family.father}</strong>
      </p>
      <p className="inv-family-line">
        Bà: <strong>{family.mother}</strong>
      </p>
      <p className="inv-family-addr">{family.address}</p>
    </div>
  )
}

export default function InvitationScroll({ active }) {
  const { groom, bride, groomFamily, brideFamily, party } = wedding

  return (
    <div className={`invitation-scroll${active ? ' is-active' : ''}`}>
      <section className="inv-block inv-hero" aria-label="Thiệp mời">
        <Reveal enabled={active} className="inv-kicker" delay={80}>
          thiệp mời
        </Reveal>

        <Reveal enabled={active} className="inv-names" delay={200}>
          <span>{groom.shortName}</span>
          <span className="inv-names-amp">&amp;</span>
          <span>{bride.shortName}</span>
        </Reveal>

        <Reveal enabled={active} delay={320}>
          <HySeal />
        </Reveal>

        <Reveal enabled={active} className="inv-when" delay={420}>
          <p className="inv-weekday">Chủ nhật — 11h00</p>
          <p className="inv-date">
            {String(party.day).padStart(2, '0')}-{String(party.month).padStart(2, '0')}-
            {party.year}
          </p>
        </Reveal>

        <Reveal enabled={active} className="inv-photo-wrap" delay={200}>
          <img
            className="inv-photo"
            src={photo1}
            alt={`${groom.shortName} và ${bride.shortName}`}
            loading="eager"
          />
        </Reveal>

        <Reveal enabled={active} delay={280}>
          <HySeal />
        </Reveal>
      </section>

      <section className="inv-block inv-announce" aria-label="Báo tin lễ thành hôn">
        <Reveal enabled={active} className="inv-families" delay={80}>
          <FamilyCol family={groomFamily} />
          <div className="inv-families-rule" aria-hidden="true" />
          <FamilyCol family={brideFamily} />
        </Reveal>

        <Reveal enabled={active} className="inv-announce-lead" delay={160}>
          Trân trọng báo tin lễ thành hôn của
        </Reveal>

        <Reveal enabled={active} className="inv-announce-couple" delay={240}>
          <p className="inv-full-name">{groom.fullName}</p>
          <span className="inv-amp">&amp;</span>
          <p className="inv-full-name">{bride.fullName}</p>
        </Reveal>

        <Reveal enabled={active} className="inv-photo-wrap" delay={160}>
          <img
            className="inv-photo"
            src={photo2}
            alt={`${groom.fullName} và ${bride.fullName}`}
            loading="lazy"
          />
        </Reveal>
      </section>
    </div>
  )
}
