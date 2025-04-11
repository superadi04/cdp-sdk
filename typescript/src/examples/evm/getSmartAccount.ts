// Usage: pnpm tsx src/examples/evm/getSmartAccount.ts

import { config } from "dotenv";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { CdpClient } from "../../index";

/**
 * This example shows how to get an EVM smart account
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

  const privateKey = generatePrivateKey();
  const owner = privateKeyToAccount(privateKey);

  const smartAccount = await cdp.evm.createSmartAccount({ owner });

  const retrievedSmartAccount = await cdp.evm.getSmartAccount({
    address: smartAccount.address,
    owner,
  });

  console.log("Retrieved Smart Account: ", retrievedSmartAccount);
}

main().catch(console.error);
