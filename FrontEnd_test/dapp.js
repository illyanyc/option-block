const fetch = require('node-fetch'); //To fetch APIs

// Change this address to match your deployed contract!
const contract_address = "0xAdaE22849912d42C62246b7cCc71b8eF21e0aFfc";


async function optionPremiumBlackScholes(symbol,price,strike,mat_date, expiry){
  URL = 'https://option-block.ue.r.appspot.com/option_bs/{}/{}/{}/{}/{}'.format(symbol,price,strike,mat_date,);
  var Data = await fetch(URL);
  return Data;
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

  writeOptions: async function(strike, premium, shares, expiry, tknAmt, ticker) {

    this.contract.methods.writeCallOption(strike, premium, shares, expiry, ticker).send({from: this.accounts[0], value : tknAmt}).on("receipt", (receipt) => {
        M.toast({ html: "Transaction Mined! Refreshing UI..." });
        location.reload();
      });
  },

  getEthPrice: async function ethPrice(){
    eth_price = this.ethOracle.methods.getClose().send({from: this.accounts[0]}).on("receipt", (receipt) => {
        M.toast({ html: "Transaction Mined! Refreshing UI..." })      
        });
    return eth_price;
  },

  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();

    this.optionABI = await (await fetch("./option_abi.json")).json();
    this.ethOracleABI = await (await fetch("./eth_oracle_abi.json")).json();

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
