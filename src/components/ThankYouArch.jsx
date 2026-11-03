import photo from '../assets/TR__4771.JPG'
import './ThankYouArch.css'

function TwinHearts() {
  return (
    <div className="ty-hearts" aria-hidden="true">
      {/* Hai trái tim chồng khít giữa — giống badge mẫu */}
      <svg className="ty-hearts-svg" viewBox="0 0 78 52" fill="none">
        <defs>
          <path
            id="ty-heart-l"
            d="M27 49S5.5 33.5 5.5 19.8C5.5 12 11.2 7.2 18.2 7.2c4.8 0 8.3 2.5 10.8 6.5C31.5 9.7 35 7.2 39.8 7.2 46.8 7.2 52.5 12 52.5 19.8 52.5 33.5 27 49 27 49Z"
          />
          <path
            id="ty-heart-r"
            d="M51 49S29.5 33.5 29.5 19.8C29.5 12 35.2 7.2 42.2 7.2c4.8 0 8.3 2.5 10.8 6.5C55.5 9.7 59 7.2 63.8 7.2 70.8 7.2 76.5 12 76.5 19.8 76.5 33.5 51 49 51 49Z"
          />
        </defs>
        {/* Viền vàng ngoài */}
        <use xlinkHref="#ty-heart-l" className="ty-heart-shape" />
        <use xlinkHref="#ty-heart-r" className="ty-heart-shape" />
        {/* Tô đỏ lại phần chồng — che đường viền giữa hai tim */}
        <use xlinkHref="#ty-heart-l" className="ty-heart-fill" />
        <use xlinkHref="#ty-heart-r" className="ty-heart-fill" />
      </svg>
      <span className="ty-hearts-label">Wedding</span>
    </div>
  )
}

export default function ThankYouArch() {
  return (
    <section className="ty-arch" aria-label="Lời cảm ơn">
      <div className="ty-arch-wrap">
        <TwinHearts />

        <div className="ty-arch-frame">
          <div className="ty-arch-clip">
            <img
              className="ty-arch-photo"
              src={photo}
              alt=""
              loading="lazy"
              draggable={false}
            />
            <span className="ty-arch-hy" aria-hidden="true">
              囍
            </span>
            <div className="ty-arch-copy">
              <p className="ty-arch-thanks">Thank You!</p>
              <p className="ty-arch-honor">Rất hân hạnh được đón tiếp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
