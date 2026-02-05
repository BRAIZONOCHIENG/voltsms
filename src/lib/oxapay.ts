
export interface PayoutRequest {
    address: string;
    amount: number; // in USD (or the currency specified, usually we calculate in USD then convert or send as stablecoin)
    currency: string; // e.g., 'USDT', 'LTC', 'SOL'
    network?: string;
}

export interface PayoutResponse {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * Trigger an instant payout via OxaPay to a specific address.
 * Used for auto-forwarding funds to SMSPool.
 */
export async function sendPayout(req: PayoutRequest): Promise<PayoutResponse> {
    const apiKey = process.env.OXAPAY_MERCHANT_KEY; // Using merchant key for payouts if allowed, or needing a specific payout key

    // NOTE: OxaPay Payouts usually require a specialized endpoint (Private API or Merchant Payout API).
    // According to standard OxaPay docs, the endpoint is /api/v1/payout
    // We will assume 'USDT' (TRC20/ERC20) or 'SOL' based on what SMSPool accepts.
    // SMSPool usually accepts Litecoin (LTC) or SOL for low fees.

    // For this implementation, we will try to calculate the equivalent amount and send it.
    // However, since we might hold funds in mixed currencies, this is complex.
    // SAFE APPROACH: We log the request and try to find a compatible balance.

    // If we are just forwarding the SAME currency the user deposited:
    // User deposits 100 USDT -> We forward 40 USDT. This works.
    // If User deposits BTC -> We might not want to forward BTC (high fees).

    if (!apiKey) {
        console.error("Missing OXAPAY_MERCHANT_KEY");
        return { success: false, message: "Configuration Error" };
    }

    try {
        const payload = {
            address: req.address,
            amount: req.amount,
            currency: req.currency,
            network: req.network
        };

        console.log("Attempting OxaPay Payout:", payload);

        const res = await fetch('https://api.oxapay.com/api/v1/payout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Verify auth method for Payouts
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === 200 || data.success) {
            return { success: true, data: data };
        } else {
            console.error("OxaPay Payout Failed:", data);
            return { success: false, message: data.message || "Payout Failed" };
        }
    } catch (error: any) {
        console.error("OxaPay Payout Exception:", error);
        return { success: false, message: error.message };
    }
}
