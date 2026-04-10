/**
 * M-Pesa Daraja Service — Server-Only
 * Handles OAuth token generation and password computation
 * for Safaricom STK Push integration.
 *
 * NEVER import this from a client component.
 */

export async function getMpesaAuthToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${creds}` } }
  );

  if (!response.ok) {
    throw new Error(`Daraja OAuth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export function getMpesaPassword(): { password: string; timestamp: string } {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const passkey = process.env.MPESA_PASSKEY!;
  const shortcode = process.env.MPESA_SHORTCODE!;
  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");
  return { password, timestamp };
}
