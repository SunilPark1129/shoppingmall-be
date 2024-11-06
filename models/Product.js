const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Array,
      required: true,
    },
    image: {
      type: Array,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    sale: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
productSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.updateAt;
  return obj;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
