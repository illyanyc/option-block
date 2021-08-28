// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
import "./TickerPriceGetter.sol";


contract Options {
    //Overflow safe operators
    using SafeMath for uint;

    //Options stored in arrays of structs
    struct option {
        uint strike;               //Price in USD option
        uint ethPriceAtTimeOfWrite;// Eth Price in USD at time of write
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

    Tickers priceGetter;
    string ethSymbol = "ETHUSD";
    option[] public options;

// events
    event writeCallOptionEvent (address owner, uint strike, uint premium, uint expiry, uint tknAmt, string ticker);
    event writePutOptionEvent  (address owner, uint strike, uint premium, uint expiry, uint tknAmt, string ticker);
// ------

    constructor() {
        priceGetter = new Tickers();
    }

    // Returns the latest ETH price
    function updatePrices() public {
        uint ethPrice = priceGetter.getTickerPrice(ethSymbol);
        for (uint i = 0; i < options.length; i++) {
            option storage opt = options[i];
            uint stockPrice = priceGetter.getTickerPrice(opt.ticker);
            // calculatet the number of stocks the option is for
            opt.latestCost = calculateCostToExercise(stockPrice, ethPrice, opt.strike, opt.ethPriceAtTimeOfWrite, opt.amount, opt.isCallOption);
        }
    }

    // Allows user to write a covered call option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    function writeCallOption(uint strike, uint premium, uint expiry, uint tknAmt, string memory ticker) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > block.timestamp, "Option expiry time after now");
        writeOption(strike, premium, expiry, tknAmt, ticker, true);
        //added []
        emit writeCallOptionEvent(msg.sender, strike, premium, expiry, tknAmt, ticker);
    }

    // Allows user to write a covered put option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    function writePutOption(uint strike, uint premium, uint expiry, uint tknAmt, string memory  ticker) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > block.timestamp, "Option expiry time after now");
        writeOption(strike, premium, expiry, tknAmt, ticker, false);
        emit writePutOptionEvent(msg.sender, strike, premium, expiry, tknAmt, ticker);
    }

    function writeOption(uint strike, uint premium, uint expiry, uint tknAmt, string memory ticker, bool isCallOption) private {
        uint ethPrice = priceGetter.getTickerPrice(ethSymbol);
        uint stockPrice = priceGetter.getTickerPrice(ticker);
        option memory opt = option(strike,
                                   ethPrice,
                                   premium,
                                   expiry,
                                   tknAmt,
                                   isCallOption,
                                   false,
                                   false,
                                   options.length,
                                   calculateCostToExercise(stockPrice, ethPrice, strike, ethPrice, tknAmt, isCallOption),
                                   payable(msg.sender),
                                   payable(address(0)),
                                   ticker);
        options.push(opt);
    }

    // Purchase a call option, needs desired token, ID of option and payment
    function buyOption(uint ID) public payable {
        option storage opt = options[ID];

        // check to see if this is a valid option
        require(!opt.canceled, "Option is canceled and cannot be bought");
        require(!opt.exercised, "Option is exercised and cannot be bought");
        require(opt.expiry > block.timestamp, "Option is expired and cannot be bought");

        //Transfer premium payment from buyer
        require(msg.value == opt.premium, "Incorrect amount of ETH sent for premium");

        //Transfer premium payment to writer
        opt.writer.transfer(msg.value);
        opt.buyer = payable(msg.sender);
    }

    function cancelOption(uint ID) public {
        option storage opt = options[ID];

        require(opt.writer == msg.sender, "You do not own this option");
        require(!opt.canceled, "Option has already been canceled");
        require(!opt.exercised, "Option has already been executed");

        opt.canceled = true;
        payable(msg.sender).transfer(opt.amount);
    }

    // Exercise your call option, ID of option and payment
    function exercise(uint ID) public payable {
        option storage opt = options[ID];
        // If not expired and not already exercised, allow option owner to exercise
        // To exercise, the strike value*amount equivalent paid to writer (from buyer) and amount of tokens in the contract paid to buyer
        require(opt.buyer == msg.sender, "You do not own this option");
        require(!opt.exercised, "Option has already been exercised");
        require(!opt.canceled, "Option has already been canceled");

        //Buyer exercises option by paying strike*amount equivalent ETH value
        require(msg.value == opt.latestCost, "Incorrect amount sent to exercise");
        //Pay writer the exercise cost
        opt.writer.transfer(opt.latestCost);
        //Pay buyer contract amount of ETH
        payable(msg.sender).transfer(opt.amount);
        opt.exercised = true;
    }

    function calculateCostToExercise(uint stockPrice, uint ethPrice, uint strike, uint ethPriceAtTimeOfWrite, uint amount, bool isCallOption) private pure returns (uint) {
        if (isCallOption) {
            // you have the option to buy *amount* eth worth of stocks
            // the current exchange ratio is ethPrice / stockPrice
            // the num of stocks you can buy is amount * ethPrice / stockPrice
            // e.g amount = 10 ether, ethPrice = 3200, stock = 160
            // exerciseVal = 200, meaning that you can buy 200 stocks with 10 eth
            uint exerciseVal = amount.mul(ethPrice).div(stockPrice);
            // at time of write - the exchange ratio is ethPriceAtTimeOfWrite/strikePrice
            // *exerciseVal* stocks would cost exerciseVal * strike/ethPriceAtTimeOfWrite eth
            // e.g. exerciseVal = 200, ethPriceAtTimeOfWrite = 3200, strike = 80
            // you need 5 eth
            return exerciseVal.mul(strike).div(ethPriceAtTimeOfWrite);
        } else {
            // you have the option to sell stocks for *amount* of eth
            // the ratio at time of write is ethPriceAtTimeOfWrite/strikePrice
            // the num of stocks you can sell is amount * ethPriceAtTimeOfWrite / strike
            // e.g amount = 10 ether, ethPriceAtTimeOfWrite = 3200, strike = 160
            // exerciseVal = 200, meaning that you can sell 200 stocks for 10 eth
            uint exerciseVal = amount.mul(ethPriceAtTimeOfWrite).div(strike);
            // currently the exchange ratio is ethPrice/stockPrice
            // in order to sell *exerciseVal* stocks, you need exerciseVal * stockPrice/ethPricek eth
            // e.g. exerciseVal = 200, ethPrice = 3200, stockPrice = 80
            // you need 5 eth
            return exerciseVal.mul(stockPrice).div(ethPrice);
        }
    }
}
