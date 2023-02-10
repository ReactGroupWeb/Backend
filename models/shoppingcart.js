const mongoose = require('mongoose');

const shoppingcartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    instance: {
        type: String,
        enum: ['cart','wishlist']
    },
    quantity: {
        type: Number
    }
});
/* 
    content : [
        {
            name: product.name,
            quantity: product.qty,
            subtotal: product.subtotal,
            totalprice: product.totalPrice,
            img: product.imamge
        }
    ]
*/
shoppingcartSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
  
shoppingcartSchema.set("toJSON", {
    virtuals: true,
});

exports.ShoppingCart = mongoose.model("ShoppingCart", shoppingcartSchema);