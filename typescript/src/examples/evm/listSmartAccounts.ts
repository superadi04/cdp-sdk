// Usage: pnpm tsx src/examples/evm/listSmartAccounts.ts

import { config } from "dotenv";

import { CdpClient } from "../../index";

/**
 * This example shows how to list EVM smart accounts
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

  let page = await cdp.evm.listSmartAccounts();

  page.accounts.forEach(account => console.log(account.address));

  while (page.nextPageToken) {
    page = await cdp.evm.listSmartAccounts({ pageToken: page.nextPageToken });
    page.accounts.forEach(account => console.log(account.address));
  }
}

main().catch(console.error);
