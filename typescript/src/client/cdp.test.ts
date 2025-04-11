import { describe, it, expect, vi, beforeEach } from "vitest";
import { CdpClient } from "./cdp";
import { CdpOpenApiClient } from "../openapi-client";
import { version } from "../../package.json";
import { EvmClient } from "./evm";
import { SolanaClient } from "./solana";

vi.mock("../openapi-client", () => {
  return {
    CdpOpenApiClient: {
      configure: vi.fn(),
    },
  };
});

vi.mock("../package.json", () => ({
  version: "1.0.0",
}));

describe("CdpClient", () => {
  const options = {
    apiKeyId: "test-api-key-id",
    apiKeySecret: "test-api-key-secret",
    walletSecret: "test-wallet-secret",
    debugging: true,
    basePath: "https://test-base-path.com",
  };

  let client: CdpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new CdpClient(options);
  });

  it("should initialize with the correct options", () => {
    expect(CdpOpenApiClient.configure).toHaveBeenCalledWith({
      apiKeyId: options.apiKeyId,
      apiKeySecret: options.apiKeySecret,
      walletSecret: options.walletSecret,
      basePath: options.basePath,
      debugging: options.debugging,
      source: "sdk",
      sourceVersion: version,
    });

    expect(client.evm).toBeInstanceOf(EvmClient);
    expect(client.solana).toBeInstanceOf(SolanaClient);
  });
});
