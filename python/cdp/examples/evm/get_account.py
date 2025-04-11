# Usage: python python/cdp/examples/evm/get_account.py

import os
from dotenv import load_dotenv

from cdp import CdpClient


async def main():
    load_dotenv()

    api_key_id = os.environ.get("CDP_API_KEY_NAME")
    api_key_secret = os.environ.get("CDP_API_KEY_SECRET")
    wallet_secret = os.environ.get("CDP_WALLET_SECRET")
    base_path = os.environ.get("CDP_API_URL")

    if not api_key_id or not api_key_secret or not wallet_secret:
        raise Exception("Missing required environment variables")

    cdp = CdpClient(
        api_key_id=api_key_id,
        api_key_secret=api_key_secret,
        wallet_secret=wallet_secret,
        base_path=base_path,
    )

    new_account = await cdp.evm.create_account(name="Account1")
    account = await cdp.evm.get_account(address=new_account.address)
    print("EVM Account Address: ", account.address)
    account = await cdp.evm.get_account(name=new_account.name)
    print("EVM Account Name: ", account.name)

    await cdp.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
