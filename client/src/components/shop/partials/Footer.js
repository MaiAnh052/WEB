import React, { Fragment } from "react";
import moment from "moment";

const Footer = (props) => {
  return (
    <Fragment>
      <div className="container" style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
  <div className="row">
    <div className="blog-outer-container">
      <div className="block-title" style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "28px", color: "#333", textTransform: "uppercase", fontWeight: "bold" }}>TIN TỨC CỬA HÀNG</h2>
      </div>
      <div className="blog-inner" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
  <div className="col-lg-6 col-md-6 col-sm-6" style={{ flex: "1", maxWidth: "48%", boxSizing: "border-box" }}>
    <div className="entry-thumb image-hover2" style={{ overflow: "hidden", borderRadius: "10px", marginBottom: "15px", position: "relative" }}>
      <a href="/blog/top-mau-ao-thun-nam">
        <img alt="Blog" src="https://laforce.vn/wp-content/uploads/2024/10/blogger-thoi-trang-nam-2.jpg" width="50px" height="255.46px" style={{ width: "100%", height: "auto", display: "block", transition: "transform 0.3s ease, opacity 0.3s ease" }} />
      </a>
    </div>
    <div className="blog-preview_info" style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <h4 className="blog-preview_title">
        <a href="/blog/top-mau-ao-thun-nam" style={{ color: "#333", fontSize: "18px", fontWeight: "bold", textDecoration: "none", display: "block", marginBottom: "10px" }}>
          Top các mẫu áo thun nam HOT nhất 2025
        </a>
      </h4>

      <ul className="post-meta" style={{ listStyle: "none", padding: "0", margin: "10px 0 15px", display: "flex", flexWrap: "wrap", gap: "10px", color: "#666", fontSize: "14px" }}>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-user" style={{ marginRight: "5px" }}></i>đăng bởi <a href="/admin">admin</a>
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-comments" style={{ marginRight: "5px" }}></i><a href="/blog/top-mau-ao-thun-nam#comments">12 bình luận</a>
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-clock-o" style={{ marginRight: "5px" }}></i><span className="day">12</span> <span className="tháng">Tháng Hai</span>
        </li>
      </ul>

      <div className="blog-preview_desc" style={{ color: "#555", lineHeight: "1.6", fontSize: "14px", marginBottom: "15px" }}>
        Áo thun nam luôn là lựa chọn hàng đầu nhờ sự thoải mái, dễ phối đồ và hợp mọi phong cách. Trong bài viết này, chúng tôi giới thiệu các mẫu áo thun nam mới nhất 2025 với thiết kế trẻ trung, chất vải mềm mịn và cực kỳ tôn dáng.
      </div>

      <a className="blog-preview_btn" href="/blog/top-mau-ao-thun-nam" style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#ff5722", color: "#fff", textTransform: "uppercase", fontWeight: "bold", borderRadius: "5px", textDecoration: "none" }}>
        ĐỌC THÊM
      </a>
    </div>
  </div>

  <div className="col-lg-6 col-md-6 col-sm-6" style={{ flex: "1", maxWidth: "48%", boxSizing: "border-box" }}>
    <div className="entry-thumb image-hover2" style={{ overflow: "hidden", borderRadius: "10px", marginBottom: "15px", position: "relative" }}>
      <a href="/blog/phoi-do-nam-sang-chuan-dep">
        <img alt="Blog" src="https://www.gento.vn/wp-content/uploads/2024/02/cach-phoi-do-di-tiec-event-cho-nam-11.jpg" width="550px" height="255.46px" style={{ width: "100%", height: "auto", display: "block", transition: "transform 0.3s ease, opacity 0.3s ease" }} />
      </a>
    </div>

    <div className="blog-preview_info" style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <h4 className="blog-preview_title">
        <a href="/blog/phoi-do-nam-sang-chuan-dep" style={{ color: "#333", fontSize: "18px", fontWeight: "bold", textDecoration: "none", display: "block", marginBottom: "10px" }}>
          Gợi ý cách phối đồ nam sang – chuẩn – đẹp 2025
        </a>
      </h4>

      <ul className="post-meta" style={{ listStyle: "none", padding: "0", margin: "10px 0 15px", display: "flex", flexWrap: "wrap", gap: "10px", color: "#666", fontSize: "14px" }}>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-user" style={{ marginRight: "5px" }}></i>đăng bởi <a href="/admin">admin</a>
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-comments" style={{ marginRight: "5px" }}></i><a href="/blog/phoi-do-nam-sang-chuan-dep#comments">4 bình luận</a>
        </li>
        <li style={{ display: "flex", alignItems: "center" }}>
          <i className="fa fa-clock-o" style={{ marginRight: "5px" }}></i><span className="day">25</span> <span className="tháng">Tháng Một</span>
        </li>
      </ul>

      <div className="blog-preview_desc" style={{ color: "#555", lineHeight: "1.6", fontSize: "14px", marginBottom: "15px" }}>
        Để tạo phong cách thời trang nam thời thượng, chỉ cần biết cách phối áo thun, áo sơ mi, quần jean hoặc quần tây đúng chuẩn. Dưới đây là những tips phối đồ đẹp, tinh gọn và cực cuốn hút cho mọi dịp.
      </div>

      <a className="blog-preview_btn" href="/blog/phoi-do-nam-sang-chuan-dep" style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#ff5722", color: "#fff", textTransform: "uppercase", fontWeight: "bold", borderRadius: "5px", textDecoration: "none" }}>
        ĐỌC THÊM
      </a>
    </div>
  </div>
</div>

    </div>
  </div>
</div>

      <footer style={{ backgroundColor: "#333", color: "#fff", padding: "20px 0" }}>
        {/* Newsletter Section */}
        <div
          className="newsletter-wrap"
          style={{
            backgroundColor: "#444",
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h4 style={{ color: "#ffcc00", marginBottom: "15px" }}>Bản tin</h4>
            <form>
              <input
                type="text"
                placeholder="Nhập địa chỉ email của bạn"
                style={{
                  padding: "10px",
                  width: "60%",
                  marginRight: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ffcc00",
                  border: "none",
                  borderRadius: "5px",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        {/* Footer Middle Section */}
        <div className="footer-middle" style={{ padding: "30px 0" }}>
          <div className="container">
            <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
              {/* Column */}
              <div className="footer-column" style={{ width: "23%" }}>
                <h4 style={{ color: "#ffcc00" }}>Hướng dẫn mua sắm</h4>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  <li><a href="/blog" style={linkStyle}>Blog</a></li>
                  <li><a href="/faq" style={linkStyle}>Câu hỏi thường gặp</a></li>
                  <li><a href="/payment" style={linkStyle}>Thanh toán</a></li>
                  <li><a href="/shipping" style={linkStyle}>Chuyên hàng</a></li>
                  <li><a href="/order-tracking" style={linkStyle}>Đơn hàng của tôi ở đâu?</a></li>
                  <li><a href="/return-policy" style={linkStyle}>Chính sách hoàn trả</a></li>
                </ul>
              </div>
              {/* Other Columns */}
              <div className="footer-column" style={{ width: "23%" }}>
                <h4 style={{ color: "#ffcc00" }}>Cố vấn phong cách</h4>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  <li><a href="/login" style={linkStyle}>Tài khoản của bạn</a></li>
                  <li><a href="/info" style={linkStyle}>Thông tin</a></li>
                  <li><a href="/address" style={linkStyle}>Địa chỉ</a></li>
                  <li><a href="/discounts" style={linkStyle}>Giảm giá</a></li>
                  <li><a href="/order-history" style={linkStyle}>Lịch sử đơn hàng</a></li>
                  <li><a href="/track-order" style={linkStyle}>Theo dõi đơn hàng</a></li>
                </ul>
              </div>
              <div className="footer-column" style={{ width: "23%" }}>
                <h4 style={{ color: "#ffcc00" }}>Thông tin</h4>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  <li><a href="/sitemap" style={linkStyle}>Sơ đồ trang web</a></li>
                  <li><a href="/search-keywords" style={linkStyle}>Cụm từ tìm kiếm</a></li>
                  <li><a href="/advanced-search" style={linkStyle}>Tìm kiếm nâng cao</a></li>
                  <li><a href="/about" style={linkStyle}>Giới thiệu</a></li>
                  <li><a href="/contact" style={linkStyle}>Liên hệ với chúng tôi</a></li>
                  <li><a href="/suppliers" style={linkStyle}>Nhà cung cấp</a></li>
                </ul>
              </div>
              <div className="footer-column" style={{ width: "23%" }}>
                <h4 style={{ color: "#ffcc00" }}>Liên hệ với chúng tôi</h4>
                <address style={{ fontStyle: "normal", marginBottom: "10px" }}>
                  235 Hoàng Quốc Việt, Hà Nội, Việt Nam
                </address>
                <address style={{ fontStyle: "normal", marginBottom: "10px" }}>
                </address>
                <p style={{ margin: "0 0 5px" }}><span role="img" aria-label="phone">📞</span> 0867758620</p>
                <p style={{ margin: "0" }}>
                  <span role="img" aria-label="email">✉️</span> <a href="mailto:tranthimaianh@magikcommerce.com" style={linkStyle}>tranthimaianh@magikcommerce.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Bottom */}
        <div
          className="footer-bottom"
          style={{
            backgroundColor: "#222",
            color: "#ccc",
            padding: "10px 0",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0" }}>
            &copy; {moment().format("YYYY")} Magikc Commerce. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </Fragment>
  );
};

// Common style for links
const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  display: "block",
  margin: "5px 0",
};

export default Footer;
