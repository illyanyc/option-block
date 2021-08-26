// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.5.0;

contract StockOracleNFLX {
    
    /*storage*/
    uint public close;
    string public ticker = "NFLX";
    address public owner;

    /*contructor*/
    constructor() public {
        owner = msg.sender;
    }
    
    /*function setting price*/
    function setClose(uint _close) public {
        require(owner == msg.sender, "You are not the administrator of this oracle!");
        close = _close;
    }
    
    /*function getting the price*/
    function getClose() public view returns (uint) {
        return close;
    }
}