import { mnemonicToAccount, english } from 'viem/accounts';
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';

/**
 * HD Wallet utility for deriving unique deposit addresses
 */
export class HDWallet {
    private mnemonic: string;

    constructor(mnemonic: string) {
        this.mnemonic = mnemonic;
    }

    /**
     * Derives an address from the master mnemonic using a specific index.
     * Path: m/44'/60'/0'/0/index (Standard Ethereum/BSC path)
     */
    public deriveAddress(index: number) {
        const account = mnemonicToAccount(this.mnemonic, {
            path: `m/44'/60'/0'/0/${index}`,
        });
        return account.address;
    }

    /**
     * Get the account object (including private key) for a specific index.
     * Use this ONLY on the backend for sweeping funds.
     */
    public getAccount(index: number) {
        return mnemonicToAccount(this.mnemonic, {
            path: `m/44'/60'/0'/0/${index}`,
        });
    }
}

// Global instance helper
export function getHDWallet() {
    const mnemonic = process.env.DEPOSIT_MNEMONIC;
    if (!mnemonic) {
        throw new Error('DEPOSIT_MNEMONIC is not set in environment variables');
    }
    return new HDWallet(mnemonic);
}
