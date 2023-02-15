const mongoose = require("mongoose");


const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  firstname : { 
      type: String, 
      require: true 
  },
  lastname: { 
      type: String, 
      require: true 
  },
  phone: { 
      type: Number, 
      require: true 
  },
  email: { 
      type: String, 
       require: true
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Ordered",
  },
  tax: { 
    type: Number, 
    default: 10
  },
  subTotal: { 
    type: Number, 
    default: 0 
  },
  totalPrice: { 
    type: Number, 
    default: 0 
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  dateDelivered: {
    type: Date,
    default: "",
  },
  dateSuccess: {
    type: Date,
    default: "",
  },
  Tmode: {
    type: Boolean,
    default: false, //   false (cash) \\\\\\\\\\\\\  True (Payment Card)
  },
  Tstatus: {
    type: Boolean,
    default: false, //   false (Pending) \\\\\\\\\\\\\  True (purchesed)
  },
  TDate: {
    type: Date,
    default: "",
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);

/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */
