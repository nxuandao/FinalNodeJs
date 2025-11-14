import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <h4 className="footer__title">Cửa hàng</h4>
          <p className="footer__muted">0123 456 789</p>
          <p className="footer__muted">ourshop@gmail.com</p>
        </div>

        <div className="footer__col">
          <h4 className="footer__title">Liên kết hữu ích</h4>
          <ul className="footer__list">
            <li>
              <Link to="/store">Sản phẩm mới</Link>
            </li>
            <li>
              <Link to="/store">Bán chạy nhất</Link>
            </li>
            <li>
              <Link to="/store">Mua combo tiết kiệm</Link>
            </li>
            <li>
              <Link to="/store">Thẻ quà tặng trực tuyến</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__title">Thông tin</h4>
          <ul className="footer__list">
            <li>
              <Link to="/return">Bắt đầu đổi trả</Link>
            </li>
            <li>
              <Link to="/contact">Liên hệ</Link>
            </li>
            <li>
              <Link to="/faq">Câu hỏi về vận chuyển</Link>
            </li>
            <li>
              <Link to="/terms">Điều khoản & Điều kiện</Link>
            </li>
            <li>
              <Link to="/privacy">Chính sách bảo mật</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__title">Nhận email ưu đãi</h4>
          <p className="footer__muted">
            Nhập email của bạn để là người đầu tiên biết về các bộ sưu tập và
            sản phẩm mới ra mắt.
          </p>
          <div className="footer__subscribe">
            <input
              className="footer__input"
              placeholder="Nhập địa chỉ email của bạn"
            />
            <button className="btn btn--primary btn--sm">Đăng ký</button>
          </div>
          <div className="footer__payments">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>AMEX</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottomInner">
          <span>© OurShop </span>
          <span className="footer__brand">OURSHOP</span>
        </div>
      </div>
    </footer>
  );
}
