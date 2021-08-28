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

*symbol* = stock ticker
*price* = stock price, where stock price multipled by 100 (ex. 145.20 = 14520)
*strike* = strike price, where stike price multipled by 100 (ex. 145.20 = 14520)
*mat_date* = maturity date (YYYY-MM-DD)
*rf* = risk free rate in basis points (ex. 0.25% = 25)
*call_put_flag* = for call pass "c", for put pass "p"

### Option premium - Market Data

URl : <code>/option_yf/symbol/strike/mat_date/call_put_flag</code>

Where:

*symbol* = stock ticker
*strike* = strike price, where stike price multipled by 100 (ex. 145.20 = 14520)
*mat_date* = maturity date (YYYY-MM-DD)
*call_put_flag* = for call pass "c", for put pass "p"

    
    

  
