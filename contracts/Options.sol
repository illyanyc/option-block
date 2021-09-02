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
        uint ethPriceAtTimeOfWrite;//Eth Price in USD at time of write
        uint premium;              //Fee in contract token that option writer charges
        uint shares;               //Number of shares in the option
        uint expiry;               //Unix timestamp of expiration time
        uint amount;               //Amount of tokens the option contract is for
        bool isCallOption;         //Is this a call option
        bool exercised;            //Has option been exercised
        bool canceled;             //Has option been canceled
        uint id;                   //Unique ID of option, also array index
        uint latestValue;          //Helper to show last updated value
        address payable writer;    //Issuer of option
        address payable buyer;     //Buyer of option
        string ticker;             //Ticker of the stock
    }

    Tickers priceGetter;
    string ethSymbol = "ETHUSD";
    option[] public options;

// events
    event writeCallOptionEvent (address owner, uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string ticker);
    event writePutOptionEvent  (address owner, uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string ticker);
    event buyOptionEvent  (uint ID);
    event cancelOptionEvent  (uint ID);
    event exerciseOptionEvent  (uint ID);
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
            opt.latestValue = calculateOptionValue(stockPrice, ethPrice, opt.strike, opt.shares, opt.isCallOption);
        }
    }

    // Allows user to write a covered call option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    // IN - share price USD * shares /ETH price -> wei
    function writeCallOption(uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string memory ticker) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > block.timestamp, "Option expiry time after now");
        require(strike > 0, "Strike price must be > $0");
        require(premium > 0, "Premium must be > $0");
        require(shares > 0, "Shares must be > 0");
        require(tknAmt > 0, "Token amount must be > 0");
        writeOption(strike, premium, shares, expiry, tknAmt, ticker, true);
        emit writeCallOptionEvent(msg.sender, strike, premium, shares, expiry, tknAmt, ticker);
    }

    // Allows user to write a covered put option
    // Takes strike price (stock in usd), premium(eth), expiration time(unix) and how many eth the contract is for
    // IN - share price USD * shares /ETH price -> wei
    function writePutOption(uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string memory ticker) public payable {
        require(msg.value == tknAmt, "Incorrect amount of ETH supplied");
        require(expiry > block.timestamp, "Option expiry time after now");
        require(strike > 0, "Strike price must be > $0");
        require(premium > 0, "Premium must be > $0");
        require(shares > 0, "Shares must be > 0");
        require(tknAmt > 0, "Token amount must be > 0");
        writeOption(strike, premium, shares, expiry, tknAmt, ticker, false);
        emit writePutOptionEvent(msg.sender, strike, premium, shares, expiry, tknAmt, ticker);
    }

    function writeOption(uint strike, uint premium, uint shares, uint expiry, uint tknAmt, string memory ticker, bool isCallOption) private {
        uint ethPrice = priceGetter.getTickerPrice(ethSymbol);
        uint stockPrice = priceGetter.getTickerPrice(ticker);

        option memory opt = option(strike,
                                   ethPrice,
                                   premium,
                                   shares,
                                   expiry,
                                   tknAmt,
                                   isCallOption,
                                   false,
                                   false,
                                   options.length,
                                   calculateOptionValue(stockPrice, ethPrice, strike, shares, isCallOption),
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

        //IN - Check to make sure option is still available
        require(opt.buyer == payable(address(0)), "This option has already been bought.");

        //Transfer premium payment to writer
        opt.writer.transfer(msg.value);

        opt.buyer = payable(msg.sender);
        emit buyOptionEvent(ID);
    }

    function cancelOption(uint ID) public {
        option storage opt = options[ID];

        require(opt.writer == msg.sender, "You do not own this option");
        require(!opt.canceled, "Option has already been canceled");
        require(!opt.exercised, "Option has already been executed");
        require(opt.buyer != payable(address(0)), "This option has already been bought.");

        opt.canceled = true;
        payable(msg.sender).transfer(opt.amount);
        emit cancelOptionEvent(ID);
    }

    // Exercise your call option, ID of option and payment
    function exercise(uint ID) public {
        option storage opt = options[ID];
        // If not expired and not already exercised, allow option owner to exercise
        // To exercise, the strike value*amount equivalent paid to writer (from buyer) and amount of tokens in the contract paid to buyer
        require(opt.buyer == msg.sender, "You do not own this option");
        require(!opt.exercised, "Option has already been exercised");
        require(!opt.canceled, "Option has already been canceled");

        //Buyer exercises option by paying strike*amount equivalent ETH value
        require(opt.latestValue > 0, "The option contract is worthless");

        if (opt.latestValue >= opt.amount) {
            opt.buyer.transfer(opt.amount);
        } else {
            //Pay buy the value of the option
            opt.buyer.transfer(opt.latestValue);
            //Pay writer the remaining ETH
            opt.writer.transfer(opt.amount - opt.latestValue);
        }

        opt.exercised = true;
        emit exerciseOptionEvent(ID);
    }

    function calculateOptionValue(uint stockPrice, uint ethPrice, uint strike, uint shares, bool isCallOption) private pure returns (uint) {
        if (isCallOption) {
            if (stockPrice <= strike) {
                return 0;
            }
            uint positionValueUSD = stockPrice.mul(shares).sub(strike.mul(shares));
            uint exerciseValWei = positionValueUSD.mul(10**18).div(ethPrice);
            return exerciseValWei;
        } else {
            if (strike <= stockPrice) {
                return 0;
            }
            uint positionValueUSD = strike.mul(shares).sub(stockPrice.mul(shares));
            uint exerciseValWei = positionValueUSD.mul(10**18).div(ethPrice);
            return exerciseValWei;
        }
    }

    function getAllAvailableOptions() public view returns (option[] memory) {
        uint numAvailable = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isAvailable(options[i])) {
                numAvailable++;
            }
        }
        option[] memory available = new option[](numAvailable);
        uint j = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isAvailable(options[i])) {
                available[j] = options[i];
                j++;
            }
        }
        return available;
    }

    function isAvailable(option memory opt) private view returns (bool) {
        return !opt.exercised &&
                !opt.canceled &&
                opt.expiry > block.timestamp &&
                opt.buyer == payable(address(0));
    }

    function getMyOptions() public view returns (option[] memory) {
        uint numOptions = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isMyOption(options[i])) {
                numOptions++;
            }
        }
        option[] memory myOptions = new option[](numOptions);
        uint j = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isMyOption(options[i])) {
                myOptions[j] = options[i];
                j++;
            }
        }
        return myOptions;
    }

    function isMyOption(option memory opt) private view returns (bool) {
        return opt.writer == payable(msg.sender);
    }

    function getOptionsBought() public view returns (option[] memory) {
        uint numBought = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isBuyerMe(options[i])) {
                numBought++;
            }
        }
        option[] memory bought = new option[](numBought);
        uint j = 0;
        for (uint i = 0; i < options.length; i++) {
            if (isBuyerMe(options[i])) {
                bought[j] = options[i];
                j++;
            }
        }
        return bought;
    }

    function isBuyerMe(option memory opt) private view returns (bool) {
        return opt.buyer == payable(msg.sender);
    }
}
