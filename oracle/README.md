# Ethereum Oracle
This is an implementation of an Ethereum oracle using web3.
An oracle is simply a messenger which relays data from one source to another.

### Dependencies
1. Node.js
2. NPM
3. Web3
4. node-fetch
5. Cron

### Code Logic
Oracle.js consists of 2 core functions:
1. update_oracle: This function fetches data from the api, which in this example is the average gas price for mined transactions on the main ethereum network. This is then set as the input for the setNumber function in the deployed sample smart contract. This input is set as the object for the second function (sendTx).
2. sendTx: This function sets all the parameters for the transaction, signs the transaction and sends the transaction.

### Implementation
In order to deploy and test the oracle:
1. Clone the repository.
2. Set up an ethereum wallet with ropsten ether (metamask is easiest).
3. Deploy "*.sol" [(remix is easiest)](https://remix.ethereum.org/).
4. Obtain a provider for the Ethereum network, you can run your own node via Ganache however for simplicity we are using [Infura](https://infura.io/) which is a public gateway to the blockchain.
5. Run oracle_*.js.

 
