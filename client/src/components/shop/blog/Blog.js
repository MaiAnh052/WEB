import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Blog = () => {
  const blogPosts = [
    {
  title: "BST Áo Thun Nam 2025 – Phong Cách Trẻ Trung, Năng Động",
  content: "Bộ sưu tập áo thun nam 2025 ra mắt với nhiều kiểu dáng mới, chất vải thoáng mát, phù hợp mọi phong cách từ đơn giản đến cá tính.",
  author: "Nguyễn Văn A",
  date: "01/10/2025",
  image: "https://www.gento.vn/wp-content/uploads/2024/10/boy-pho-la-gi-2.jpg",
  href: "https://www.gento.vn/wp-content/uploads/2024/10/boy-pho-la-gi-2.jpg"
},


{
  title: "Top Quần Jean Nam Được Ưa Chuộng Nhất Hiện Nay",
  content: "Quần jean nam với form dáng chuẩn, co giãn tốt và cực dễ phối đồ. Đây là item không thể thiếu trong tủ đồ của mọi anh em.",
  author: "Trần Thị B",
  date: "02/10/2025",
  image: "https://www.gento.vn/wp-content/uploads/2024/10/boy-pho-la-gi.jpg",
  href: "https://www.gento.vn/wp-content/uploads/2024/10/boy-pho-la-gi.jpg"
},


  ];

  return (
    <div className="container mt-5 content">
  <h1 className="mb-4 text-center">Blog</h1>
  <div className="row">
    {blogPosts.map((post, index) => (
      <div key={index} className="col-md-6 mb-4">
        <a href={post.href} className="text-decoration-none">
          <div className="card h-100 shadow-sm">
            <img src={post.image} className="card-img-top" alt={post.title} />
            <div className="card-body">
              <h5 className="card-title">{post.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">
                {post.author} - {post.date}
              </h6>
              <p className="card-text">{post.content}</p>
            </div>
          </div>
        </a>
      </div>
    ))}
  </div>
</div>

  );
};

export default Blog;
