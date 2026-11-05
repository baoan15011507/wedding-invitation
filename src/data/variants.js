import { weddingShared } from './wedding'

/** Deep-merge object (1 cấp lồng nhau đủ cho wedding data) */
function mergeWedding(base, override = {}) {
  const out = { ...base }
  for (const [key, val] of Object.entries(override)) {
    if (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = { ...base[key], ...val }
    } else {
      out[key] = val
    }
  }
  return out
}

/**
 * Chỉ ghi phần KHÁC với bản chung.
 * Sửa địa chỉ / chỉ đường / thứ tự nhà… tại đây.
 */
export const variantOverrides = {
  'chu-re': {
    id: 'chu-re',
    title: 'Thiệp chú rể',
    familyOrder: 'groom-first',
    coupleOrder: 'groom-first',
    nameJoiner: '&',
    streetRoute: 'groom',
  },
  'co-dau': {
    id: 'co-dau',
    title: 'Thiệp cô dâu',
    familyOrder: 'bride-first',
    coupleOrder: 'bride-first',
    nameJoiner: 'và',
    streetRoute: 'bride',
    hero: {
      weekdayLine: 'Thứ bảy — 10h30',
    },
    party: {
      day: 28,
      month: 11,
      year: 2026,
      address: 'CÀ PHÊ SÂN VƯỜN HÁT VỚI NHAU — THÔN PHÚ KHÁNH, TUYÊN QUANG, LÂM ĐỒNG',
      timeLine: '10h30 - thứ bảy',
      dateLine: '28-11-2026',
      lunarLine: '( nhằm ngày 20 tháng 10 năm Bính Ngọ )',
      venueLine: 'Cà phê sân vườn hát với nhau',
    },
    ceremony: {
      timeDisplay: '9h15',
      weekdayDisplay: 'thứ bảy',
      dayDisplay: '28',
      monthDisplay: 'tháng 11',
      yearDisplay: 'năm 2026',
      lunarLine: '( nhằm ngày 20 tháng 10 năm Bính Ngọ )',
      venueLine: 'Tại Tư Gia',
    },
    directions: {
      title: 'Chỉ đường đến nơi tổ chức tiệc',
      destinationLabel: 'Cà phê sân vườn hát với nhau',
      viewPlaceLabel: 'Xem vị trí nơi tổ chức tiệc',
    },
    calendar: {
      highlightDay: 28,
    },
  },
}

export const VARIANT_IDS = Object.keys(variantOverrides)

export function getWedding(variantId) {
  const id = VARIANT_IDS.includes(variantId) ? variantId : 'chu-re'
  return mergeWedding(weddingShared, { id, ...variantOverrides[id] })
}
