pragma solidity >= 0.5.0 < 0.6.0;

import "github.com/provable-things/ethereum-api/provableAPI_0.5.sol";

contract StockPriceOracle is usingProvable {

    string public priceAAPL;

    event LogNewProvableQuery(string description);
    event LogNewPriceTicker(string price);

    constructor()
        public
    {
        provable_setProof(proofType_Android | proofStorage_IPFS);
        update(); // Update price on contract creation...
    }

    function __callback(
        bytes32 _myid,
        string memory _result,
        bytes memory _proof
    )
        public
    {
        _myid;
        _proof;
        require(msg.sender == provable_cbAddress());
        update(); // Recursively update the price stored in the contract...
        priceAAPL = _result;
        emit LogNewPriceTicker(priceAAPL);
    }

    function update()
        public
        payable
    {
        if (provable_getPrice("URL") > address(this).balance) {
            emit LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee!");
        } else {
            emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");
            provable_query("URL", 'json(https://eodhistoricaldata.com/api/eod/AAPL.US?api_token=611f0afb83dba2.93037853&fmt=json&from=2021-08-19).0.close');
        }
    }
}