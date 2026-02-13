import { createClient } from '@supabase/supabase-js';
import { getHDWallet } from './hdwallet';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Service to manage and allocate unique deposit addresses to users.
 */
export class AddressAllocator {
    /**
     * Get or create a unique deposit address for a user.
     */
    public async getOrCreateAddress(userId: string): Promise<string> {
        // 1. Check if user already has an address
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('deposit_address, derivation_index')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (user?.deposit_address) {
            return user.deposit_address;
        }

        // 2. Allocate new index
        const { data: maxIndexData, error: maxError } = await supabase
            .from('users')
            .select('derivation_index')
            .order('derivation_index', { ascending: false })
            .limit(1)
            .single();

        let nextIndex = 0;
        if (maxIndexData && maxIndexData.derivation_index !== null) {
            nextIndex = maxIndexData.derivation_index + 1;
        }

        // 3. Derive Address
        const hdWallet = getHDWallet();
        const newAddress = hdWallet.deriveAddress(nextIndex);

        // 4. Save to User
        const { error: updateError } = await supabase
            .from('users')
            .update({
                deposit_address: newAddress,
                derivation_index: nextIndex
            })
            .eq('user_id', userId);

        if (updateError) {
            // If there's a race condition (unique constraint hit), retry once
            if (updateError.code === '23505') {
                return this.getOrCreateAddress(userId);
            }
            throw updateError;
        }

        return newAddress;
    }
}

export const addressAllocator = new AddressAllocator();
