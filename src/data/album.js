/**
 * Album ảnh cưới — 10 khung.
 * Hiện dùng 2 ảnh có sẵn lặp làm mẫu; thay `src` từng ô khi có ảnh thật.
 */
import photo1 from '../assets/TR__4771.JPG'
import photo2 from '../assets/TR__4785.JPG'

const sample = [photo1, photo2]

/** 10 khung — mẫu xoay vòng 2 ảnh; sau này gắn ảnh riêng từng dòng */
export const albumPhotos = Array.from({ length: 10 }, (_, i) => ({
  src: sample[i % sample.length],
}))
