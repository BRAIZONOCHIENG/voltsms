const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const privateKey = process.env.ETH_PRIVATE_KEY;
    const profitWallet = process.env.NEXT_PUBLIC_PROFIT_WALLET_EVM;
    
    if (!privateKey || !profitWallet) {
        console.error("Missing ETH_PRIVATE_KEY or NEXT_PUBLIC_PROFIT_WALLET_EVM");
        process.exit(1);
    }

    console.log("Compiling VoltSplitter.sol...");
    const contractPath = path.resolve(__dirname, '../contracts/VoltSplitter.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'VoltSplitter.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        // Check if errors are actual errors
        const hasError = output.errors.some(err => err.severity === 'error');
        if (hasError) process.exit(1);
    }

    const contractFile = output.contracts['VoltSplitter.sol']['VoltSplitter'];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    console.log("Compilation successful.");

    // Provider for BSC Mainnet
    const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying from: ${wallet.address}`);
    console.log(`Profit Wallet: ${profitWallet}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(profitWallet);

    console.log("Waiting for deployment transaction...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`VoltSplitter deployed to: ${address}`);
}

main().catch(console.error);
