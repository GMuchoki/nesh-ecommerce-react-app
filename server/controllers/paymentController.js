import { supabaseAdmin } from '../config/supabase.js';
import axios from 'axios';
import crypto from 'crypto';
import { getMpesaAuthToken, getMpesaPassword } from '../services/mpesaService.js';

export const verifyPaystackOrder = async (req, res) => {
    console.log("\n-----------------------------------------");
    console.log("📥 [SERVER PING] Incoming Checkout Verification...");
    
    try {
        const { reference, guestEmail, userId, cart, totalAmount } = req.body;
        console.log(`🔍 Verifying Paystack Reference: [${reference}] for email: ${guestEmail}`);

        if (!reference || !cart || cart.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        // 1. Verify Payment via Paystack
        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        const paystackData = await paystackRes.json();

        if (!paystackData.status || paystackData.data.status !== 'success') {
            console.error("Paystack API explicitly rejected verification:", paystackData);
            return res.status(400).json({ success: false, message: "Payment verification failed or not completed." });
        }

        // 2. Mathematically check amount matches (Paystack sends amounts in cents/kobo)
        const expectedCents = Math.round(totalAmount * 100);
        if (paystackData.data.amount < expectedCents) {
            console.warn(`Amount mismatch detected. Expected ${expectedCents}, Got ${paystackData.data.amount}`);
            return res.status(400).json({ success: false, message: "Payment amount mismatch detected. Order rejected." });
        }
        
        const orderId = crypto.randomUUID();

        // 3. Securely Insert the Order into Supabase
        const { error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([{
                id: orderId,
                customer_id: userId || null,
                guest_email: guestEmail,
                total_amount: totalAmount,
                status: 'pending' // Strictly Enforced server-side status
            }]);

        if (orderError) throw orderError;

        // 4. Securely Insert the Items
        const items = cart.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.qty,
            unit_price: item.price
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(items);

        if (itemsError) throw itemsError;

        console.log(`✅ [DATABASE] Order ${orderId} successfully injected into Supabase via Service Role.`);
        console.log("-----------------------------------------\n");

        return res.json({ success: true, message: "Order completely secured.", orderId });

    } catch (err) {
        console.error("Critical Server Verification Error:", err);
        return res.status(500).json({ success: false, message: "Internal Server Structure Error" });
    }
};

export const initiateMpesaPush = async (req, res) => {
    console.log("📲 [DARAJA] Initiating STK Push...");
    try {
        const { phone, amount } = req.body;
        let formattedPhone = phone.replace(/^0/, '254').replace(/^\+/, '');

        const token = await getMpesaAuthToken();
        const { password, timestamp } = getMpesaPassword();
        const shortcode = process.env.MPESA_SHORTCODE;

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: "https://your-production-app.com/api/mpesa/webhook", 
            AccountReference: "NeshStore",
            TransactionDesc: "POS Payment Checkout"
        };
        
        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ [DARAJA] Sent! CheckoutRequestID: ${response.data.CheckoutRequestID}`);
        res.json({ success: true, CheckoutRequestID: response.data.CheckoutRequestID });
    } catch (err) {
        console.error("STK Push Failed:", err.response?.data || err.message);
        res.status(400).json({ error: err.response?.data?.errorMessage || "STK Push Blocked by Safaricom" });
    }
};

export const queryMpesaStatus = async (req, res) => {
    try {
        const token = await getMpesaAuthToken();
        const { password, timestamp } = getMpesaPassword();
        
        const payload = {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: req.params.checkoutRequestId
        };

        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const resultCode = response.data.ResultCode;
        if (resultCode === "0") {
            return res.json({ success: true, status: 'paid', message: response.data.ResultDesc });
        } else {
            return res.json({ success: true, status: 'failed', message: response.data.ResultDesc });
        }
    } catch (err) {
         const isPending = err.response?.data?.errorMessage?.includes("being processed") || err.response?.data?.errorCode === "500.001.1001";
         if (isPending) return res.json({ success: true, status: 'pending', message: 'Waiting for Customer PIN...' });
         
         console.error("Daraja Query Exception:", err.response?.data || err.message);
         res.status(400).json({ error: err.response?.data?.errorMessage || "Query Verification Failed" });
    }
};
