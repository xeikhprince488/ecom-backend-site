

// backend/paymentRoutes.js
const express = require('express');
const { processBankTransfer, getBankAccountDetails } = require('../../controllers/shop/bankTransferController');

const router = express.Router();

// Route to fetch bank account details
router.get('/payment/bank-transfer-details', getBankAccountDetails);

// Route to verify bank transfer payment
router.post('/payment/verify-bank-transfer', processBankTransfer);

module.exports = router;
