import { CdpOpenApiClient } from "../../openapi-client";
import {
  SolanaClientInterface,
  Account,
  CreateAccountOptions,
  GetAccountOptions,
  ListAccountsOptions,
  RequestFaucetOptions,
  ListAccountsResult,
  SignatureResult,
  SignMessageOptions,
  SignTransactionOptions,
} from "./solana.types";

/**
 * The namespace containing all Solana methods.
 */
export class SolanaClient implements SolanaClientInterface {
  /**
   * Creates a new Solana account.
   *
   * @param {CreateAccountOptions} options - Configuration options for creating the Solana account.
   * @returns A promise that resolves to the newly created Solana account instance.
   *
   * @example
   * ```ts
   * // You can create a new Solana account without any parameters
   * const account = await cdpClient.solana.createAccount();
   *
   * // You can also create a new Solana account with a name
   * const account = await cdpClient.solana.createAccount({ name: "MyAccount" });
   * ```
   */
  async createAccount(options: CreateAccountOptions = {}): Promise<Account> {
    return CdpOpenApiClient.createSolanaAccount(options, options.idempotencyKey);
  }

  /**
   * Gets a Solana account by its address.
   *
   * @param {GetAccountOptions} options - Configuration options for getting the Solana account.
   * @returns A promise that resolves to the Solana account instance.
   *
   * @example
   * ```ts
   * // At some point, you will have created a Solana account
   * const newAccount = await cdpClient.solana.createAccount();
   *
   * // Later when you want to get the account, you can do so by address
   * const account = await cdpClient.solana.getAccount({
   *   address: newAccount.address,
   * });
   * ```
   */
  async getAccount(options: GetAccountOptions): Promise<Account> {
    if (options.address) {
      return CdpOpenApiClient.getSolanaAccount(options.address);
    }

    if (options.name) {
      return CdpOpenApiClient.getSolanaAccountByName(options.name);
    }

    throw new Error("Either address or name must be provided");
  }

  /**
   * Lists all Solana accounts.
   *
   * @param {ListAccountsOptions} options - Configuration options for listing the Solana accounts.
   * @returns A promise that resolves to an array of Solana account instances.
   *
   * @example
   * ```ts
   * // You can paginate through the accounts
   * let page = await cdpClient.solana.listAccounts({
   *   pageSize: 2,
   * });
   *
   * page.accounts.forEach(account => console.log(account));
   *
   * while (page.nextPageToken) {
   *   page = await cdpClient.solana.listAccounts({
   *     pageSize: 2,
   *     pageToken: page.nextPageToken,
   *   });
   *
   *   page.accounts.forEach(account => console.log(account));
   * }
   * ```
   */
  async listAccounts(options: ListAccountsOptions = {}): Promise<ListAccountsResult> {
    const solAccounts = await CdpOpenApiClient.listSolanaAccounts({
      pageSize: options.pageSize,
      pageToken: options.pageToken,
    });

    return {
      accounts: solAccounts.accounts,
      nextPageToken: solAccounts.nextPageToken,
    };
  }

  /**
   * Requests funds from a Solana faucet.
   *
   * @param {RequestFaucetOptions} options - Configuration options for requesting funds from the Solana faucet.
   * @returns A promise that resolves to the transaction signature.
   */
  async requestFaucet(options: RequestFaucetOptions): Promise<SignatureResult> {
    const signature = await CdpOpenApiClient.requestSolanaFaucet(
      { address: options.address, token: options.token },
      options.idempotencyKey,
    );

    return {
      signature: signature.transactionSignature,
    };
  }

  /**
   * Signs a message using a Solana wallet.
   *
   * @param {SignMessageOptions} options - Configuration options for signing the message.
   * @returns A promise that resolves to the signature.
   *
   * @example
   * ```ts
   * // Create a Solana account
   * const account = await cdpClient.solana.createAccount();
   *
   * // When you want to sign a message, you can do so by address
   * const signature = await cdpClient.solana.signMessage({
   *   address: account.address,
   *   message: "Hello, world!",
   * });
   * ```
   */
  async signMessage(options: SignMessageOptions): Promise<SignatureResult> {
    return CdpOpenApiClient.signSolanaMessage(
      options.address,
      {
        message: options.message,
      },
      options.idempotencyKey,
    );
  }

  /**
   * Signs a transaction using a Solana wallet.
   *
   * @param {SignTransactionOptions} options - Configuration options for signing the transaction.
   * @returns A promise that resolves to the signature.
   *
   * @example
   * ```ts
   * // Create a Solana account
   * const account = await cdpClient.solana.createAccount();
   *
   * // Add your transaction instructions here
   * const transaction = new Transaction()
   *
   * // Make sure to set requireAllSignatures to false, since signing will be done through the API
   * const serializedTransaction = transaction.serialize({
   *   requireAllSignatures: false,
   * });
   *
   * // Base64 encode the serialized transaction
   * const transaction = Buffer.from(serializedTransaction).toString("base64");
   *
   * // When you want to sign a transaction, you can do so by address and base64 encoded transaction
   * const signature = await cdpClient.solana.signTransaction({
   *   address: account.address,
   *   transaction,
   * });
   * ```
   */
  async signTransaction(options: SignTransactionOptions): Promise<SignatureResult> {
    const signature = await CdpOpenApiClient.signSolanaTransaction(
      options.address,
      {
        transaction: options.transaction,
      },
      options.idempotencyKey,
    );

    return {
      signature: signature.signedTransaction,
    };
  }
}
