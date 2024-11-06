const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    shipTo: {
      type: Object,
      required: true,
    },
    contact: {
      type: Object,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.ObjectId,
      ref: User,
      required: true,
    },
    status: {
      type: String,
      default: "preparing",
    },
    orderNum: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.ObjectId,
          ref: Product,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          default: 1,
        },
        size: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        sale: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);
orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.updateAt;
  return obj;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
