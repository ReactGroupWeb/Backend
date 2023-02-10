const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const { ShoppingCart } = require('../models/shoppingcart')
// const { Product } = require('../models/product')
// display all cart items
router.get(`/`, async (req, res) => {

    const shoppingCart = await ShoppingCart.find().populate(["product", "user"]).select("-passwordHash");
    if(!shoppingCart){
        return res.status(500).json({success: false});
    }

    res.send(shoppingCart);
});

// get all the cart item by each user
router.get(`/cart-item/:userid`, async (req, res) => {

    const userId = req.params.userid;

    if(!mongoose.isValidObjectId(userId)){
        return res.status(500).json({success: false});
    }

    const cartItem = await ShoppingCart.find({user: userId}).populate(["product", "user"]);
    if(!cartItem){
        return res.status(500).send({cart: "Cart is empty..."});
    }
    res.send(cartItem);
    
});

// add item to cart
router.post(`/add-cart-item`, async (req, res) => {
    const body = req.body;

    let shoppingCartItem = new ShoppingCart({
        user: body.user,
        product: body.product,
        instance: body.instance,
        quantity: body.quantity
    });


    shoppingCartItem = await shoppingCartItem.save();

    if(!shoppingCartItem){
        return res.status(500).json({success: false});
    }

    res.send(shoppingCartItem);
});

// remove the cart item
router.delete(`/:id`, async (req, res) => {

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(500).json({success: false}).send("Invalid Product ID");
    }


    const deleteCartItem = await ShoppingCart.findByIdAndRemove(req.params.id);

    if(!deleteCartItem){
        return res.status(500).json({success: false});
    }

    res.status(200).json({success: true, messaage: "Delete Successfully"});
});

// count all the cart item number
router.get(`/get/cart_item_count`, async (req, res) => {
    const countCartItem = await ShoppingCart.countDocuments();

    if(!countCartItem){
        return res.status(500).json({success: false});
    }

    res.send({countCartItem: countCartItem});
});


// count the number of cart item by user id
router.get(`/get/cart_item_count/:userId`, async (req, res) => {
    const userID = req.params.userId;
    
    const countCartItem = await ShoppingCart.find({user: userID}).countDocuments();
    if(!countCartItem){
        return res.status(500).send({countCartItem: "cart item is empty..."});
    }

    return res.status(200).send({countCartItem: countCartItem});
});


module.exports = router;