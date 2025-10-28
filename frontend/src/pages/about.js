import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

export default function About({ isLoggedIn }) {
  return (
    <div className="about-page">
      <Header isLoggedIn={isLoggedIn} />

      <section
        className="about-hero"
        style={{ "--about-hero-img": 'url("/feat1.png")' }}
      >
        <div className="about-hero__overlay">
          <div className="container">
            <h1 className="about-hero__title">Về Chúng Tôi</h1>
            <p className="about-hero__subtitle">
              Thời trang hiện đại, chất lượng tốt, giá hợp lý.
            </p>
          </div>
        </div>
      </section>

      <section className="about-intro container">
        <h2 className="about-section__title">Sứ Mệnh</h2>
        <p className="about-section__desc">
          Chúng tôi mang đến trải nghiệm mua sắm dễ dàng và đáng tin cậy cho mọi
          khách hàng, cập nhật xu hướng liên tục, tối ưu chất lượng dịch vụ và
          sản phẩm.
        </p>
      </section>

      <section className="about-values container">
        <h2 className="about-section__title">Giá Trị Cốt Lõi</h2>
        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card__title">Chất Lượng</h3>
            <p className="about-card__desc">
              Chú trọng từng chi tiết, từ chất liệu đến hoàn thiện, đảm bảo độ
              bền và cảm giác mặc tốt.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card__title">Đổi Mới</h3>
            <p className="about-card__desc">
              Luôn thử nghiệm và cập nhật sản phẩm theo mùa, theo trend để bạn
              tự tin thể hiện phong cách.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card__title">Khách Hàng</h3>
            <p className="about-card__desc">
              Hỗ trợ nhanh, chính sách đổi trả linh hoạt, ưu tiên lợi ích và
              trải nghiệm của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="about-policies container">
        <h2 className="about-section__title">Chính Sách Mua Sắm</h2>
        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card__title">Vận Chuyển</h3>
            <p className="about-card__desc">
              Giao hàng toàn quốc 2–4 ngày làm việc. Tùy chọn hoả tốc tại một số
              khu vực trung tâm.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card__title">Đổi Trả</h3>
            <p className="about-card__desc">
              Đổi size/mẫu trong 7 ngày đối với sản phẩm còn tag, chưa qua sử
              dụng.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card__title">Thanh Toán</h3>
            <p className="about-card__desc">
              Hỗ trợ COD, ví điện tử và cổng thanh toán trực tuyến phổ biến tại
              Việt Nam.
            </p>
          </div>
        </div>
      </section>

      <section className="about-contact container">
        <h2 className="about-section__title">Liên Hệ</h2>
        <p className="about-section__desc">
          Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi:
        </p>
        <ul className="about-contact__list">
          <li>
            Email: <strong>support@myshop.vn</strong>
          </li>
          <li>
            Hotline: <strong>0123 456 789</strong>
          </li>
          <li>Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</li>
        </ul>
      </section>

      <Footer />
    </div>
  );
}
