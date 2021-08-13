# option-block
Stock and crypto options on blockchain

**Allows for blockchain based stock options on a variable time scale (ex. from 1 min expiration to years).**

*Outline:*

1. Build an oracle that pings market data provider and gets stock market price
2. Create a set of smart contracts that tracks price of underlying security
3. Two or more parties can initiate contract, stake their eth, and contract will be executed based on the timed performance of one or more security
4. Option contract logic can be easily encoded into smart contract
5. A simple web interface (using MetaMask) can be used to interact with the contracts on local blockchain
