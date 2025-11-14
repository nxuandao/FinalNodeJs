import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

export default function Contact({ isLoggedIn }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Hỗ trợ chung",
    message: "",
    hp: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", msg: "" });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Nội dung tối thiểu 10 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (form.hp) return;
    if (!validate()) return;
    try {
      setStatus({ type: "loading", msg: "Đang gửi..." });
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("SEND_FAILED");
      setStatus({
        type: "success",
        msg: "Đã gửi! Chúng tôi sẽ phản hồi sớm nhất.",
      });
      setForm({
        name: "",
        email: "",
        subject: "Hỗ trợ chung",
        message: "",
        hp: "",
      });
      setErrors({});
    } catch {
      setStatus({ type: "error", msg: "Gửi thất bại. Vui lòng thử lại." });
    }
  };

  return (
    <div className="contact-page">
      <Header isLoggedIn={isLoggedIn} />
      <section
        className="contact-hero"
        style={{ "--contact-hero-img": 'url("/contact-hero.jpg")' }}
      >
        <div className="contact-hero__overlay">
          <div className="container">
            <h1 className="contact-hero__title">Liên Hệ</h1>
            <p className="contact-hero__subtitle">
              Hãy gửi cho chúng tôi lời nhắn. Phản hồi trong 24–48 giờ làm việc.
            </p>
          </div>
        </div>
      </section>

      <section className="contact container">
        <div className="contact__grid">
          <div className="contact__info">
            <h2 className="contact__title">Thông tin</h2>
            <ul className="contact__list">
              <li>
                Email:{" "}
                <strong>
                  <a href="mailto:ourshop@gmail.com">ourshop@gmail.com</a>
                </strong>
              </li>
              <li>
                Hotline:{" "}
                <strong>
                  <a href="tel:0123456789">0123 456 789</a>
                </strong>
              </li>
              <li>
                Địa chỉ: 19 Nguyễn Hữu Thọ, Phường Tân Phong, Quận7. Thành phố
                Hồ Chí Minh
              </li>
              <li>Giờ làm việc: 8:30–17:30 (T2–T6)</li>
            </ul>

            <>
              <div className="contact__map">
                <iframe
                  title="Bản đồ"
                  src="https://maps.google.com/maps?q=19%20Nguyen%20Huu%20Tho%2C%20Phuong%20Tan%20Phong%2C%20Quan%207%2C%20Thanh%20pho%20Ho%20Chi%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="contact__social">
                <h3 className="contact__subtitle">Kênh liên hệ</h3>
                <div className="social__row">
                  <a
                    className="social__btn"
                    href="https://facebook.com/yourshop"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.1V12h2.1V9.8c0-2 1.2-3.1 3-3.1.9 0 1.8.16 1.8.16v2h-1c-1 0-1.3.62-1.3 1.26V12h2.2l-.35 2.9h-1.85v7A10 10 0 0 0 22 12" />
                    </svg>
                    <span>Facebook</span>
                  </a>

                  <a
                    className="social__btn"
                    href="https://instagram.com/yourshop"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
                    </svg>
                    <span>Instagram</span>
                  </a>

                  <a
                    className="social__btn"
                    href="https://www.tiktok.com/@yourshop"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M13 3h3a5 5 0 0 0 5 5v3a8 8 0 0 1-5-1.7V15a6 6 0 1 1-6-6c.35 0 .69.03 1 .1V12a3 3 0 1 0 3 3V3Z" />
                    </svg>
                    <span>TikTok</span>
                  </a>

                  <a
                    className="social__btn"
                    href="https://shopee.vn/yourshop"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Shopee"
                    title="Shopee"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16l-1.2 11.2A3 3 0 0 1 15.8 21H8.2a3 3 0 0 1-3-2.8L4 7Zm8-4a4 4 0 0 1 4 4h-2a2 2 0 1 0-4 0H8a4 4 0 0 1 4-4Z" />
                    </svg>
                    <span>Shopee</span>
                  </a>
                </div>
              </div>
            </>
          </div>

          <div className="contact__formwrap">
            <h2 className="contact__title">Gửi liên hệ</h2>

            <div className="contact__alerts">
              {status.type === "success" && (
                <div className="alert alert--success">{status.msg}</div>
              )}
              {status.type === "error" && (
                <div className="alert alert--error">{status.msg}</div>
              )}
            </div>

            <form className="contact__form" onSubmit={onSubmit} noValidate>
              <label className="field">
                <span>Họ tên *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <small className="field__error">{errors.name}</small>
                )}
              </label>

              <label className="field">
                <span>Email *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <small className="field__error">{errors.email}</small>
                )}
              </label>

              <label className="field">
                <span>Chủ đề</span>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject: e.target.value }))
                  }
                >
                  <option>Hỗ trợ chung</option>
                  <option>Báo lỗi</option>
                  <option>Hợp tác</option>
                  <option>Báo giá</option>
                </select>
              </label>

              <input
                className="hp"
                tabIndex={-1}
                autoComplete="off"
                value={form.hp}
                onChange={() => {}}
                placeholder="Để trống"
              />

              <label className="field field--full">
                <span>Nội dung *</span>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <small className="field__error">{errors.message}</small>
                )}
              </label>

              <div className="contact__actions">
                <button
                  className="btn btn--primary"
                  disabled={status.type === "loading"}
                >
                  {status.type === "loading" ? "Đang gửi..." : "Gửi liên hệ"}
                </button>
                <span className="contact__note">
                  Khi gửi, bạn đồng ý với điều khoản & bảo mật.
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
