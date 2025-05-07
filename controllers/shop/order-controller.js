const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const paypal = require("../../helpers/paypal");

// Function to create order
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,  // Either "paypal" or "payOnDelivery"
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    let approvalURL = null;

    // Validate userId (check if it's a valid Mongo ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Check if the payment method is PayPal
    if (paymentMethod === "paypal") {
      // PayPal payment creation
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:5173/shop/paypal-return",
          cancel_url: "http://localhost:5173/shop/paypal-cancel",
        },
        transactions: [
          {
            item_list: {
              items: cartItems.map((item) => ({
                name: item.title,
                sku: item.productId,
                price: item.price.toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              })),
            },
            amount: {
              currency: "USD",
              total: totalAmount.toFixed(2),
            },
            description: "description",
          },
        ],
      };

      const paypalPayment = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, paymentInfo) => {
          if (error) {
            reject(error);
          } else {
            resolve(paymentInfo);
          }
        });
      });

      approvalURL = paypalPayment.links.find((link) => link.rel === "approval_url").href;
    }

    // Create the order regardless of the payment method (PayPal or Pay on Delivery)
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: orderStatus || "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "payOnDelivery" ? "pending" : paymentStatus, // For Pay on Delivery, keep it pending
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: paymentMethod === "paypal" ? paymentId : "",  // Only set paymentId if it's PayPal
      payerId: paymentMethod === "paypal" ? payerId : "",  // Only set payerId if it's PayPal
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      approvalURL,
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Function to capture PayPal payment or handle Pay on Delivery
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId, paymentMethod } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    // Validate userId (check if it's a valid Mongo ObjectId)
    if (!mongoose.Types.ObjectId.isValid(order.userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId in order" });
    }

    if (paymentMethod === "paypal") {
      // PayPal-specific logic: capture PayPal payment (no change needed here)
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paymentId = paymentId;
      order.payerId = payerId;
    } else if (paymentMethod === "payOnDelivery") {
      // For Pay on Delivery, mark the order as confirmed but payment is still pending
      order.paymentStatus = "pending"; // Payment is pending until delivery
      order.orderStatus = "confirmed"; // Order is confirmed
    }

    // Deduct stock from products based on the order items
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId); // Delete cart after order creation

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Get all orders by user
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Get order details by order ID
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Function to delete cart item (example function)
const deleteCartItem = async (req, res) => {
  try {
    const { userId, cartItemId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Validate cartItemId
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cartItemId",
      });
    }

    // Find and delete the item from cart
    const cart = await Cart.findOneAndUpdate(
      { userId, "items._id": cartItemId },
      { $pull: { items: { _id: cartItemId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  deleteCartItem,
};
