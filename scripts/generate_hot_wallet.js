const { generatePrivateKey, privateKeyToAccount } = require('viem/accounts');

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log('HOT_WALLET_PRIVATE_KEY=' + privateKey);
console.log('NEXT_PUBLIC_HOT_WALLET_ADDRESS=' + account.address);
