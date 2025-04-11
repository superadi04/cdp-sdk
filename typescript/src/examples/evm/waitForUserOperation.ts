// Usage: pnpm tsx src/examples/evm/waitForUserOperation.ts

import { config } from "dotenv";
import { parseEther } from "viem";

import { CdpClient } from "../../index";

/**
 * This example shows how to create a new EVM server account, create a smart account,
 * and send a user operation
 */
async function main() {
  config();

  const apiKeyName = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.CDP_WALLET_SECRET;
  const apiUrl = process.env.CDP_API_URL;

  if (!apiKeyName || !apiKeySecret || !walletSecret) {
    throw new Error("Missing required environment variables");
  }

  const cdp = new CdpClient({
    apiKeyId: apiKeyName,
    apiKeySecret,
    walletSecret,
    basePath: apiUrl,
  });

  const account = await cdp.evm.createAccount();
  const smartAccount = await cdp.evm.createSmartAccount({ owner: account });

  await cdp.evm.requestFaucet({
    address: smartAccount.address,
    network: "base-sepolia",
    token: "eth",
  });

  console.log("Sleeping for 5 seconds to allow for faucet to be processed");
  await new Promise(resolve => setTimeout(resolve, 5000));

  const { userOpHash } = await cdp.evm.sendUserOperation({
    smartAccount,
    network: "base-sepolia",
    calls: [
      {
        to: "0x0000000000000000000000000000000000000000",
        value: parseEther("0.000001"),
        data: "0x",
      },
    ],
  });

  const userOperationResult = await cdp.evm.waitForUserOperation({
    userOpHash,
    smartAccountAddress: smartAccount.address,
  });

  console.log("User Operation Result: ", userOperationResult);
}

main().catch(console.error);
