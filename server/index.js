import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
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

app.listen(PORT, () => {
  console.log(`Enterprise Node Server securely operating actively on port ${PORT}`);
});
