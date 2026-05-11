import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Contact = () => {
  return (
    <div className="container mt-5 content">
      <h1 className="mb-4 text-center">Liên hệ với chúng tôi</h1>
      <div className="row">
        {/* Thông tin liên hệ */}
        <div className="col-md-6 mb-4">
          <h5>Thông tin liên hệ</h5>
          <p>
            <strong>Địa chỉ:</strong> 235 Hoàng Quốc Việt, Hà Nội, Việt Nam
          </p>
          <p>
            <strong>Điện thoại:</strong> 0867758620
          </p>
          <p>
            <strong>Email:</strong> tranthimaianh@ecommerce.com
          </p>
          <h5 className="mt-4">Vị trí của chúng tôi</h5>
          <div className="map-container">
            <iframe
              title="Google Maps"
              src="https://maps.google.com/maps?q=235%20Ho%C3%A0ng%20Qu%E1%BB%91c%20Vi%E1%BB%87t,%20H%C3%A0%20N%E1%BB%99i&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Nội dung bổ sung */}
        <div className="col-md-6">
  <h5>Sản phẩm công nghệ</h5>
  <p>
    Các sản phẩm công nghệ là một phần không thể thiếu trong cuộc sống hiện đại. Từ điện thoại thông minh, máy tính xách tay, tai nghe không dây, cho đến các thiết bị thông minh trong nhà, chúng tôi mang đến cho bạn sự lựa chọn đa dạng và chất lượng cao.
  </p>
  <ul>
    <li>
      <strong>Chất lượng hàng đầu:</strong> Tất cả sản phẩm đều được nhập khẩu chính hãng và kiểm tra nghiêm ngặt trước khi đến tay khách hàng.
    </li>
    <li>
      <strong>Giá cả cạnh tranh:</strong> Chúng tôi cam kết mang lại giá tốt nhất trên thị trường, phù hợp với mọi nhu cầu.
    </li>
    <li>
      <strong>Dịch vụ hỗ trợ tận tâm:</strong> Đội ngũ tư vấn viên sẵn sàng hỗ trợ bạn 24/7 để chọn được sản phẩm phù hợp nhất.
    </li>
  </ul>
  <p>
    Khám phá những thiết bị công nghệ mới nhất với tính năng tiên tiến nhất tại cửa hàng của chúng tôi. Hãy tận dụng các chương trình khuyến mãi đặc biệt để sở hữu sản phẩm yêu thích với giá ưu đãi.
  </p>
  <a
    href="/san-pham"
    className="btn btn-primary mt-3"
  >
    Khám phá sản phẩm
  </a>
</div>

      </div>
    </div>
  );
};

export default Contact;
