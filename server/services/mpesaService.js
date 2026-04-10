import axios from 'axios';

export const getMpesaAuthToken = async () => {
    const creds = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: `Basic ${creds}` }
    });
    return data.access_token;
};

export const getMpesaPassword = () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    return { password, timestamp };
};
