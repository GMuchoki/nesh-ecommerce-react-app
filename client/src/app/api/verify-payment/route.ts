import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * POST /api/verify-payment
 *
 * Secure payment verification with server-side price calculation.
 * The frontend sends cart items (product IDs + quantities) but NOT the total.
 * The server independently calculates the real total from the database,
 * then verifies it against what Paystack actually collected.
 */
export async function POST(request: NextRequest) {
  try {
    const { reference, guestEmail, userId, cart } = await request.json();

    // ── Validation ──
    if (!reference || !cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payload: missing reference or cart" },
        { status: 400 }
      );
    }

    // ── Step 1: Verify payment with Paystack using SECRET key ──
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      console.error("[PAYSTACK] Verification rejected:", paystackData);
      return NextResponse.json(
        { success: false, message: "Payment verification failed or not completed." },
        { status: 400 }
      );
    }

    // ── Step 2: Calculate REAL total from database (PRICE TRUST FIX) ──
    const productIds = cart.map((item: { id: string }) => item.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError || !products || products.length === 0) {
      console.error("[DB] Failed to look up product prices:", productsError);
      return NextResponse.json(
        { success: false, message: "Could not verify product prices." },
        { status: 500 }
      );
    }

    // Build a price lookup map
    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    // Calculate the server-authoritative total
    let serverTotal = 0;
    const verifiedItems: Array<{ product_id: string; quantity: number; unit_price: number }> = [];

    for (const item of cart) {
      const realPrice = priceMap.get(item.id);
      if (realPrice === undefined) {
        return NextResponse.json(
          { success: false, message: `Product ${item.id} not found in database.` },
          { status: 400 }
        );
      }
      const qty = Number(item.qty) || 1;
      serverTotal += realPrice * qty;
      verifiedItems.push({ product_id: item.id, quantity: qty, unit_price: realPrice });
    }

    // ── Step 3: Compare Paystack amount vs server total ──
    const expectedCents = Math.round(serverTotal * 100);
    const paystackCents = paystackData.data.amount;

    if (paystackCents < expectedCents) {
      console.warn(
        `[SECURITY] Amount mismatch! Paystack: ${paystackCents}, Expected: ${expectedCents}`
      );
      return NextResponse.json(
        { success: false, message: "Payment amount mismatch detected. Order rejected." },
        { status: 400 }
      );
    }

    // ── Step 4: Insert order via Service Role ──
    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabaseAdmin.from("orders").insert([
      {
        id: orderId,
        customer_id: userId || null,
        guest_email: guestEmail,
        total_amount: serverTotal,
        status: "pending",
      },
    ]);
    if (orderError) throw orderError;

    // ── Step 5: Insert order items with VERIFIED prices ──
    const orderItems = verifiedItems.map((item) => ({
      order_id: orderId,
      ...item,
    }));

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    console.log(`✅ [ORDER] ${orderId} secured. Server total: Ksh ${serverTotal}`);

    return NextResponse.json({ success: true, message: "Order completely secured.", orderId });
  } catch (err) {
    console.error("[CRITICAL] Payment verification error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
