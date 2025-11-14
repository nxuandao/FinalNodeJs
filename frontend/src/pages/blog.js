import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

const BlogPage = ({ isLoggedIn }) => {
  return (
    <>
        <Header isLoggedIn={isLoggedIn} />

      <main className="container">
        <section className="blog-hero">
          <h1 className="blog-title">Blog & Tin tức</h1>
          <p className="blog-subtitle">
            Cập nhật xu hướng thời trang, mẹo phối đồ và những tin tức mới nhất
            từ thương hiệu của chúng tôi.
          </p>
        </section>

        <section className="blog-grid">
          <article className="blog-card">
            <div className="blog-thumb">
              <img src="../blog1.jpg" alt="Xu hướng thời trang 2025" />
            </div>
            <div className="blog-body">
              <h2 className="blog-card__title">
                10 xu hướng thời trang nổi bật năm 2025
              </h2>
              <p className="blog-date">02 Tháng 11, 2025</p>
              <p className="blog-excerpt">
                Năm 2025 đánh dấu sự trở lại của phong cách tối giản, chất liệu
                thân thiện với môi trường và các thiết kế unisex cá tính. Tất cả
                tạo nên một làn sóng thời trang bền vững, hiện đại.
              </p>
              <div className="blog-tag">#ThờiTrang #XuHướng</div>
            </div>
          </article>

          <article className="blog-card">
            <div className="blog-thumb">
              <img src="/blog2.jpg" alt="Cách phối đồ basic" />
            </div>
            <div className="blog-body">
              <h2 className="blog-card__title">
                Cách phối đồ basic mà vẫn sang trọng
              </h2>
              <p className="blog-date">28 Tháng 10, 2025</p>
              <p className="blog-excerpt">
                Từ áo thun trắng đến blazer tối màu, chỉ cần một chút khéo léo
                trong cách phối hợp là bạn đã có thể tạo nên phong cách vừa đơn
                giản vừa đẳng cấp.
              </p>
              <div className="blog-tag">#PhongCách #Basic</div>
            </div>
          </article>

          <article className="blog-card">
            <div className="blog-thumb">
              <img src="/blog3.jpg" alt="Bảo quản quần áo" />
            </div>
            <div className="blog-body">
              <h2 className="blog-card__title">
                Làm sao để bảo quản quần áo luôn như mới?
              </h2>
              <p className="blog-date">25 Tháng 10, 2025</p>
              <p className="blog-excerpt">
                Giặt đúng cách, phơi nơi thoáng mát và bảo quản trong túi vải là
                bí quyết giúp quần áo luôn bền màu, giữ dáng và trông như mới
                mua.
              </p>
              <div className="blog-tag">#MẹoVặt #ChămSócĐồ</div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BlogPage;
