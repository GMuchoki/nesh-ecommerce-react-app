import express from 'express';
import { verifyPaystackOrder, initiateMpesaPush, queryMpesaStatus } from '../controllers/paymentController.js';

const router = express.Router();

// General / Paystack Checkouts
router.post('/verify-payment', verifyPaystackOrder);

// Daraja M-Pesa Integration
router.post('/mpesa/stkpush', initiateMpesaPush);
router.get('/mpesa/stkpush/query/:checkoutRequestId', queryMpesaStatus);

export default router;
