
// Map of Currency Symbol -> { Network -> Address }
// Used to validate supported coins and determine forwarding destination.

export const SMSPOOL_ADDRESSES: Record<string, string> = {
    'XMR': '8B42SRthfCwWMAD7kRtza5AUkuNBtwEZcXiXdwt5HufY3cPoRfAKrLg8cbKrPQXhpw43FRWpd5ALF5ZFqyBrHm4RKx4cX7k',
    'BTC': 'bc1qxlyqs667n4scttja605pmys8jvkjh80ceuxrrj',
    'ETH': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'TRX': 'TVscxwavUjxXLQ3TquMhs3KV4GSLqg94y4',
    'SOL': '9VMSFJVYGaTHdmJ2A5W9XU3z7wA7Sqwt9eYkoq34zNem',
    'MATIC': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'POL': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'LTC': 'ltc1qzthwp4l9d2urt0nf524zv9d4znpkkqumrnzpey',
    'BNB': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'DOGE': 'DJKegqxZGJJNHqzhDJv1jqjupUHizGRx8D', // Corrected DODE -> DOGE
    'DAI': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'SHIB': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'AVAX': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'LINK': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
    'BCH': 'qppnsltrwggln09jxs43fy7exjpcck3za5duktc79m',
    'USDT': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0', // BSC/ERC20 address
    'USDC': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0'  // BSC/ERC20 address
};

// Map OxaPay ID to specific address if needed (e.g. USDT-TRC20 vs USDT-ERC20)
// For now we assume the EVM address covers most, but we must be careful with TRC20.
// User only provided one EVM-looking address for USDT(BSC). 
// If they support TRC20, we need a TRX address mapped. 
// We will map USDT-TRC20 to the TRX address provided.

export const NETWORK_SPECIFIC_MAP: Record<string, Record<string, string>> = {
    'USDT': {
        'TRC20': 'TVscxwavUjxXLQ3TquMhs3KV4GSLqg94y4', // Fallback to TRX address for TRC20
        'ERC20': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
        'BEP20': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
        'BSC': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0'
    },
    'USDC': {
        'ERC20': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
        'BEP20': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0',
        'BSC': '0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0'
    }
};

export const SUPPORTED_COINS = Object.keys(SMSPOOL_ADDRESSES);
