// Usage: pnpm tsx src/examples/evm/requestFaucet.ts

import { config } from "dotenv";

import { CdpClient } from "../../index";

/**
 * This example shows how to request faucet funds for an EVM account
 */
async function main() {
  config();

  const apiKeyId = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.CDP_WALLET_SECRET;
  const basePath = process.env.CDP_API_URL;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    throw new Error("Missing required environment variables");
  }

  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
    basePath,
  });

  const account = await cdp.evm.createAccount();
  const faucetResult = await cdp.evm.requestFaucet({
    address: account.address,
    network: "base-sepolia",
    token: "eth",
  });

  console.log("Faucet Result: ", faucetResult);
}

main().catch(console.error);
