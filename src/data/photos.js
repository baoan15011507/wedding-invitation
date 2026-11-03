/**
 * Ảnh thiệp — thay file tại src/assets rồi cập nhật import bên dưới.
 * Đánh số để dễ tìm trong InvitationScroll.
 */
import fileAnh1 from '../assets/TR__0671.JPG'
import fileAnh2 from '../assets/TR__0896.JPG'
import fileCarousel1 from '../assets/TR__1133.JPG'
import fileCarousel2 from '../assets/TR__0865.JPG'
import fileCarousel3 from '../assets/TR__0450.JPG'

/** Ảnh số 1 — hero (dưới ngày giờ, trên 囍) */
export const anhSo1 = fileAnh1

/** Ảnh số 2 — sau tên đầy đủ hai họ */
export const anhSo2 = fileAnh2

/** 3 ảnh slide “Trân Trọng Kính Mời” — giữa (0865), phải, trái */
export const carouselPhotos = [
  { src: fileCarousel2, alt: 'Ảnh cưới giữa' },
  { src: fileCarousel1, alt: 'Ảnh cưới phải' },
  { src: fileCarousel3, alt: 'Ảnh cưới trái' },
]
