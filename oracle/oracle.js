// Ethereum Oralce - Updates ETHUSD values
// Columbia University FinTech Project 3

// Connect to Oracle contract via Infura node on Ropsten
// const ganacheUrl = "HTTP://127.0.0.1:8545"; //Ganache (Local)
const ropstenUrl = "https://ropsten.infura.io/v3/3f34a28b73f547a2ac6f9e3afc8e3b65"; //Ropsten testnet
const account1 = '0xc2ABe24A0eca57B29e0E229f030e3b2C32aEcb4E' // Your account address 1
const privateKey1 = Buffer.from('1e90884d56f3c312e39e2faae57478c6d5f0185f2fd6778b0f7ae197926741f6', 'hex');

var oracle_Contracts = {
'AAPL':	'0x57960D9E1244deB9181BdC2a6B34968718fed1A4',
'GOOGL':'0xBC32E17e2a72F6e97Aa0cA70FfCE9E951E6ef30c',
'FB':	'0xdc2687b1e955078E12317EAcC7AEb3635E299970',
'NFLX':	'0xB7703E97FeAC6d2377a8107190F7a057A54a6346',
'AMZN':	'0x95da0ecE375333e723A5a4387A3EfdCf60E3273c',
'NVDA':	'0x9Bc082c47B2Cd671B633C86BCF3b53f577968bB9',
'TSLA':	'0xD3DF5bEaA0C0D89dC4156870b6913C7EA8F74c23'
}

const ETHUSD = "0x7744b083407c57E8DDCd32396699A7D8C6cc305a";

const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_close",
				"type": "uint256"
			}
		],
		"name": "setClose",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "close",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "ticker",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getClose",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
];

// Dependancies
const fetch = require('node-fetch'); //To fetch APIs
var Tx = require("ethereumjs-tx");
const Web3 = require('web3');
const cron = require('node-cron');
const express = require('express');

// Set up Ethereum provider 
const provider = new Web3.providers.HttpProvider(ropstenUrl);
const web3 = new Web3(provider);

// Set default account
web3.eth.defaultAccount = account1;


// Updates oracle - gets Close price - calls sendTx()
async function update_stock_oracle(Ticker) {

	// Get contract address
	var contract_Address = oracle_Contracts[Ticker]

	// Get data for oracle
	var dataURL = 'https://option-block.ue.r.appspot.com/quote?symbol='.concat(Ticker)
    var Data = await fetch(dataURL);
    var Info = await Data.json();
    var Close = Number(Info.close * 100);

    // Print average ETH price in console
    console.log("Current ".concat(Ticker).concat(" Price : "), Close);

	// Send transaction
    await sendTx(contract_Address, Close);  
}

// Updates oracle - gets Close price - calls sendTx()
async function update_eth_oracle() {

	// Get data for oracle
    var Data = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
    var Info = await Data.json();
    var Close = Number(Info.USD * 100);

    // Print average ETH price in console
    console.log("Current ETH Price : ", Close);

	// Send transaction
    await sendTx(ETHUSD, Close);  

}

// Sends transaction to blockchain
async function sendTx(contract_Address, Close) {

	// Instantiate contract
	const myContract = new web3.eth.Contract(abi, contract_Address);

    const myData = myContract.methods.setClose(Close).encodeABI();

    web3.eth.getTransactionCount(account1, (err, txCount) => {

    // Build the transaction
    const txObject = {
        nonce:    web3.utils.toHex(txCount),
        to:       contract_Address,
        value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
        gasLimit: web3.utils.toHex(2100000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
        data: myData  
    }
        // Sign the transaction
        const tx = new Tx.Transaction(txObject, {chain:'ropsten', hardfork: 'petersburg'});
        tx.sign(privateKey1);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        // Broadcast the transaction
        const transaction = web3.eth.sendSignedTransaction(raw); 
    });
}

function sleep(ms){
	return new Promise((resolve) => {setTimeout(resolve, ms)})
}

// Update oracles
async function update_all_oracles(){
	update_eth_oracle();
	await sleep(30000);
	for (let ticker in oracle_Contracts){
		update_stock_oracle(ticker);
		await sleep(100000);
	}
}


// Using Cron for periodic oracle updates
// Create instance of express
app = express();

// schedule tasks to be run on the server
// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | month
// | | | day of month
// | | hour
// | minute
// second ( optional )

// Run Cron job
cron.schedule('*/20 * * * *', function() {
    console.log('Updating Oracle every 20 minutes');
	update_all_oracles();
});

app.listen(3000);