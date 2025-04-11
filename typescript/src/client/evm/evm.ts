import { Address } from "viem";

import { CdpOpenApiClient } from "../../openapi-client";
import {
  sendUserOperation,
  SendUserOperationReturnType,
} from "../../actions/evm/sendUserOperation";
import {
  waitForUserOperation,
  WaitForUserOperationReturnType,
} from "../../actions/evm/waitForUserOperation";
import { toEvmServerAccount } from "../../accounts/evm/toEvmServerAccount";
import { toEvmSmartAccount } from "../../accounts/evm/toEvmSmartAccount";
import { Hex } from "../../types/misc";
import {
  CreateServerAccountOptions,
  GetServerAccountOptions,
  ListServerAccountsOptions,
  CreateSmartAccountOptions,
  RequestFaucetOptions,
  SendUserOperationOptions,
  WaitForUserOperationOptions,
  RequestFaucetResult,
  SignHashOptions,
  SignatureResult,
  SignMessageOptions,
  SignTransactionOptions,
  GetSmartAccountOptions,
  SmartAccount,
  ServerAccount,
  EvmClientInterface,
  ListServerAccountResult,
  PrepareUserOperationOptions,
  UserOperation,
  GetUserOperationOptions,
  ListSmartAccountResult,
  ListSmartAccountsOptions,
} from "./evm.types";

/**
 * The namespace containing all EVM methods.
 */
export class EvmClient implements EvmClientInterface {
  /**
   * Creates a new CDP EVM account.
   *
   * @param {CreateServerAccountOptions} [options] - Optional configuration options for creating the server account.
   * @returns A promise that resolves to the newly created server account.
   *
   * @example **Without arguments**
   *          ```ts
   *          const account = await cdpClient.evm.createAccount();
   *          ```
   *
   * @example **With a name**
   *          ```ts
   *          const account = await cdpClient.evm.createAccount({ name: "MyAccount" });
   *          ```
   *
   * @example **With an idempotency key**
   *          ```ts
   *          const account = await cdpClient.evm.createAccount({
   *            idempotencyKey: uuidv4(),
   *          });
   *          ```
   */
  async createAccount(options: CreateServerAccountOptions = {}): Promise<ServerAccount> {
    const account = await CdpOpenApiClient.createEvmAccount(
      {
        name: options.name,
      },
      options.idempotencyKey,
    );

    return toEvmServerAccount(CdpOpenApiClient, {
      account,
    });
  }

  /**
   * Creates a new EVM smart account.
   *
   * @param {CreateSmartAccountOptions} options - Configuration options for creating the smart account.
   * @returns A promise that resolves to the newly created smart account.
   *
   * @example **With a CDP EVM Account as the owner**
   *          ```ts
   *          const account = await cdpClient.evm.createAccount();
   *          const smartAccount = await cdpClient.evm.createSmartAccount({
   *            owner: account,
   *          });
   *          ```
   *
   * @example **With a Viem LocalAccount as the owner**
   *          ```ts
   *          // See https://viem.sh/docs/accounts/local/privateKeyToAccount
   *          const privateKey = generatePrivateKey();
   *          const account = privateKeyToAccount(privateKey);
   *          const smartAccount = await client.evm.createSmartAccount({
   *            owner: account,
   *          });
   *          ```
   *
   * @example **With a name**
   *          ```ts
   *          const smartAccount = await cdpClient.evm.createSmartAccount({
   *            owner: account,
   *            name: "MySmartAccount",
   *          });
   *          ```
   *
   * @example **With an idempotency key**
   *          ```ts
   *          const smartAccount = await cdpClient.evm.createSmartAccount({
   *            owner: account,
   *            idempotencyKey: uuidv4(),
   *          });
   *          ```
   */
  async createSmartAccount(options: CreateSmartAccountOptions): Promise<SmartAccount> {
    const smartAccount = await CdpOpenApiClient.createEvmSmartAccount(
      {
        owners: [options.owner.address],
      },
      options.idempotencyKey,
    );

    return toEvmSmartAccount({
      smartAccount,
      owner: options.owner,
    });
  }

  /**
   * Gets an ethereum server account using the Coinbase API
   *
   * @param {GetServerAccountOptions} options - Configuration options for getting the server account.
   * @returns A promise that resolves to the server account instance.
   */
  async getAccount(options: GetServerAccountOptions): Promise<ServerAccount> {
    const account = await (() => {
      if (options.address) {
        return CdpOpenApiClient.getEvmAccount(options.address);
      }

      if (options.name) {
        return CdpOpenApiClient.getEvmAccountByName(options.name);
      }

      throw new Error("Either address or name must be provided");
    })();

    return toEvmServerAccount(CdpOpenApiClient, {
      account,
    });
  }

  /**
   * Gets an ethereum smart account using the Coinbase API
   *
   * @param {GetSmartAccountOptions} options - Configuration options for getting the smart account.
   * @returns A promise that resolves to the smart account instance.
   *
   * @example
   * ```ts
   * const smartAccount = await cdpClient.evm.getSmartAccount({
   *   address: "0x1234567890123456789012345678901234567890",
   * });
   * ```
   */
  async getSmartAccount(options: GetSmartAccountOptions): Promise<SmartAccount> {
    const smartAccount = await CdpOpenApiClient.getEvmSmartAccount(options.address);

    return toEvmSmartAccount({
      smartAccount,
      owner: options.owner,
    });
  }

  /**
   * Gets a user operations using the Coinbase API.
   *
   * @param {GetUserOperationOptions} options - Configuration options for getting the user operation.
   * @returns A promise that resolves to the user operation instance.
   */
  async getUserOperation(options: GetUserOperationOptions): Promise<UserOperation> {
    const userOp = await CdpOpenApiClient.getUserOperation(
      options.smartAccount.address,
      options.userOpHash,
    );

    return {
      network: userOp.network,
      userOpHash: userOp.userOpHash as Hex,
      status: userOp.status,
      calls: userOp.calls.map(call => ({
        to: call.to as Address,
        value: BigInt(call.value),
        data: call.data as Hex,
      })),
    };
  }

  /**
   * Lists all ethereum server accounts using the Coinbase API
   *
   * @param {ListServerAccountsOptions} options - Configuration options for listing the server accounts.
   * @returns A promise that resolves to an array of server account instances.
   */
  async listAccounts(options: ListServerAccountsOptions = {}): Promise<ListServerAccountResult> {
    const ethAccounts = await CdpOpenApiClient.listEvmAccounts({
      pageSize: options.pageSize,
      pageToken: options.pageToken,
    });

    return {
      accounts: ethAccounts.accounts.map(account =>
        toEvmServerAccount(CdpOpenApiClient, {
          account: account,
        }),
      ),
      nextPageToken: ethAccounts.nextPageToken,
    };
  }

  /**
   * Lists all ethereum smart accounts using the Coinbase API
   *
   * @param {ListSmartAccountsOptions} options - Configuration options for listing the smart accounts.
   * @returns A promise that resolves to an array of smart account instances.
   */
  async listSmartAccounts(options: ListSmartAccountsOptions = {}): Promise<ListSmartAccountResult> {
    const smartAccounts = await CdpOpenApiClient.listEvmSmartAccounts({
      pageSize: options.pageSize,
      pageToken: options.pageToken,
    });

    return {
      accounts: smartAccounts.accounts.map(account => ({
        address: account.address as Address,
        owners: [account.owners[0] as Address],
        type: "evm-smart",
      })),
      nextPageToken: smartAccounts.nextPageToken,
    };
  }

  /**
   * Prepares a user operation using the Coinbase API.
   *
   * @param {PrepareUserOperationOptions} options - Configuration options for preparing the user operation.
   * @returns A promise that resolves to the user operation hash.
   */
  async prepareUserOperation(options: PrepareUserOperationOptions): Promise<UserOperation> {
    const userOp = await CdpOpenApiClient.prepareUserOperation(options.smartAccount.address, {
      network: options.network,
      calls: options.calls.map(call => ({
        to: call.to as Address,
        value: call.value.toString(),
        data: call.data as Hex,
      })),
      paymasterUrl: options.paymasterUrl,
    });

    return {
      network: userOp.network,
      userOpHash: userOp.userOpHash as Hex,
      status: userOp.status,
      calls: userOp.calls.map(call => ({
        to: call.to as Address,
        value: BigInt(call.value),
        data: call.data as Hex,
      })),
    };
  }

  /**
   * Requests funds from an EVM faucet.
   *
   * @param {RequestFaucetOptions} options - Configuration options for requesting funds from the EVM faucet.
   * @returns A promise that resolves to the transaction hash.
   *
   * @example
   * ```ts
   * const result = await cdpClient.evm.requestFaucet({
   *   address: "0x1234567890123456789012345678901234567890",
   *   network: "base-sepolia",
   *   token: "eth",
   * });
   * ```
   */
  async requestFaucet(options: RequestFaucetOptions): Promise<RequestFaucetResult> {
    const { transactionHash } = await CdpOpenApiClient.requestEvmFaucet(
      { address: options.address, network: options.network, token: options.token },
      options.idempotencyKey,
    );

    return {
      transactionHash: transactionHash as Hex,
    };
  }

  /**
   * Sends a user operation using the Coinbase API.
   *
   * @param {SendUserOperationOptions} options - Configuration options for sending the user operation.
   * @returns A promise that resolves to the user operation hash.
   */
  async sendUserOperation(options: SendUserOperationOptions): Promise<SendUserOperationReturnType> {
    return sendUserOperation(CdpOpenApiClient, options.smartAccount, {
      network: options.network,
      calls: options.calls,
      paymasterUrl: options.paymasterUrl,
      idempotencyKey: options.idempotencyKey,
    });
  }

  /**
   * Signs an EVM hash.
   *
   * @param {SignHashOptions} options - Configuration options for signing the hash.
   * @returns A promise that resolves to the signature.
   *
   * @example
   * ```ts
   * // Create a new EVM server account to sign with
   * const ethAccount = await cdpClient.createEvmServerAccount({});
   *
   * const signature = await cdpClient.evm.signHash({
   *   address: ethAccount.address,
   *   hash: "0x1234567890123456789012345678901234567890123456789012345678901234",
   * });
   * ```
   */
  async signHash(options: SignHashOptions): Promise<SignatureResult> {
    const signature = await CdpOpenApiClient.signEvmHash(
      options.address,
      {
        hash: options.hash,
      },
      options.idempotencyKey,
    );

    return {
      signature: signature.signature as Hex,
    };
  }

  /**
   * Signs an EVM message.
   *
   * @param {SignMessageOptions} options - Configuration options for signing the message.
   * @returns A promise that resolves to the signature.
   *
   * @example
   * ```ts
   * // Create a new EVM server account to sign with
   * const ethAccount = await cdpClient.createEvmServerAccount({});
   *
   * const signature = await cdpClient.evm.signMessage({
   *   address: ethAccount.address,
   *   message: "Hello, world!",
   * });
   * ```
   */
  async signMessage(options: SignMessageOptions): Promise<SignatureResult> {
    const signature = await CdpOpenApiClient.signEvmMessage(
      options.address,
      {
        message: options.message,
      },
      options.idempotencyKey,
    );

    return {
      signature: signature.signature as Hex,
    };
  }

  /**
   * Signs an EVM transaction.
   *
   * @param {SignTransactionOptions} options - Configuration options for signing the transaction.
   * @returns A promise that resolves to the signature.
   *
   * @example
   * ```ts
   * import { parseEther, serializeTransaction } from "viem";
   * import { baseSepolia } from "viem/chains";
   *
   * // Create a new EVM server account to sign with
   * const ethAccount = await cdpClient.createEvmServerAccount({});
   *
   * const serializedTx = serializeTransaction(
   *   {
   *     chainId: baseSepolia.id,
   *     data: "0x",
   *     to: "0x4252e0c9A3da5A2700e7d91cb50aEf522D0C6Fe8",
   *     type: "eip1559",
   *     value: parseEther("0.000001"),
   *   },
   *   // use an empty signature, since the transaction will be signed via the CDP API
   *   {
   *     v: BigInt(0),
   *     r: "0x0",
   *     s: "0x0",
   *   },
   * );
   *
   * const signature = await cdpClient.evm.signTransaction({
   *   address: ethAccount.address,
   *   transaction: serializedTx,
   * });
   * ```
   */
  async signTransaction(options: SignTransactionOptions): Promise<SignatureResult> {
    const signature = await CdpOpenApiClient.signEvmTransaction(
      options.address,
      {
        transaction: options.transaction,
      },
      options.idempotencyKey,
    );

    return {
      signature: signature.signedTransaction as Hex,
    };
  }

  /**
   * Waits for a user operation to be mined using the Coinbase API.
   *
   * @param {WaitForUserOperationOptions} options - Configuration options for waiting for the user operation.
   * @returns A promise that resolves to the transaction receipt.
   */
  async waitForUserOperation(
    options: WaitForUserOperationOptions,
  ): Promise<WaitForUserOperationReturnType> {
    return waitForUserOperation(CdpOpenApiClient, {
      ...options,
    });
  }
}
