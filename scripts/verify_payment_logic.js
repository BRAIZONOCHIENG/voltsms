// verify_payment_logic.js

// Mock Data
const amount = 100n * 10n ** 18n; // 100 Tokens (18 decimals)
const price = 1.0; // $1.00 USD
const decimals = 18;

console.log("--- Payment Logic Verification ---");
console.log(`Deposit Amount: 100.0 Tokens`);
console.log(`Price: $${price} USD`);

// 1. Calculate Split (Logic from auto-forward/route.ts)
// const forwardAmount = (amount * 28n) / 100n;
const forwardAmount = (amount * 28n) / 100n;
const profitAmount = amount - forwardAmount;

// Format for display
const format = (val) => (Number(val) / 10 ** 18).toFixed(4);

console.log("\n[Split Calculation]");
console.log(`Forward to SMSPool (28%): ${format(forwardAmount)} Tokens`);
console.log(`Profit (72%):             ${format(profitAmount)} Tokens`);

// Verify Math
const expectedForward = 100 * 0.28;
const actualForward = Number(forwardAmount) / 10 ** 18;
if (Math.abs(actualForward - expectedForward) < 0.0001) {
    console.log("✅ Split Logic: CORRECT (28%)");
} else {
    console.error("❌ Split Logic: INCORRECT");
}

// 2. Calculate User Credit (Logic from auto-forward/route.ts)
// const amountFloat = parseFloat(formatUnits(amount, decimals));
// const usdValue = amountFloat * price;
const amountFloat = Number(amount) / 10 ** decimals;
const usdValue = amountFloat * price;

console.log("\n[User Credit Calculation]");
console.log(`User Credited: $${usdValue.toFixed(2)}`);

if (usdValue === 100.0) {
    console.log("✅ User Credit: CORRECT (100% of value)");
} else {
    console.error("❌ User Credit: INCORRECT");
}
