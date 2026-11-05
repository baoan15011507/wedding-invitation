import { Link } from 'react-router-dom'
import './VariantHome.css'

/** Trang chọn thiệp khi vào /wedding-invitation/ */
export default function VariantHome() {
  return (
    <div className="variant-home">
      <div className="variant-home-card">
        <p className="variant-home-kicker">Thiệp cưới</p>
        <h1 className="variant-home-title">Bảo Ân &amp; Uyên Trang</h1>
        <p className="variant-home-hint">Chọn thiệp bạn nhận được</p>
        <div className="variant-home-links">
          <Link className="variant-home-btn" to="/chu-re">
            Thiệp chú rể
          </Link>
          <Link className="variant-home-btn is-soft" to="/co-dau">
            Thiệp cô dâu
          </Link>
        </div>
      </div>
    </div>
  )
}
