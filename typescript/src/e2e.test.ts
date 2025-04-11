import { describe, it, expect, beforeAll } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { serializeTransaction, parseEther, Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { CdpClient } from "./client/cdp";
import dotenv from "dotenv";

dotenv.config();

describe("CDP Client E2E Tests", () => {
  let cdpClient: CdpClient;

  beforeAll(() => {
    cdpClient = new CdpClient({
      apiKeyId: process.env.API_KEY_ID as string,
      apiKeySecret: process.env.API_KEY_SECRET as string,
      walletSecret: process.env.WALLET_SECRET as string,
      basePath: process.env.CDP_API_URL as string,
    });
  });

  it("should test env vars access", () => {
    expect(process.env.API_KEY_ID).toBeDefined();
    expect(process.env.API_KEY_SECRET).toBeDefined();
    expect(process.env.WALLET_SECRET).toBeDefined();
    expect(process.env.CDP_API_URL).toBeDefined();
  });

  it("should create, get, and list accounts", async () => {
    const randomName = generateRandomName();
    const serverAccount = await cdpClient.evm.createAccount({ name: randomName });
    expect(serverAccount).toBeDefined();

    const accounts = await cdpClient.evm.listAccounts();
    expect(accounts).toBeDefined();
    expect(accounts.accounts.length).toBeGreaterThan(0);

    let account = await cdpClient.evm.getAccount({ address: serverAccount.address });
    expect(account).toBeDefined();
    expect(account.address).toBe(serverAccount.address);
    expect(account.name).toBe(serverAccount.name);

    account = await cdpClient.evm.getAccount({ name: randomName });
    expect(account).toBeDefined();
    expect(account.address).toBe(serverAccount.address);
    expect(account.name).toBe(randomName);
  });

  it("should test evm sign functions", async () => {
    const account = await cdpClient.evm.createAccount();

    const signedHash = await cdpClient.evm.signHash({
      address: account.address,
      hash: ("0x" + "1".repeat(64)) as Hex,
    });
    expect(signedHash).toBeDefined();

    const signedMessage = await cdpClient.evm.signMessage({
      address: account.address,
      message: "0x123",
    });
    expect(signedMessage).toBeDefined();

    // Must be a valid transaction that can be decoded
    const serializedTx = serializeTransaction(
      {
        chainId: baseSepolia.id,
        to: "0x0000000000000000000000000000000000000000",
        value: parseEther("0.00001"),
        type: "eip1559",
        maxFeePerGas: BigInt(20000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
        gasLimit: BigInt(21000),
        nonce: 0,
      },
      {
        v: BigInt(0),
        r: "0x0",
        s: "0x0",
      },
    );

    const signedTransaction = await cdpClient.evm.signTransaction({
      address: account.address,
      transaction: serializedTx,
    });
    expect(signedTransaction).toBeDefined();
  });

  it("should create, get, and list smart accounts", async () => {
    const privateKey = generatePrivateKey();
    const owner = privateKeyToAccount(privateKey);

    const smartAccount = await cdpClient.evm.createSmartAccount({
      owner: owner,
    });
    expect(smartAccount).toBeDefined();

    const smartAccounts = await cdpClient.evm.listSmartAccounts();
    expect(smartAccounts).toBeDefined();
    expect(smartAccounts.accounts.length).toBeGreaterThan(0);

    const retrievedSmartAccount = await cdpClient.evm.getSmartAccount({
      address: smartAccount.address,
      owner: owner,
    });
    expect(retrievedSmartAccount).toBeDefined();
  });

  it("should prepare user operation", async () => {
    const privateKey = generatePrivateKey();
    const owner = privateKeyToAccount(privateKey);
    const smartAccount = await cdpClient.evm.createSmartAccount({ owner });
    expect(smartAccount).toBeDefined();

    const userOperation = await cdpClient.evm.prepareUserOperation({
      smartAccount: smartAccount,
      network: "base-sepolia",
      calls: [
        {
          to: "0x0000000000000000000000000000000000000000",
          data: "0x",
          value: BigInt(0),
        },
      ],
    });
    expect(userOperation).toBeDefined();
  });

  it("should send, wait, and get user operation", async () => {
    const privateKey = generatePrivateKey();
    const owner = privateKeyToAccount(privateKey);

    const smartAccount = await cdpClient.evm.createSmartAccount({ owner });
    expect(smartAccount).toBeDefined();

    const userOperation = await cdpClient.evm.sendUserOperation({
      smartAccount: smartAccount,
      network: "base-sepolia",
      calls: [
        {
          to: "0x0000000000000000000000000000000000000000",
          data: "0x",
          value: BigInt(0),
        },
      ],
    });

    expect(userOperation).toBeDefined();
    expect(userOperation.userOpHash).toBeDefined();

    const userOpResult = await cdpClient.evm.waitForUserOperation({
      smartAccountAddress: smartAccount.address,
      userOpHash: userOperation.userOpHash,
    });

    expect(userOpResult).toBeDefined();
    expect(userOpResult.status).toBe("complete");

    const userOp = await cdpClient.evm.getUserOperation({
      smartAccount: smartAccount,
      userOpHash: userOperation.userOpHash,
    });
    expect(userOp).toBeDefined();
    expect(userOp.status).toBe("complete");
  });

  it("should create, get, and list solana accounts", async () => {
    const randomName = generateRandomName();
    const solanaAccount = await cdpClient.solana.createAccount({ name: randomName });
    expect(solanaAccount).toBeDefined();

    const solanaAccounts = await cdpClient.solana.listAccounts();
    expect(solanaAccounts).toBeDefined();
    expect(solanaAccounts.accounts.length).toBeGreaterThan(0);

    let retrievedSolanaAccount = await cdpClient.solana.getAccount({
      address: solanaAccount.address,
    });
    expect(retrievedSolanaAccount).toBeDefined();
    expect(retrievedSolanaAccount.address).toBe(solanaAccount.address);
    expect(retrievedSolanaAccount.name).toBe(randomName);

    retrievedSolanaAccount = await cdpClient.solana.getAccount({
      name: randomName,
    });
    expect(retrievedSolanaAccount).toBeDefined();
    expect(retrievedSolanaAccount.address).toBe(solanaAccount.address);
    expect(retrievedSolanaAccount.name).toBe(randomName);
  });

  it("should test solana sign functions", async () => {
    const account = await cdpClient.solana.createAccount();

    // For sign_message - use base64 encoded message
    const message = "Hello Solana!";
    const encoder = new TextEncoder();
    const encodedMessage = Buffer.from(encoder.encode(message)).toString("base64");

    const signedMessage = await cdpClient.solana.signMessage({
      address: account.address,
      message: encodedMessage,
    });
    expect(signedMessage).toBeDefined();

    // Create a minimal valid transaction structure for the API
    const unsignedTxBytes = new Uint8Array([
      0, // Number of signatures (0 for unsigned)
      1, // Number of required signatures
      0, // Number of read-only signed accounts
      0, // Number of read-only unsigned accounts
      1, // Number of account keys
      ...new Uint8Array(32).fill(0), // Dummy account key (32 bytes)
      ...new Uint8Array(32).fill(1), // Recent blockhash (32 bytes)
      1, // Number of instructions
      0, // Program ID index
      1, // Number of accounts in instruction
      0, // Account index
      4, // Data length
      1,
      2,
      3,
      4, // Instruction data
    ]);

    const base64Tx = Buffer.from(unsignedTxBytes).toString("base64");

    const signedTransaction = await cdpClient.solana.signTransaction({
      address: account.address,
      transaction: base64Tx,
    });
    expect(signedTransaction).toBeDefined();
  });
});

// Helper function to generate random name matching the required pattern ^[A-Za-z0-9][A-Za-z0-9-]{0,34}[A-Za-z0-9]$
function generateRandomName(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsWithHyphen = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";

  const firstChar = chars.charAt(Math.floor(Math.random() * chars.length));

  const middleLength = Math.floor(Math.random() * 34);
  let middlePart = "";
  for (let i = 0; i < middleLength; i++) {
    middlePart += charsWithHyphen.charAt(Math.floor(Math.random() * charsWithHyphen.length));
  }

  const lastChar = chars.charAt(Math.floor(Math.random() * chars.length));
  return firstChar + middlePart + lastChar;
}
