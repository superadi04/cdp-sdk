// Usage: pnpm tsx src/examples/solana/signMessage.ts

import { config } from "dotenv";

import { CdpClient } from "../../client/cdp";

/**
 * This example shows how to sign a message using a Solana wallet
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

  let address: string;
  try {
    const account = await cdp.solana.createAccount();
    console.log("Successfully created Solana account:", account.address);
    address = account.address;
  } catch (error) {
    console.error("Error creating Solana account:", error);
    return;
  }

  const signature = await cdp.solana.signMessage({
    address,
    message: "Hello, world!",
  });

  console.log("Successfully signed message:", signature);
}

main().catch(console.error);
