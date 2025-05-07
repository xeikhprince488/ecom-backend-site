const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "live", // or "sandbox" for testing
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
