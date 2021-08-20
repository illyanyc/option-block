pragma solidity ^0.6.0;

contract StockMarket {
    // Structure of Quote
    struct stock {
        uint256 price;
        uint256 volume;
    }
    
    
    // Mapping stock to symbol type bytes4
    mapping (bytes4 => stock) stockQuote;
    
    // Owner of the contract
    address oracleOwner;    
    
    constructor() public {
        oracleOwner = msg.sender;
    }
    
    // function : Sets the price and volume of a stock
    function setStock (bytes4 _symbol, uint256 _price, uint256 _volume) public {
        require(msg.sender == oracleOwner, "StockOracle: Only owner can call this function");
        stockQuote[_symbol].price = _price;
        stockQuote[_symbol].volume = _volume;
    }
    
    //function :  Get the price of a some stock by symbol
    function getStockPrice (bytes4 _symbol) public view returns(uint256) {
        return (stockQuote[_symbol].price);
    }
    
    // function : Get the value of volume traded for some stock by symbol
    function getStockVolume (bytes4 _symbol) public view returns(uint256) {
        return  (stockQuote[_symbol].volume);
    }
}