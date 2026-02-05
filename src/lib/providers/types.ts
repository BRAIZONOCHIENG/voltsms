export interface SMSOrder {
    orderId: string;
    phoneNumber: string;
    cost: number; // Cost in USD
    expiresAt?: Date;
    provider: string; // 'pvapins'
    country: string;
    service: string;
}

export interface SMSProvider {
    name: string;

    /**
     * Get current balance in USD
     */
    getBalance(): Promise<number>;

    /**
     * Purchase a number
     * @param service - Service slug (e.g. 'whatsapp', 'telegram')
     * @param country - ISO Country code (e.g. 'US', 'RU')
     */
    purchaseNumber(service: string, country: string): Promise<SMSOrder>;

    /**
     * Cancel an active order (if supported)
     */
    cancelOrder(orderId: string): Promise<boolean>;

    /**
     * Check for SMS code
     * Returns:
     * - string: The code (if received)
     * - null: No code yet (pending)
     */
    getSMS(orderId: string): Promise<string | null>;
}
