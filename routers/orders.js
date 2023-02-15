const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const mongoose = require("mongoose");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user")
    .sort({ dateOrdered: -1 });
  if (!orderList) res.status(500).json({ success: false });
  res.send(orderList);
});

// get order item by each user
router.get(`/item-order/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if(!mongoose.isValidObjectId(userId)){
    return res.status(400).json({success: false});
  }
  const orderList = await Order.find({user: userId, status: { $in :["Delivering", "Success"] } }).sort({"dateOrdered": -1});
  if(!orderList){
    return res.status(404).json({ success: false });
  }

  return res.send(orderList);
});


// get all user ordered
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) res.status(500).json({ success: false });
  res.send(order);
});


router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  // const totalPrices = await Promise.all(
  //   orderItemsIdsResolved.map(async (orderItemId) => {
  //     const orderItem = await OrderItem.findById(orderItemId).populate(
  //       "product",
  //       "salePrice"
  //     );
  //     const totalPrice = orderItem.product.salePrice * orderItem.quantity;
  //     return totalPrice;
  //   })
  // );
  // const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    user: req.body.user,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    shippingAddress: req.body.shippingAddress,
    city: req.body.city,
    country: req.body.country,
    tax: req.body.tax,
    subTotal: req.body.subTotal,
    status: req.body.status,
    totalPrice: req.body.totalPrice
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});


router.put("/:id", async (req, res) => {
  const state = await Order.findById(req.params.id).select("status -_id");
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: state.status == "Delivering" ? "Ordered" : "Delivering",
      dateDelivered: state.status != "Delivering" ? Date.now() : "",
    },
    { new: true }
  );
  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});


router.put("/success/:id", async (req, res) => {
  const orderId = req.params.id;

  if(!mongoose.isValidObjectId(orderId)){
    return res.status(404).json({success: false, message: "Order ID is not found..."});
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "Success",
      dateSuccess: Date.now(),
    },
    { new: true }
  );
  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});


router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});


router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});


router.get(`/getcount/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) res.status(500).json({ success: false });
  res.send({
    orderCount: orderCount,
  });
});


router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});


//sort the status
router.get(`/get/:type`, async (req, res) => {
  const orders = await Order.find({ status: req.params.type })
    .populate("user")
    .sort({ dateOrdered: -1 });
  if (!orders) res.status(500).json({ success: false });
  res.send(orders);
});


// count total purchased
router.get(`/total-purchased/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if(!mongoose.isValidObjectId(userId)){
    return res.status(400).json({success: false});
  }

  const totalPurchased = await Order.find({user: userId, status: { $in :["Ordered","Delivering", "Success"] } }).countDocuments();

  if(!totalPurchased){
    return res.sendStatus(400);
  }
  res.status(200).send({totalPurchased : totalPurchased});
});

// count total delivery
router.get(`/total-delivery/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if(!mongoose.isValidObjectId(userId)){
    return res.status(400).json({success: false});
  }

  const totalDelivery = await Order.find({user: userId, status: { $in :["Delivering", "Success"] } }).countDocuments();
  
  if(!totalDelivery){
    return res.sendStatus(400);
  }

  res.status(200).send({totalDelivery: totalDelivery});
});




module.exports = router;
