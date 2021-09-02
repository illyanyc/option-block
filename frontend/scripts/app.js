// Populate available options table
async function buildAllAvailableOptionsTable(){
    // Check JSON
    const optionList = await dApp.getAllAvailableOptions();
    console.log(optionList)

    // Get Eth Price
    const ethPrice = await dApp.getEthPrice();

    // Generate Table
    var callTable = "<table>";
    callTable += '<tr><td>Ticker</td><td>Strike</td><td>Shares</td><td>Expiry</td><td>Premium USD</td><td>Premium Wei</td><td>ID</td><td>Buy</td></th>'

    var putTable = "<table>";
    putTable += '<tr><td>Ticker</td><td>Strike</td><td>Shares</td><td>Expiry</td><td>Premium USD</td><td>Premium Wei</td><td>ID</td><td>Buy</td></th>'


    for (let key in optionList) {

    const strike = optionList[key][0];          //Price in USD option
    //const ethPriceAtTimeOfWrite = optionList[key][1];//Eth Price in USD at time of write
    const premiumETH = optionList[key][2];             //Fee in contract token that option writer charges
    const shares = optionList[key][3];              //Number of shares in the option
    const expiry = optionList[key][4];            //Unix timestamp of expiration time
    //const amount = optionList[key][5];               //Amount of tokens the option contract is for
    const isCallOption = optionList[key][6];        //Is this a call option
    const exercised = optionList[key][7];            //Has option been exercised
    const canceled = optionList[key][8];             //Has option been canceled
    const id = optionList[key][9];                  //Unique ID of option, also array index
    //const latestValue = optionList[key][10];           //Helper to show last updated value
    //const writer = optionList[key][11];    //Issuer of option
    //const buyer = optionList[key][12];     //Buyer of option
    const ticker = optionList[key][13];  
    
    const premiumUSD = premiumETH / 10**18 * ethPrice;
    const expiryDate = new Date(expiry*1000).toLocaleString()
    var type;

    if (exercised == false && canceled==false){
        if (isCallOption==true){
        type = 'Call'
        callTable += `<tr><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td><td>${premiumETH}</td><td>${id}</td><td><a class="waves-effect waves-light btn" onclick="submitBuyOption(${id}, ${premiumETH})">Buy</a></td></tr>`;
        }else if (isCallOption==false){
        type='Put'
        putTable += `<tr><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td><td>${premiumETH}</td><td>${id}</td><td><a class="waves-effect waves-light btn" onclick="submitBuyOption(${id}, ${premiumETH})">Buy</a></td></tr>`;
        };
    }
    }
    callTable += "</table>";
    document.getElementById("callOptionsTable").innerHTML = callTable;

    putTable += "</table>";
    document.getElementById("putOptionsTable").innerHTML = putTable;

};

// Get Options Written by user
async function buildShortOptionsTable(){
    // Check JSON
    const shortOptionList = await dApp.getMyOptions()
    //console.log('getMyOptions()');
    //console.log(shortOptionList);

    // Get Eth Price
    const ethPrice = await dApp.getEthPrice();

    // Generate Table
    var myShortOptions = "<table>";
    myShortOptions += '<tr><td>ID</td><td>Type</td><td>Ticker</td><td>Strike</td><td>Shares</td><td>Expiry</td><td>Premium USD</td><td>Premium Wei</td><td>Value USD</td><td>Value Wei</td><td>Status</td><td>Buyer</td><td>Cancel</td></th>'    

    for (let key in shortOptionList) {

        const strike = shortOptionList[key][0];                 //Price in USD option
        const ethPriceAtTimeOfWrite = shortOptionList[key][1];   //Eth Price in USD at time of write                 
        const premiumETH = shortOptionList[key][2];             //Fee in contract token that option writer charges
        const shares = shortOptionList[key][3];                 //Number of shares in the option
        const expiry = shortOptionList[key][4];                 //Unix timestamp of expiration time
        const amount = shortOptionList[key][5];                 //Amount of tokens the option contract is for
        const isCallOption = shortOptionList[key][6];           //Is this a call option
        const exercised = shortOptionList[key][7];              //Has option been exercised
        const canceled = shortOptionList[key][8];               //Has option been canceled
        const id = shortOptionList[key][9];                     //Unique ID of option, also array index
        const latestValue = shortOptionList[key][10];           //Helper to show last updated value
        const writer = shortOptionList[key][11];                //Issuer of option
        const buyer = shortOptionList[key][12];                 //Buyer of option
        const ticker = shortOptionList[key][13]; 
        
        const premiumUSD = premiumETH / 10**18 * ethPrice;
        const latestValueUSD = latestValue / 10**18 * ethPrice;
        const expiryDate = new Date(expiry*1000).toLocaleString()
        var type;

        if (isCallOption==true){
            type = 'Call'
        }else if (isCallOption==false){
            type='Put'
        };
        if (!canceled && !exercised){
            if (buyer == "0x0000000000000000000000000000000000000000"){
            myShortOptions += `<tr><td>${id}</td><td>${type}</td><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td>
                <td>${premiumETH}</td><td>${Number(latestValueUSD).toFixed(2)}</td><td>${latestValue}</td><td>Open</td><td>${buyer}</td><td><a class="waves-effect waves-light btn" onclick="submitCancelOption(${id})">Cancel</a></td></tr>`;
            }
            else{
            myShortOptions += `<tr><td>${id}</td><td>${type}</td><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td>
                <td>${premiumETH}</td><td>${Number(latestValueUSD).toFixed(2)}</td><td>${latestValue}</td><td>Filled</td><td>${buyer}</td><td><a class="waves-effect waves-light btn disabled" onclick="submitCancelOption(${id})">Cancel</a></td></tr>`;
            };
        };
    };

    myShortOptions += "</table>";
    document.getElementById("myShortOptionsTable").innerHTML = myShortOptions;
};

// Get Options Bought by user
async function buildLongOptionsTable(){
    // Check JSON
    const longOptionList = await dApp.getOptionsBought();
    //console.log('getOptionsBought()');
    //console.log(longOptionList);

    // Get Eth Price
    const ethPrice = await dApp.getEthPrice();

    // Generate Table
    var myLongOptions = "<table>";
    myLongOptions += '<tr><td>ID</td><td>Type</td><td>Ticker</td><td>Strike</td><td>Shares</td><td>Expiry</td><td>Premium USD</td><td>Premium Wei</td><td>Value USD</td><td>Value Wei</td><td>Status</td><td>Writer</td><td>Exercise</td></th>'    

    for (let key in longOptionList) {

        const strike = longOptionList[key][0];          //Price in USD option
        const ethPriceAtTimeOfWrite = longOptionList[key][1];//Eth Price in USD at time of write
        const premiumETH = longOptionList[key][2];             //Fee in contract token that option writer charges
        const shares = longOptionList[key][3];              //Number of shares in the option
        const expiry = longOptionList[key][4];            //Unix timestamp of expiration time
        const amount = longOptionList[key][5];               //Amount of tokens the option contract is for
        const isCallOption = longOptionList[key][6];        //Is this a call option
        const exercised = longOptionList[key][7];            //Has option been exercised
        const canceled = longOptionList[key][8];             //Has option been canceled
        const id = longOptionList[key][9];                  //Unique ID of option, also array index
        const latestValue = longOptionList[key][10];           //Helper to show last updated value
        const writer = longOptionList[key][11];    //Issuer of option
        const buyer = longOptionList[key][12];     //Buyer of option
        const ticker = longOptionList[key][13];  
        
        const premiumUSD = premiumETH / 10**18 * ethPrice;
        const latestValueUSD = latestValue / 10**18 * ethPrice;
        const expiryDate = new Date(expiry*1000).toLocaleString()
        var type;

        if (isCallOption==true){
            type = 'Call'
        }else if (isCallOption==false){
            type='Put'
        };
        if (!canceled && !exercised){
            if (latestValue <= 0){
                myLongOptions += `<tr><td>${id}</td><td>${type}</td><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td>
                    <td>${premiumETH}</td><td>${Number(latestValueUSD).toFixed(2)}</td><td>${latestValue}</td><td>OTM</td><td>${writer}</td>
                                <td><a class="waves-effect waves-light btn disabled" onclick="submitExerciseOption(${id})">Exercise</a></td></tr>`;
            }else{
                myLongOptions += `<tr><td>${id}</td><td>${type}</td><td>${ticker}</td><td>${strike/100}</td><td>${shares}</td><td>${expiryDate}</td><td>${Number(premiumUSD).toFixed(2)}</td>
                <td>${premiumETH}</td><td>${Number(latestValueUSD).toFixed(2)}</td><td>${latestValue}</td><td>ITM</td><td>${writer}</td>
                            <td><a class="waves-effect waves-light btn" onclick="submitExerciseOption(${id})">Exercise</a></td></tr>`;

            };
        };
    };

    myLongOptions += "</table>";
    document.getElementById("myLongOptionsTable").innerHTML = myLongOptions;
};

// Build Portfolio Table
async function popupateTables() {
    // refresh only if connected to MetaMask and address is set
    if (undefined==dApp.accounts){
        M.toast({ html: "Please connect to MetaMask." });
    }else
    {
        await updateValues();
        await buildShortOptionsTable();
        await buildLongOptionsTable();
    }   
}

//Update option values
async function updateValues() {
    await dApp.updateOptionValues();
}

// Exersice option
async function submitExerciseOption(ID) {
    await dApp.exercise(ID);
}


// Populates Stock Price in the text box
function populatePrice(){
    StockPrice().then(function updatePriceField(_price){
    document.getElementById("price").value = _price;
    })
};

// Get Calculated Premium
async function getPremium(){
    // var symbol = document.getElementById("ticker_opt").value;
    // var symbol = M.FormSelect.getInstance(elem);
    var symbol =  $("#ticker_opt option:selected").text();
    var price = document.getElementById("price").value;
    var strike = document.getElementById("strike").value;
    var mat_date = document.getElementById("expiry").value;
    var shares = document.getElementById("shares").value;
    var flag = $("input[name=call_put_switch]:checked").next().text();
    var parsed_flag;
    if (flag == "Call"){
    parsed_flag = "c";
    }else{parsed_flag = "p";};

    // debugging
    console.log("symbol : ".concat(symbol));
    console.log("price : ".concat(price));
    console.log("strike : ".concat(strike));
    console.log("mat_date : ".concat(mat_date));
    console.log("flag : ".concat(parsed_flag));

    // Calculate premium
    var premium = await optionPremium(symbol, price, strike, mat_date, parsed_flag);

    console.log("premium : ".concat(premium));

    // Set textbox to Premium
    document.getElementById("premium-usd").value = premium;
    setOptionPremiumInEth();
    setTotalPremium();
}

// Calculate premium 
async function optionPremium(symbol,price,strike,mat_date,flag){
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

// Set Option Premium in ETH and Set Token Amount
async function setOptionPremiumInEth(){
    // Set textboc to Premium in ETH
    var premium = document.getElementById("premium-usd").value;
    const premiumInEth = await convertUSDtoETH(premium)
    document.getElementById("premium-eth").value = Math.trunc(premiumInEth * 10**18); 
}

// Set Total Premium
async function setTotalPremium(){
    var totalPremiumUSD = document.getElementById("premium-usd").value * document.getElementById("shares").value;
    document.getElementById("total-premium-usd").value = totalPremiumUSD;
    setTotalPremiumEth(totalPremiumUSD);
}

async function setTotalPremiumEth(totalPremiumUSD){
    const totalPremiumETH = await convertUSDtoETH(totalPremiumUSD);
    document.getElementById("total-premium-eth").value = Math.trunc(totalPremiumETH * 10**18);
}

// Calculate Token Amount
async function setTokenAmount(){
    // Get strike price
    const strike = document.getElementById('strike').value;
    // Get Shares
    const shares = document.getElementById('shares').value;
    // Calculate Colletaral in USD
    const tknAmtUSD = strike * shares;
    const tknAmtETH = await convertUSDtoETH(strike * shares);
    document.getElementById("tknAmt-usd").value = tknAmtUSD;
    // Calculate Colleteral in Wei
    document.getElementById("tknAmt-eth").value = Math.trunc(tknAmtETH * 10**18);
    updatePremium();
}

// Update Values
async function updatePremium(){
    setOptionPremiumInEth();
    setTotalPremium();
}

// Convert USD to wei
async function convertUSDtoETH(USD){
    const ethPrice = await dApp.getEthPrice();
    const _ethPrice = ethPrice;
    var priceInEth = USD / _ethPrice;
    return priceInEth
}

//Interaction with dApp//

// Write Option
async function submitWriteOption(){
    const ethPrice = await dApp.getEthPrice();

    // Get Option flag -> Call or Put
    var flag = $("input[name=call_put_switch]:checked").next().text();
    console.log("flag : ".concat(flag))

    // Get Ticker
    // var ticker = document.getElementById('ticker_opt').value;
    // var ticker = M.FormSelect.getInstance(elem);
    var ticker =  $("#ticker_opt option:selected").text();
    console.log("ticker : ".concat(ticker))

    // Get Strike Price
    var strike = document.getElementById('strike').value;
    var strikeEth = convertUSDtoETH(strike) 
    console.log("strike : ".concat(strike))

    // Get Stock Price
    var price = document.getElementById('price').value;
    console.log("price : ".concat(price))

    // Get Number of Shares
    var shares = document.getElementById('shares').value; 
    console.log("shares : ".concat(shares))

    // Get Expiry in Unix timestamp
    var expiry = Math.round(new Date(document.getElementById('expiry').value).getTime()/1000);
    console.log("expiry : ".concat(expiry))

    // Get Premium in Wei
    var totalPremium = document.getElementById("total-premium-eth").value;
    console.log("totalPremium : ".concat(totalPremium))

    // Get Token Amount
    var tknAmt = document.getElementById('tknAmt-eth').value;
    console.log("tknAmt : ".concat(tknAmt))
    
    if (flag=="Call"){
    await dApp.writeCallOption(strike*100, totalPremium, shares, expiry, tknAmt, ticker);
    }else if(flag=="Put"){
    await dApp.writePutOption(strike*100, totalPremium, shares, expiry, tknAmt, ticker);
    };
};

// Buy Option
async function submitBuyOption(ID, premium){
    await dApp.buyOption(ID, premium);
}

// Get Stock Price
function StockPrice(){
    // var ticker = document.getElementById('ticker_opt').value;
    var ticker = $("#ticker_opt option:selected").text();
    return dApp.getStockPrice(ticker);
};

// Cancel option
async function submitCancelOption(ID){
    await dApp.cancelOption(ID);
}
