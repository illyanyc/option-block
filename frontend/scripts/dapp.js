// Change this address to match your deployed contract!
const contract_address = "0x2f77A91328d90c150f1Dc84097Bd55117f747E62";
// const contract_address = "0xeeE4afbBB163d6818e3e2251fcA26B0fe2298d65";
// const contract_address = "0x228d0BA8395Df6109A080A034f6dc99A6c71A483";
// const contract_address = "0x1383fC8D9644f734414D8B05E5d204eBe3F7a31b";
// const contract_address = "0x7b272e6c2E049f49742631f7dfE8a724B3c030Db";


var oracle_Contracts = {
'AAPL':	'0x57960D9E1244deB9181BdC2a6B34968718fed1A4',
'GOOGL':'0xBC32E17e2a72F6e97Aa0cA70FfCE9E951E6ef30c',
'FB':	'0xdc2687b1e955078E12317EAcC7AEb3635E299970',
'NFLX':	'0xB7703E97FeAC6d2377a8107190F7a057A54a6346',
'AMZN':	'0x95da0ecE375333e723A5a4387A3EfdCf60E3273c',
'NVDA':	'0x9Bc082c47B2Cd671B633C86BCF3b53f577968bB9',
'TSLA':	'0xD3DF5bEaA0C0D89dC4156870b6913C7EA8F74c23'
}

var EthPrice;
var stockPrice;
var optionList;
// var shortOptionList;
// var longOptionList;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const dApp = {

  ethEnabled: function() {
    // If the browser has MetaMask installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },

  // Writes Call Option Contract
  writeCallOption: async function(strike, premium, shares, expiry, tknAmt, ticker) {
    this.contract.methods.writeCallOption(strike, premium, shares, expiry, tknAmt, ticker).send({from: this.accounts[0], value : tknAmt}).on("receipt", (receipt) => {
      M.toast({ html: "Call option successfully written." });
      location.reload();
    });
  },

  // Writes Put Option Contract
  writePutOption: async function(strike, premium, shares, expiry, tknAmt, ticker) {
    this.contract.methods.writePutOption(strike, premium, shares, expiry, tknAmt, ticker).send({from: this.accounts[0], value : tknAmt}).on("receipt", (receipt) => {
      M.toast({ html: "Put option successfully written." });
      location.reload();
    });
  },

  // Buy Option
  buyOption: async function(ID, premium) {
    this.contract.methods.buyOption(ID).send({from: this.accounts[0], value : premium}).on("receipt", (receipt) => {
      M.toast({ html: "Call option successfully bought." });
      location.reload();
    });
  },

  // Cancel Option
  cancelOption: async function(ID) {
    const canceled = await this.contract.methods.cancelOption(ID).send({from: this.accounts[0]});
  },

  // Exersize option
  exercise: async function(ID) {
    this.contract.methods.exercise(ID).send({from: this.accounts[0]});
  },

  // Gets ETH price from ETH oracle
  getEthPrice: async function(){
    ethPrice = await this.ethOracle.methods.getClose().call();
    // var message = "ETHUSD : $".concat(ethPrice/100);
    // console.log(message);
    // M.toast({ html: message });
    return ethPrice/100;
  },

  // Gets stock price from stock oracle
  getStockPrice: async function(ticker){
    // Build stock oracle contract
    stockOracleContractAddress = oracle_Contracts[ticker];
    this.stockOracle = new window.web3.eth.Contract(
      this.stockOracleABI,
      stockOracleContractAddress,
      { defaultAccount: this.accounts[0] }
    );

    stockPrice = await this.stockOracle.methods.getClose().call();
    var message = ticker.concat(" : $").concat(stockPrice/100);
    console.log(message);
    M.toast({ html: message })

    return stockPrice/100
  },

  // Get all options on the blokchain
  getAllAvailableOptions: async function() {
    return await this.contract.methods.getAllAvailableOptions().call();
  },

  // Get all options written by user
  getMyOptions: async function() {
    return await this.contract.methods.getMyOptions().call({from: this.accounts[0]});
  },

  // Get all options bought by user
  getOptionsBought: async function() {
    return await this.contract.methods.getOptionsBought().call({from: this.accounts[0]});
  },

  // Update option values
  updateOptionValues: async function() {
    await this.contract.methods.updatePrices().call({from: this.accounts[0]});
  },

  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    myAddress = this.accounts[0];

    this.optionABI = await (await fetch("./json/option_abi.json")).json();
    this.ethOracleABI = await (await fetch("./json/eth_oracle_abi.json")).json();
    this.stockOracleABI = await (await fetch("./json/stock_oracle_abi.json")).json();

    this.contract = new window.web3.eth.Contract(
      this.optionABI,
      contract_address,
      { defaultAccount: this.accounts[0] }
    );

    this.ethOracle = new window.web3.eth.Contract(
      this.ethOracleABI,
      '0x7744b083407c57E8DDCd32396699A7D8C6cc305a',
      { defaultAccount: this.accounts[0] }
    );

    console.log("Contract object", this.contract);

  }
};

dApp.main();
// dApp.updateAll();