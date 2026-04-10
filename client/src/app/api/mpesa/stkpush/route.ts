import { NextRequest, NextResponse } from "next/server";
import { getMpesaAuthToken, getMpesaPassword } from "@/lib/services/mpesa";

/**
 * POST /api/mpesa/stkpush
 *
 * Initiates an M-Pesa STK Push to the customer's phone.
 * All Daraja credentials stay server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, amount } = await request.json();

    if (!phone || !amount) {
      return NextResponse.json({ error: "Phone and amount are required." }, { status: 400 });
    }

    const formattedPhone = phone.replace(/^0/, "254").replace(/^\+/, "");
    const token = await getMpesaAuthToken();
    const { password, timestamp } = getMpesaPassword();
    const shortcode = process.env.MPESA_SHORTCODE!;

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
      TransactionDesc: "POS Payment Checkout",
    };

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[DARAJA] STK Push failed:", data);
      return NextResponse.json(
        { error: data.errorMessage || "STK Push Blocked by Safaricom" },
        { status: 400 }
      );
    }

    console.log(`✅ [DARAJA] STK Sent! CheckoutRequestID: ${data.CheckoutRequestID}`);
    return NextResponse.json({ success: true, CheckoutRequestID: data.CheckoutRequestID });
  } catch (err) {
    console.error("[DARAJA] STK Push error:", err);
    return NextResponse.json({ error: "STK Push failed." }, { status: 500 });
  }
}
