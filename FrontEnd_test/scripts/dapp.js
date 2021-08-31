// Change this address to match your deployed contract!
const contract_address = "0x14122EB49a71D2d4a3e373d861eF3459b25f0Dd4";

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

// async function getURL(url) {

//     var premium;
//     let obj = await (await fetch(url).then(response => 
//       response.json().then(data => ({
//           data: data,
//           status: response.status
//       })
//       ).then(res => {
//           console.log(res.status, res.data.premium);
//           premium = res.data.premium;
//       })););
//     return premium;
// }

async function optionPremiumBlackScholes(symbol,price,strike,mat_date,flag){
  var _price = String(parseFloat(price) * 100);
  var _strike = String(parseFloat(strike) * 100);
  var url = 'https://option-block.ue.r.appspot.com/option_yf/'+symbol+'/'+_strike+'/'+mat_date+'/'+flag;

  // debug
  console.log(url);

  var premium;
    let obj = await (await fetch(url).then(response => 
      response.json().then(data => ({
          data: data,
          status: response.status
        })
        ).then(res => {
            console.log(res.status, res.data.premium);
            premium = res.data.premium;
        })
      )
    );
  return premium;
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

  // Writes option contract
  writeOptions: async function(strike, premium, shares, expiry, tknAmt, ticker) {
    this.contract.methods.writeCallOption(strike, premium, shares, expiry, ticker).send({from: this.accounts[0], value : tknAmt}).on("receipt", (receipt) => {
      M.toast({ html: "Call option successfully written." });
      location.reload();
    });
  },

  // Gets ETH price from ETH oracle
  getEthPrice: async function(){
    ethPrice = await this.ethOracle.methods.getClose().call();
    var message = "ETHUSD : $".concat(ethPrice/100);
    console.log(message);
    M.toast({ html: message });
    
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

  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();

    this.optionABI = await (await fetch("./option_abi.json")).json();
    this.ethOracleABI = await (await fetch("./eth_oracle_abi.json")).json();
    this.stockOracleABI = await (await fetch("./stock_oracle_abi.json")).json();

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
