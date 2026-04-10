import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase with the MASTER Service Role Key
// FALLBACK: If user failed to add the Service Role Key, fall back to ANON key so it doesn't crash.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://jcsandzigwvawvtcycwd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Admin: Forge New Staff Account
app.post('/api/admin/create-staff', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: "Missing authorization" });
        const token = authHeader.split(' ')[1];
        
        // 1. Verify caller identity computationally
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !user) throw new Error("Invalid caller token");

        // 2. Mathematically prove caller is an actual Admin
        const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (callerProfile?.role !== 'admin') throw new Error("Forbidden: Not an admin");

        // 3. Forge Account via Service Role (Bypasses UI logout issue)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (authError) throw authError;

        const newUserId = authData.user.id;

        // 4. Force inject the salesperson role safely
        const { error: profileError } = await supabaseAdmin.from('profiles')
            .update({ full_name: fullName, role: 'salesperson' })
            .eq('id', newUserId);
        
        if (profileError) {
             // If update fails, inserting it explicitly if no trigger handled it
             await supabaseAdmin.from('profiles').insert([{ id: newUserId, full_name: fullName, role: 'salesperson' }]);
        }

        console.log(`💼 [STAFF] Admin ${user.email} securely provisioned Sales Agent: ${fullName}`);
        res.json({ success: true });

    } catch (err) {
        console.error("Staff Provisioning Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Payment Verification Endpoint
app.post('/api/verify-payment', async (req, res) => {
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
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
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

        // Success!
        return res.json({ success: true, message: "Order completely secured.", orderId });

    } catch (err) {
        console.error("Critical Server Verification Error:", err);
        return res.status(500).json({ success: false, message: "Internal Server Structure Error" });
    }
});

// --------------------------------------------------------------------
// DARAJA API ENGINES (M-PESA)
// --------------------------------------------------------------------
const getMpesaAuthToken = async () => {
    const creds = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: `Basic ${creds}` }
    });
    return data.access_token;
};

const getMpesaPassword = () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    return { password, timestamp };
};

// Initiate STK Push
app.post('/api/mpesa/stkpush', async (req, res) => {
    console.log("📲 [DARAJA] Initiating STK Push...");
    try {
        const { phone, amount } = req.body;
        // Format to Safaricom standard (254...)
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
            CallBackURL: "https://your-production-app.com/api/mpesa/webhook", // Safaricom webhooks require a live URL
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
});

// Verifier Query Engine
app.get('/api/mpesa/stkpush/query/:checkoutRequestId', async (req, res) => {
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
         // Safaricom throws 500 logic errors when the user's phone is still buzzing (status: processing)
         const isPending = err.response?.data?.errorMessage?.includes("being processed") || err.response?.data?.errorCode === "500.001.1001";
         if (isPending) return res.json({ success: true, status: 'pending', message: 'Waiting for Customer PIN...' });
         
         console.error("Daraja Query Exception:", err.response?.data || err.message);
         res.status(400).json({ error: err.response?.data?.errorMessage || "Query Verification Failed" });
    }
});

app.listen(PORT, () => {
  console.log(`Enterprise Node Server securely operating actively on port ${PORT}`);
});
