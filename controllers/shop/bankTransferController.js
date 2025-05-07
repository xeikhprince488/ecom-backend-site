// backend/bankTransferController.js
const { sendConfirmationEmail } = require('./emailService'); // You can use nodemailer or any other service

// Mock bank account details for the transfer
const bankAccountDetails = {
  accountName: "Your Business Name",
  accountNumber: "1234567890",
  bankName: "Your Bank Name",
  branchCode: "XYZ123",
  iban: "PK36XXXXX1234567890",
  swiftCode: "XYZABC123",
};

const processBankTransfer = async (req, res) => {
  try {
    const { orderID, customerName, amountPaid, referenceNumber, transactionReceipt } = req.body;

    // Verify the orderID and amountPaid (checking against the database)
    // This can be extended to check if the amount and order match.
    // For now, we just log the received payment info.
    
    console.log(`Received payment info: ${orderID}, ${amountPaid}, ${referenceNumber}`);

    // Simulate the verification process (in a real app, this would include checking bank statements)
    const isValidTransaction = true; // This should be true if transaction is verified manually

    if (isValidTransaction) {
      // Update the order status to 'Paid' in the database (this is just a mock for demonstration)
      // For example: Order.update({ status: 'Paid' }, { where: { orderID } });

      // Send confirmation email to the customer (optional)
      await sendConfirmationEmail(customerName, orderID, amountPaid);
      
      res.json({ success: true, message: 'Payment successfully verified' });
    } else {
      res.status(400).json({ success: false, message: 'Transaction verification failed' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch Bank Account Details for Customers to Use
const getBankAccountDetails = (req, res) => {
  res.json(bankAccountDetails);
};

module.exports = { processBankTransfer, getBankAccountDetails };
