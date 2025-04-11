// Usage: pnpm tsx src/examples/evm/createSmartAccount.ts

import { config } from "dotenv";

import { CdpClient } from "../../index";

/**
 * This example shows how to create a new EVM smart account
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

  const smartAccount = await cdp.evm.createSmartAccount({
    owner: account,
  });

  console.log("EVM Smart Account Address: ", smartAccount.address);
}

main().catch(console.error);
