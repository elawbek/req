## Installation:

1. Clone this repo:

```shell
git clone https://github.com/elawbek/req.git
```

2. Install NPM packages:

```shell
cd req
npm install
```

---

## .env:

Create an `.env` file in the main directory of the project
copy the data from `.env.example`
fill in:

```.env
SCAN_API_KEY=your API_KEY from etherscan/bscscan/polygonscan
PRIVATE_KEY=deployer's private key

ETHEREUM_MAINNET_URL=RPC-node url for ETHEREUM-mainnet
POLYGON_MAINNET_URL=RPC-node url for POLYGON-mainnet
BNB_MAINNET_URL=RPC-node url for BNB-mainnet

GOERLI_TESTNET_URL=RPC-node url for GOERLI-testnet
MUMBAI_TESTNET_URL=RPC-node url for MUMBAI-testnet
BNB_TESTNET_URL=RPC-node url for BNB-testnet
```

---

## Deployment:

ETHEREUM_MAINNET:

```shell
npx hardhat run scripts/deploy.ts --network ethereum
```

---

POLYGON_MAINNET:

```shell
npx hardhat run scripts/deploy.ts --network polygon
```

---

BNB_MAINNET:

```shell
npx hardhat run scripts/deploy.ts --network bnb
```

---

GOERLI_TESTNET:

```shell
npx hardhat run scripts/deploy.ts --network goerli_testnet
```

---

MUMBAI_TESTNET (Polygon):

```shell
npx hardhat run scripts/deploy.ts --network mumbai_testnet
```

---

BNB_TESTNET:

```shell
npx hardhat run scripts/deploy.ts --network bnb_testnet
```

---

## How the scripts/deploy.ts script works

1. deploy contract
2. verify contract on scanner

---

## How the contract works:

1.  After the contract is deployed, the owner must add the master address via `addMasterAddress` (the argument this function takes a new master address):

```solidity
function addMasterAddress(address _newMasterAddress)
```

2. collection and withdrawal of native currency:

- each address sends a native currency to this contract
- after collecting the native currency, the master address can call the `withdrawEther` method and withdraw the entire accumulated balance to itself

3. withdrawal of tokens:

- each address makes the maximum approve token to be taken and adds itself to the contract via the `addUser` method. The address passes a check that the approve on that contract is equal to the maximum approve and is written to the array of that token.
- After all addresses are written to the array, the master address calls the `getAddressesForCollect` method (this method takes as its argument the token address to collect from all addresses that have balances) and receives as output an array of addresses that have balances in the given token.

```solidity
function getAddressesForCollect(address _token)
```

- The resulting array is passed by the master address as an argument to the `withdraw` method along with the token address. The function runs a loop that goes through this array and transfers all tokens from these addresses to the balance of the master address.
  (This method is cost effective only if the number of addresses in the array is 2 or more)

```solidity
 function withdraw(address _token, address[] calldata _addresses)
```
