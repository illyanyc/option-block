// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Tickers {

    constructor()  {
        populateTickerAddresses();
    }

    mapping(string => address) private tickerMap;

    function populateTickerAddresses() private {
        tickerMap['ETHUSD'] = address(0x7744b083407c57E8DDCd32396699A7D8C6cc305a);
        tickerMap['AAPL'] =  address(0x57960D9E1244deB9181BdC2a6B34968718fed1A4);
        tickerMap['GOOGL'] = address(0xBC32E17e2a72F6e97Aa0cA70FfCE9E951E6ef30c);
        tickerMap['FB'] =	address(0xdc2687b1e955078E12317EAcC7AEb3635E299970);
        tickerMap['NFLX'] =	address(0xB7703E97FeAC6d2377a8107190F7a057A54a6346);
        tickerMap['AMZN'] =	address(0x95da0ecE375333e723A5a4387A3EfdCf60E3273c);
        tickerMap['NVDA'] =	address(0x9Bc082c47B2Cd671B633C86BCF3b53f577968bB9);
        tickerMap['TSLA'] =	address(0xD3DF5bEaA0C0D89dC4156870b6913C7EA8F74c23);
    }


    function getTickerPrice(string memory _ticker) public view returns (uint) {
        return StockMarket(tickerMap[_ticker]).getClose();
    }
}

interface StockMarket {
    function getClose() external view returns (uint);
}
