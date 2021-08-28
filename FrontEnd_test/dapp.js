// Change this address to match your deployed contract!
const contract_address = "0xAdaE22849912d42C62246b7cCc71b8eF21e0aFfc";

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


    writeOptions: async function() {
        const strike = 15000;
        const premium = 10000000000;
        const expiry = 1661705355;
        const tknAmt = 1000000000000000;
        const ticker = "AAPL";



        this.contract.methods.writeCallOption(strike, premium, expiry, tknAmt, ticker).send({from: this.accounts[0], value : tknAmt}).on("receipt", (receipt) => {
            M.toast({ html: "Transaction Mined! Refreshing UI..." });
            location.reload();
          });

        // Encode new data into contract
        // this.contract.methods.writeCallOption(strike, premium, expiry, tknAmt, ticker).encodeABI().send({from: this.accounts[0], value : window.web3.toWei(0.01, "ether"), gas: 1500000, gasPrice: '30000000000000'});

    },

  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();

    this.optionABI = await (await fetch("./abi.json")).json();

    this.contract = new window.web3.eth.Contract(
      this.optionABI,
      contract_address,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.contract);

    this.writeOptions();
  }
};

dApp.main();
