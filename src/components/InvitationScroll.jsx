import { useEffect, useRef, useState } from 'react'
import { albumPhotos } from '../data/album'
import { anhSo1, anhSo2 } from '../data/photos'
import { wedding } from '../data/wedding'
import DirectionsTour from './DirectionsTour'
import CalendarNov2026 from './CalendarNov2026'
import WeddingAlbum from './WeddingAlbum'
import ThankYouArch from './ThankYouArch'
import CloseInviteButton from './CloseInviteButton'
import HySeal from './HySeal'
import LotusDivider from './LotusDivider'
import PhotoCarousel from './PhotoCarousel'
import Reveal from './Reveal'
import './InvitationScroll.css'

const carouselPhotos = [
  { src: anhSo1, alt: 'Ảnh cưới giữa' },
  { src: anhSo2, alt: 'Ảnh cưới phải' },
  { src: anhSo2, alt: 'Ảnh cưới trái' },
]

const CEREMONY_TEXT_MS = 420
const CEREMONY_SIDE_MS = 650
const CEREMONY_MID_MS = 520
const PARTY_FRAME_MS = 480

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

/**
 * LỄ THÀNH HÔN: tiêu đề + “Vào lúc” fade in;
 * 2 ô ngoài trượt vào như carousel; cụm giữa hiện từng dòng theo chiều cuộn.
 */
function CeremonySection({ enabled }) {
  const rootRef = useRef(null)
  const playedRef = useRef(false)
  const timersRef = useRef([])
  const [intro, setIntro] = useState('idle') // idle | text | sides | mid | done
  const [dir, setDir] = useState('down')

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }

    if (!enabled) {
      clearTimers()
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

    const play = () => {
      if (playedRef.current) return
      playedRef.current = true
      const scrollDir = scrollRoot?.dataset?.scrollDir === 'up' ? 'up' : 'down'
      setDir(scrollDir)
      setIntro('text')
      clearTimers()
      timersRef.current.push(
        window.setTimeout(() => setIntro('sides'), CEREMONY_TEXT_MS),
        window.setTimeout(
          () => setIntro('mid'),
          CEREMONY_TEXT_MS + CEREMONY_SIDE_MS,
        ),
        window.setTimeout(
          () => setIntro('done'),
          CEREMONY_TEXT_MS + CEREMONY_SIDE_MS + CEREMONY_MID_MS,
        ),
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
      { root: scrollRoot, threshold: 0.22 },
    )

    io.observe(el)
    return () => {
      clearTimers()
      io.disconnect()
    }
  }, [enabled])

  return (
    <div
      ref={rootRef}
      className={`inv-ceremony is-intro-${intro}`}
      data-dir={dir}
    >
      <p className="inv-ceremony-title">LỄ THÀNH HÔN</p>
      <p className="inv-ceremony-when">Vào lúc</p>

      <div className="inv-ceremony-grid" aria-label="Thời gian lễ thành hôn">
        <div className="inv-ceremony-cell inv-ceremony-time">10h30</div>
        <div className="inv-ceremony-rule" aria-hidden="true" />
        <div className="inv-ceremony-cell inv-ceremony-mid">
          <span>chủ nhật</span>
          <span className="inv-ceremony-day">29</span>
          <span>tháng 11</span>
        </div>
        <div className="inv-ceremony-rule" aria-hidden="true" />
        <div className="inv-ceremony-cell inv-ceremony-year">năm 2026</div>
      </div>

      <p className="inv-ceremony-lunar">( nhằm ngày 21 tháng 10 năm Bính Ngọ )</p>
      <p className="inv-ceremony-venue">Tại Tư Gia</p>
    </div>
  )
}

/** Khung tiệc: hiện khung trước → chữ trượt từ trái sang 1 lần */
function PartyFrameSection({ enabled }) {
  const rootRef = useRef(null)
  const playedRef = useRef(false)
  const timersRef = useRef([])
  const [intro, setIntro] = useState('idle') // idle | frame | content

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }

    if (!enabled) {
      clearTimers()
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
          clearTimers()
          setIntro('idle')
          playedRef.current = false
          return
        }
        if (playedRef.current) return
        playedRef.current = true
        setIntro('frame')
        clearTimers()
        timersRef.current.push(
          window.setTimeout(() => setIntro('content'), PARTY_FRAME_MS),
        )
      },
      { root: scrollRoot, threshold: 0.22 },
    )

    io.observe(el)
    return () => {
      clearTimers()
      io.disconnect()
    }
  }, [enabled])

  return (
    <div
      ref={rootRef}
      className={`inv-party-frame is-intro-${intro}`}
      aria-label="Tiệc mừng lễ thành hôn"
    >
      <div className="inv-party-inner">
        <p className="inv-party-title">TIỆC MỪNG LỄ THÀNH HÔN</p>
        <p className="inv-party-time">11h00 - chủ nhật</p>
        <p className="inv-party-date">29-11-2026</p>
        <p className="inv-party-lunar">( nhằm ngày 21 tháng 10 năm Bính Ngọ )</p>
        <p className="inv-party-venue">Tại Tư Gia</p>
      </div>
    </div>
  )
}

/** Tốc độ auto-scroll (px/giây) */
const AUTO_SCROLL_PX_PER_SEC = 50
/** Chờ cửa mở một chút rồi mới cuốn */
const AUTO_SCROLL_DELAY_MS = 1100

export default function InvitationScroll({ active, onCloseInvite }) {
  const { groom, bride, groomFamily, brideFamily, party } = wedding
  const scrollerRef = useRef(null)
  const autoRef = useRef({ running: false, raf: 0, last: 0, carry: 0 })

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined

    let lastTop = el.scrollTop
    const onScrollDir = () => {
      const top = el.scrollTop
      if (top > lastTop + 2) el.dataset.scrollDir = 'down'
      else if (top < lastTop - 2) el.dataset.scrollDir = 'up'
      lastTop = top
    }
    el.dataset.scrollDir = 'down'
    el.addEventListener('scroll', onScrollDir, { passive: true })

    const stopAuto = () => {
      autoRef.current.running = false
      autoRef.current.carry = 0
      if (autoRef.current.raf) {
        cancelAnimationFrame(autoRef.current.raf)
        autoRef.current.raf = 0
      }
    }

    if (!active) {
      stopAuto()
      return undefined
    }

    el.scrollTop = 0

    const tick = (now) => {
      if (!autoRef.current.running) return
      const last = autoRef.current.last || now
      // Không cắt dt quá thấp — tránh càng lag càng chậm
      const dt = Math.min(0.1, (now - last) / 1000)
      autoRef.current.last = now

      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0 || el.scrollTop >= maxScroll - 1) {
        stopAuto()
        return
      }

      // Cộng dồn phần lẻ để tốc độ ổn định dù FPS tụt
      autoRef.current.carry += AUTO_SCROLL_PX_PER_SEC * dt
      const step = Math.floor(autoRef.current.carry)
      if (step > 0) {
        autoRef.current.carry -= step
        el.scrollTop = Math.min(maxScroll, el.scrollTop + step)
      }
      autoRef.current.raf = requestAnimationFrame(tick)
    }

    const startAuto = () => {
      stopAuto()
      autoRef.current.running = true
      autoRef.current.last = 0
      autoRef.current.carry = 0
      autoRef.current.raf = requestAnimationFrame(tick)
    }

    const onUserInterfere = () => {
      if (autoRef.current.running) stopAuto()
    }

    el.addEventListener('touchstart', onUserInterfere, { passive: true })
    el.addEventListener('wheel', onUserInterfere, { passive: true })
    el.addEventListener('pointerdown', onUserInterfere)

    const delayId = window.setTimeout(startAuto, AUTO_SCROLL_DELAY_MS)

    return () => {
      window.clearTimeout(delayId)
      stopAuto()
      el.removeEventListener('scroll', onScrollDir)
      el.removeEventListener('touchstart', onUserInterfere)
      el.removeEventListener('wheel', onUserInterfere)
      el.removeEventListener('pointerdown', onUserInterfere)
    }
  }, [active])

  return (
    <div
      ref={scrollerRef}
      className={`invitation-scroll${active ? ' is-active' : ''}`}
    >
      <section className="inv-block inv-hero" aria-label="Thiệp mời">
        <Reveal enabled={active} className="inv-kicker" delay={60} variant="left">
          Thiệp Mời
        </Reveal>

        <Reveal enabled={active} className="inv-names" delay={140} variant="right">
          <span>{groom.shortName}</span>
          <span className="inv-names-amp">&amp;</span>
          <span>{bride.shortName}</span>
        </Reveal>

        <Reveal enabled={active} delay={220} variant="fade">
          <HySeal />
        </Reveal>

        <Reveal enabled={active} className="inv-when inv-when--weekday" delay={280} variant="left">
          <p className="inv-weekday">Chủ nhật — 11h00</p>
        </Reveal>

        <Reveal enabled={active} className="inv-when inv-when--date" delay={340} variant="right">
          <p className="inv-date">
            {String(party.day).padStart(2, '0')}-{String(party.month).padStart(2, '0')}-
            {party.year}
          </p>
        </Reveal>

        {/* Ảnh số 1 — thay trong src/data/photos.js (anhSo1) */}
        <Reveal
          enabled={active}
          className="inv-photo-wrap inv-photo-wrap--1"
          delay={200}
          variant="left"
        >
          <img
            className="inv-photo"
            src={anhSo1}
            alt={`${groom.shortName} và ${bride.shortName}`}
            loading="eager"
          />
        </Reveal>

        <Reveal enabled={active} className="inv-hy-after-photo1" delay={260} variant="fade">
          <HySeal />
        </Reveal>
      </section>

      <section className="inv-block inv-announce" aria-label="Báo tin lễ thành hôn">
        <div className="inv-families">
          {/* Nhà Trai: từ trái → phải; Nhà Gái: từ phải → trái (không đảo theo hướng cuộn) */}
          <Reveal
            enabled={active}
            className="inv-family-reveal inv-reveal-fixed"
            delay={80}
            variant="left"
          >
            <FamilyCol family={groomFamily} />
          </Reveal>
          <div className="inv-families-rule" aria-hidden="true" />
          <Reveal
            enabled={active}
            className="inv-family-reveal inv-reveal-fixed"
            delay={80}
            variant="right"
          >
            <FamilyCol family={brideFamily} />
          </Reveal>
        </div>

        <Reveal
          enabled={active}
          className="inv-announce-lead"
          delay={160}
          variant="fade"
        >
          Trân trọng báo tin lễ thành hôn của
        </Reveal>

        <div className="inv-announce-couple">
          <Reveal enabled={active} delay={220} variant="left">
            <p className="inv-full-name">{groom.fullName}</p>
          </Reveal>
          <Reveal enabled={active} delay={260} variant="fade">
            <span className="inv-amp">&amp;</span>
          </Reveal>
          <Reveal enabled={active} delay={300} variant="right">
            <p className="inv-full-name">{bride.fullName}</p>
          </Reveal>
        </div>

        {/* Ảnh số 2 — thay trong src/data/photos.js (anhSo2) */}
        <Reveal enabled={active} className="inv-photo-wrap inv-photo-wrap--2" delay={160}>
          <img
            className="inv-photo"
            src={anhSo2}
            alt={`${groom.fullName} và ${bride.fullName}`}
            loading="lazy"
          />
        </Reveal>

        <Reveal enabled={active} delay={220}>
          <LotusDivider />
        </Reveal>

        <Reveal enabled={active} className="inv-invite-script" delay={300}>
          Trân Trọng Kính Mời
        </Reveal>

        <PhotoCarousel photos={carouselPhotos} enabled={active} />

        <CeremonySection enabled={active} />

        <PartyFrameSection enabled={active} />

        <DirectionsTour />

        {/* Không bọc Reveal — tránh ẩn lịch vì IntersectionObserver trong khung phone */}
        <CalendarNov2026 />

        <WeddingAlbum photos={albumPhotos} />

        <ThankYouArch />

        <CloseInviteButton onClick={onCloseInvite} />
      </section>
    </div>
  )
}
