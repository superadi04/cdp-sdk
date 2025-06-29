// Usage: pnpm tsx evm/createAccountWithPolicy.ts

import { CdpClient } from "@coinbase/cdp-sdk";
import "dotenv/config";

const cdp = new CdpClient();

const policies = await cdp.policies.listPolicies({
  scope: "account",
});

let accountPolicyId = "";

if (policies.policies.length > 0) {
  console.log(`Using existing account policy for new account: ${policies.policies[0].id}`);
  accountPolicyId = policies.policies[0].id;
} else {
  const policy = await cdp.policies.createPolicy({
    policy: {
      scope: "account",
      description: "Account policy for account",
      rules: [
        {
          action: "accept",
          operation: "sendEvmTransaction",
          criteria: [
            {
              type: "evmNetwork",
              operator: "in",
              networks: ["base-sepolia", "base"],
            },
          ],
        },
      ],
    },
  });
  console.log(`Created new account policy: ${policy.id}`);
  console.log(`Using new account policy for new account: ${policy.id}`);
  accountPolicyId = policy.id;
}

const accountName = "AccountWithPolicy";

const account = await cdp.evm.createAccount({
  name: accountName,
  accountPolicy: accountPolicyId,
});
console.log(`Successfully created account: ${account.address}`);

const retrievedAccount = await cdp.evm.getAccount({
  name: accountName,
});
console.log(`Retrieved account policies: ${retrievedAccount.policies}`);
