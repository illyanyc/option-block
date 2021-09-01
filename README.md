![header](https://capsule-render.vercel.app/api?type=waving&color=gradient&width=1000&height=200&section=header&text=Option-Block&fontSize=30&fontColor=black)
**Stock and crypto options on blockchain**

### Table of Contents
* [Overview](#overview)
* [Requirements](#requirements)
* [Installation](#requirements)
* [Oracle](#oracle)
* [Option Contracts](#option-contracts)
* [Front End](#front-end)
* [Back End](#back-end)

---

## Overview

1. Build an oracle that pings market data provider and gets stock market price
2. Create a set of smart contracts that tracks price of underlying security
3. Two or more parties can initiate contract, stake their eth, and contract will be executed based on the timed performance of one or more security
4. Option contract logic can be easily encoded into smart contract
5. A simple web interface (using MetaMask) can be used to interact with the contracts on local blockchain

---

## Requirements
### General
* [Solidity](https://docs.soliditylang.org/en/v0.8.7/) - Solidity is an object-oriented, high-level language for implementing smart contracts. Smart contracts are programs which govern the behaviour of accounts within the Ethereum state
* [Web3.js](https://web3js.readthedocs.io/en/v1.4.0/) - web3.js is a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket.

### Oracle
1. [Node.js](https://nodejs.org/en/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine
2. [Solidity](https://docs.soliditylang.org/en/v0.8.7/) via [Remix](https://remix.ethereum.org/)
3. [Web3.js](https://web3js.readthedocs.io/en/v1.4.0/)
4. [node-fetch](https://www.npmjs.com/package/node-fetch) - A light-weight module that brings window.fetch to Node.js
5. [ethereum-tx](https://github.com/ethereumjs/ethereumjs-tx) - Ethereum via Node.js
6. [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
7. [Cron](https://www.npmjs.com/package/node-cron) - The node-cron module is tiny task scheduler in pure JavaScript for node.js based on GNU crontab. This module allows you to schedule task in node.js using full crontab syntax.

---

## Installation


---

## Oracle


---

## Option Contracts

### Option struct

Option details for each option are stored in the form of a struct:
```
struct option {
    uint strike;               //Price in USD option
    uint ethPriceAtTimeOfWrite;//Eth Price in USD at time of write
    uint premium;              //Fee in contract token that option writer charges
    uint expiry;               //Unix timestamp of expiration time
    uint amount;               //Amount of tokens the option contract is for
    bool isCallOption;         //Is this a call option
    bool exercised;            //Has option been exercised
    bool canceled;             //Has option been canceled
    uint id;                   //Unique ID of option, also array index
    uint latestCost;           //Helper to show last updated cost to exercise
    address payable writer;    //Issuer of option
    address payable buyer;     //Buyer of option
    string ticker;             //Ticker of the stock
}
```
Most of the fields are the same as standard stock options, such as strike price, premium, expiration datetime, amount and whether the option is a call option or a put option. 
In addition, we need to store the ethereum price at the time of write in order to calculate the cost to exercise. We also have two booleans to keep track of the state of the option (exercised/canceled). And finally, we store the addresses of the writer and the buyer for ethereum transactions between the two parties.

All options are stored in a public array on the Options contract, and users can view the details of each contract using its id (array index).

### Writing, Buying, Exercising an Option

The Options contract has a few public methods for users to interact with the options:

1. Writing an Option

```
function writeCallOption(uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string memory ticker) public payable;
```

Allows a user to write a covered call option. Users will need to provide the strike price of the underlying stock (USD * 100), the premium of this option, the expiration date (unix timestamp), the amount of ethereum this option is for, and the stock's ticker symbol. In addition, users will need to deposit enough ethereum as collateral to this contract; the amount of ethereum sent to the contract should be consistent with the token amount parameter.


```
function writePutOption(uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string memory ticker) public payable;
```

Similar to writeCallOption, this function allows users to write covered put options.

2. Buying an Option

```
function buyOption(uint ID) public payable;
```

If an option is still available on the market, i.e. the option has not been canceled, is not expired, buyer is null, a user can use the above function to buy the option. The user will need to send the corresponding eth as indicated by the premium field of the option. The premium will be sent to the writer of the option right away.

3. Canceling an Option

```
function cancelOption(uint ID) public;
```

Users can cancel options that they have written and haven't been bought via the above method. The collateral eth will be refunded to the writer.

4. Exercisinng an Option

```
function exercise(uint ID) public;
```

Users have the choice to exercise options that they bought previously, given that the option is not expired, using the exercise method. The value of the option is calculated as follows:
* Call options: (current stock price - strike price) * number of shares / current eth price
* Put options: (strike price - current stock price) * number of shares / current eth price
Users will receive eth equal to the value of the option, up to the collateral deposited by the writer. Any remaining eth will be returned to the writer.

5. Utility functions
```
function updatePrices() public;
function getAllAvailableOptions() public view returns (option[] memory);
function getMyOptions() public view returns (option[] memory);
function getOptionsBought() public view returns (option[] memory);
```

In addition, the Options contract provide a few utility methods for the front-end as well as the user to view the options on the market.

---

## Front End


---

## Back End

### Stock data API

Stock data is obtained using <code>yfinance</code> library. The API is hosted on Google Cloud App server and is accessible via URL: <code>[option-block.ue.r.appspot.com/](https://option-block.ue.r.appspot.com/)</code>

### Closing price

URL : <code>'/quote?symbol='</code>

Where *symbol* = stock ticker

### Option premium - Black-Scholes

URl : <code>/option_bs/symbol/price/strike/mat_date/rf/call_put_flag</code>

Where:

*symbol* = stock ticker <br>
*price* = stock price, where stock price multipled by 100 (ex. 145.20 = 14520) <br>
*strike* = strike price, where stike price multipled by 100 (ex. 145.20 = 14520) <br>
*mat_date* = maturity date (YYYY-MM-DD) <br>
*rf* = risk free rate in basis points (ex. 0.25% = 25) <br>
*call_put_flag* = for call pass "c", for put pass "p" <br>

### Option premium - Market Data

URl : <code>/option_yf/symbol/strike/mat_date/call_put_flag</code>

Where:

*symbol* = stock ticker <br>
*strike* = strike price, where stike price multipled by 100 (ex. 145.20 = 14520) <br>
*mat_date* = maturity date (YYYY-MM-DD) <br>
*call_put_flag* = for call pass "c", for put pass "p" <br>

    
    

  
