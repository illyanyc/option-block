// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";

contract Options {
    //Overflow safe operators
    using SafeMath for uint;

    //Options stored in arrays of structs
    struct option {
        uint strike;            //Price in USD option
        uint ethPriceAtTimeOfWrite;// Eth Price in USD at time of write
        uint premium;           //Fee in contract token that option writer charges
        uint expiry;            //Unix timestamp of expiration time
        uint amount;            //Amount of tokens the option contract is for
        bool isCallOption;      //Is this a call option
        bool exercised;         //Has option been exercised
        bool canceled;          //Has option been canceled
        uint id;                //Unique ID of option, also array index
        uint latestCost;        //Helper to show last updated cost to exercise
        address payable writer; //Issuer of option
        address payable buyer;  //Buyer of option
    }

    uint public ethPrice;
    uint public stockPrice;

    option[] public options;

    /***
        For Testing Only
    ***/
    uint public fakenow  = block.timestamp;
    function random() private view returns (uint) {
        return uint(keccak256(abi.encode(block.timestamp)));
    }

    function randomWalkEth() private view returns (uint) {
        uint rnd = random() % 256;
        if (rnd % 2 == 0 || ethPrice < rnd) {
            return ethPrice + rnd;
        } else {
            return ethPrice - rnd;
        }
    }

    function randomWalkStock() private view returns (uint) {
        uint rnd = random() % 16;
        if (rnd % 2 == 0 || stockPrice < rnd) {
            return stockPrice + rnd;
        } else {
            return stockPrice - rnd;
        }
    }

    function fastForward() public {
        fakenow += 1 days;
    }

    /*** Testing ***/

    constructor() {
        ethPrice = 3200;
        stockPrice = 160;
    }

    function calculateCostToExercise(option memory opt) private view returns (uint) {
        if (opt.isCallOption) {
            // you have the option to buy *amount* eth worth of stocks
            // the current exchange ratio is ethPrice / stockPrice
            // the num of stocks you can buy is amount * ethPrice / stockPrice
            // e.g amount = 10 ether, ethPrice = 3200, stock = 160
            // exerciseVal = 200, meaning that you can buy 200 stocks with 10 eth
            uint exerciseVal = opt.amount.mul(ethPrice).div(stockPrice);
            // at time of write - the exchange ratio is ethPriceAtTimeOfWrite/strikePrice
            // *exerciseVal* stocks would cost exerciseVal * strike/ethPriceAtTimeOfWrite eth
            // e.g. exerciseVal = 200, ethPriceAtTimeOfWrite = 3200, strike = 80
            // you need 5 eth
            return exerciseVal.mul(opt.strike).div(opt.ethPriceAtTimeOfWrite);
        } else {
            // you have the option to sell stocks for *amount* of eth
            // the ratio at time of write is ethPriceAtTimeOfWrite/strikePrice
            // the num of stocks you can sell is amount * ethPriceAtTimeOfWrite / strike
            // e.g amount = 10 ether, ethPriceAtTimeOfWrite = 3200, strike = 160
            // exerciseVal = 200, meaning that you can sell 200 stocks for 10 eth
            uint exerciseVal = opt.amount.mul(opt.ethPriceAtTimeOfWrite).div(opt.strike);
            // currently the exchange ratio is ethPrice/stockPrice
            // in order to sell *exerciseVal* stocks, you need exerciseVal * stockPrice/ethPricek eth
            // e.g. exerciseVal = 200, ethPrice = 3200, stockPrice = 80
            // you need 5 eth
            return exerciseVal.mul(stockPrice).div(ethPrice);
        }
    }

    // Returns the latest ETH price
    function updatePrices() public {
        // TODO: use the oracle to fetch the latest prices
        ethPrice = randomWalkEth();
        stockPrice = randomWalkStock();

        for (uint i = 0; i < options.length; i++) {
            option storage opt = options[i];
            // calculatet the number of stocks the option is for
            opt.latestCost = calculateCostToExercise(opt);
        }
    }

    // Allows user to write a covered call option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    function writeCallOption(uint strike, uint premium, uint expiry, uint tknAmt) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > fakenow, "Option expiry time after now");
        writeCallOption(strike, premium, expiry, tknAmt, true);
    }

    // Allows user to write a covered put option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    function writePutOption(uint strike, uint premium, uint expiry, uint tknAmt) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > fakenow, "Option expiry time after now");
        writeCallOption(strike, premium, expiry, tknAmt, false);
    }

    function writeCallOption(uint strike, uint premium, uint expiry, uint tknAmt, bool isCallOption) private {
        option memory opt = option(strike, ethPrice, premium, expiry, tknAmt, isCallOption, false, false, options.length, 0, payable(msg.sender), payable(address(0)));
        opt.latestCost = calculateCostToExercise(opt);
        options.push(opt);
    }

    // Purchase a call option, needs desired token, ID of option and payment
    function buyOption(uint ID) public payable {
        option storage opt = options[ID];

        // check to see if this is a valid option
        require(!opt.canceled, "Option is canceled and cannot be bought");
        require(!opt.exercised, "Option is exercised and cannot be bought");
        require(opt.expiry > fakenow, "Option is expired and cannot be bought");

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
}
