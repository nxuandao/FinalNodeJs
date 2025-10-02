import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <h4 className="footer__title">Company</h4>
          <p className="footer__muted">
            Find a location nearest you. See Our Stores
          </p>
          <p className="footer__muted">+91 (03)5 4569 1587</p>
          <p className="footer__muted">ourshop@gmail.com</p>
        </div>
        <div className="footer__col">
          <h4 className="footer__title">Useful Links</h4>
          <ul className="footer__list">
            <li>
              <Link to="/store">New Products</Link>
            </li>
            <li>
              <Link to="/store">Best Sellers</Link>
            </li>
            <li>
              <Link to="/store">Bundle & Save</Link>
            </li>
            <li>
              <Link to="/store">Online Gift Card</Link>
            </li>
          </ul>
        </div>
        <div className="footer__col">
          <h4 className="footer__title">Information</h4>
          <ul className="footer__list">
            <li>
              <Link to="/return">Start A Return</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            <li>
              <Link to="/faq">Shipping FAQ</Link>
            </li>
            <li>
              <Link to="/terms">Terms & Conditions</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
        <div className="footer__col">
          <h4 className="footer__title">Good emails.</h4>
          <p className="footer__muted">
            Enter your email below to be the first to know about new collections
            and product launches.
          </p>
          <div className="footer__subscribe">
            <input
              className="footer__input"
              placeholder="Enter your email address"
            />
            <button className="btn btn--primary btn--sm">Subscribe</button>
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
          <span>© OurShop 2025</span>
          <span className="footer__brand">OURSHOP</span>
        </div>
      </div>
    </footer>
  );
}
