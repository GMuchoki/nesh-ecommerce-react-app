import { NextRequest, NextResponse } from "next/server";
import { getMpesaAuthToken, getMpesaPassword } from "@/lib/services/mpesa";

/**
 * GET /api/mpesa/stkpush/query/[checkoutRequestId]
 *
 * Queries Safaricom for the status of an STK Push transaction.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  try {
    const { checkoutRequestId } = await params;
    const token = await getMpesaAuthToken();
    const { password, timestamp } = getMpesaPassword();

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE!,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.errorMessage || "";

      // Safaricom returns a 500 when the transaction is still processing
      const isPending =
        errorMessage.includes("being processed") ||
        errorData?.errorCode === "500.001.1001";

      if (isPending) {
        return NextResponse.json({
          success: true,
          status: "pending",
          message: "Waiting for Customer PIN...",
        });
      }

      return NextResponse.json(
        { error: errorMessage || "Query Verification Failed" },
        { status: 400 }
      );
    }

    const data = await response.json();
    const resultCode = data.ResultCode;

    if (resultCode === "0") {
      return NextResponse.json({
        success: true,
        status: "paid",
        message: data.ResultDesc,
      });
    }

    return NextResponse.json({
      success: true,
      status: "failed",
      message: data.ResultDesc,
    });
  } catch (err) {
    console.error("[DARAJA] Query error:", err);
    return NextResponse.json({ error: "Query Verification Failed" }, { status: 500 });
  }
}
