const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public/uploads/products/";
    console.log(basePath);
    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        console.log("Exists image");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.json({ Products });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddProduct(req, res) {
    let { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus, pVariants } =
      req.body;
    let images = req.files;
    
    // Parse variants if provided
    let parsedVariants = [];
    if (pVariants) {
      try {
        parsedVariants = typeof pVariants === 'string' ? JSON.parse(pVariants) : pVariants;
      } catch (e) {
        parsedVariants = [];
      }
    }
    
    // Validation
    if (
      !pName |
      !pDescription |
      !pQuantity |
      !pCategory |
      !pOffer |
      !pStatus
    ) {
      Product.deleteImages(images, "file");
      return res.json({ error: "All filled must be required" });
    }
    // Validate variants - must have at least 1 variant with price
    else if (!parsedVariants || parsedVariants.length === 0) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Phải có ít nhất 1 biến thể (size, màu, giá)" });
    }
    else if (parsedVariants.some(v => !v.size || !v.color || !v.price)) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Mỗi biến thể phải có đầy đủ size, màu sắc và giá" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      Product.deleteImages(images, "file");
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Images - require at least 1 image
    else if (!images || images.length < 1) {
      Product.deleteImages(images, "file");
      return res.json({ error: "Must need to provide at least 1 image" });
    } else {
      try {
        let allImages = [];
        for (const img of images) {
          allImages.push(img.filename);
        }
        
        // Calculate total quantity from variants
        const totalQuantity = parsedVariants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
        
        // Get min and max price from variants for display
        const prices = parsedVariants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        
        let newProduct = new productModel({
          pImages: allImages,
          pName,
          pDescription,
          pPrice: minPrice, // Set to min price from variants for backward compatibility
          pQuantity: totalQuantity || pQuantity, // Use total from variants
          pCategory,
          pOffer,
          pStatus,
          pVariants: parsedVariants,
        });
        let save = await newProduct.save();
        if (save) {
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postEditProduct(req, res) {
    let {
      pId,
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages,
      pVariants,
    } = req.body;
    let editImages = req.files;

    // Parse variants if provided
    let parsedVariants = [];
    if (pVariants) {
      try {
        parsedVariants = typeof pVariants === 'string' ? JSON.parse(pVariants) : pVariants;
      } catch (e) {
        parsedVariants = [];
      }
    }

    // Validate other fields
    if (
      !pId |
      !pName |
      !pDescription |
      !pQuantity |
      !pCategory |
      !pOffer |
      !pStatus
    ) {
      return res.json({ error: "All filled must be required" });
    }
    // Validate variants - must have at least 1 variant with price
    else if (!parsedVariants || parsedVariants.length === 0) {
      return res.json({ error: "Phải có ít nhất 1 biến thể (size, màu, giá)" });
    }
    else if (parsedVariants.some(v => !v.size || !v.color || !v.price)) {
      return res.json({ error: "Mỗi biến thể phải có đầy đủ size, màu sắc và giá" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // No validation needed for edit images - can keep existing images or update with new ones
    else {
      // Calculate total quantity from variants
      const totalQuantity = parsedVariants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
      
      // Get min price from variants for display
      const prices = parsedVariants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      let editData = {
        pName,
        pDescription,
        pPrice: minPrice, // Set to min price from variants
        pQuantity: totalQuantity || pQuantity, // Use total from variants
        pCategory,
        pOffer,
        pStatus,
        pVariants: parsedVariants,
      };
      if (editImages && editImages.length >= 1) {
        let allEditImages = [];
        for (const img of editImages) {
          allEditImages.push(img.filename);
        }
        editData = { ...editData, pImages: allEditImages };
        if (pImages) {
          Product.deleteImages(pImages.split(","), "string");
        }
      }
      try {
        let editProduct = productModel.findByIdAndUpdate(pId, editData);
        editProduct.exec((err) => {
          if (err) console.log(err);
          return res.json({ success: "Product edit successfully" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $lt: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        checkReviewRatingExists.pRatingsReviews.map((item) => {
          if (item.user === uId) {
            return res.json({ error: "Your already reviewd the product" });
          } else {
            try {
              let newRatingReview = productModel.findByIdAndUpdate(pId, {
                $push: {
                  pRatingsReviews: {
                    review: review,
                    user: uId,
                    rating: rating,
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  console.log(err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(pId, {
            $push: {
              pRatingsReviews: { review: review, user: uId, rating: rating },
            },
          });
          newRatingReview.exec((err, result) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Thanks for your review" });
          });
        } catch (err) {
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.json({ success: "Your review is deleted" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  // Cập nhật số lượng kho của sản phẩm
  async updateStock(req, res) {
    let { pId, quantity, variantIndex, variantQuantity } = req.body;
    
    if (!pId) {
      return res.json({ error: "Product ID is required" });
    }

    try {
      const product = await productModel.findById(pId);
      if (!product) {
        return res.json({ error: "Product not found" });
      }

      // Nếu có variantIndex, cập nhật số lượng variant
      if (variantIndex !== undefined && variantIndex !== null) {
        if (!product.pVariants || !product.pVariants[variantIndex]) {
          return res.json({ error: "Variant not found" });
        }

        const newVariantQuantity = parseInt(variantQuantity) || 0;
        if (newVariantQuantity < 0) {
          return res.json({ error: "Quantity cannot be negative" });
        }

        // Cập nhật số lượng variant
        product.pVariants[variantIndex].quantity = newVariantQuantity;

        // Tính lại tổng số lượng từ tất cả variants
        const totalQuantity = product.pVariants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
        product.pQuantity = totalQuantity;

        await product.save();
        return res.json({ 
          success: "Variant stock updated successfully",
          product: product 
        });
      } else {
        // Cập nhật số lượng tổng (pQuantity)
        const newQuantity = parseInt(quantity) || 0;
        if (newQuantity < 0) {
          return res.json({ error: "Quantity cannot be negative" });
        }

        product.pQuantity = newQuantity;
        await product.save();
        return res.json({ 
          success: "Product stock updated successfully",
          product: product 
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: "Failed to update stock" });
    }
  }

  // Lấy tất cả sản phẩm với thông tin kho
  async getAllProductWithStock(req, res) {
    try {
      let products = await productModel
        .find()
        .populate("pCategory", "cName")
        .sort({ createdAt: -1 });
      if (products) {
        return res.json({ Products: products });
      }
    } catch (err) {
      return res.json({ error: "Failed to fetch products" });
    }
  }
}

const productController = new Product();
module.exports = productController;
