from flask import Flask, request, jsonify
from yfinance import Ticker
from scipy.stats import norm
from math import log, sqrt, exp
from datetime import datetime
import json

app = Flask(__name__)

@app.route('/')
def home():
    return "Stock Price API v0.1 "

@app.route("/test")
def test():
    return "Test: Pass"

@app.route("/quote")
def display_quote():
    '''Returns last closing price from yfinance
    
    URL format : /quote?symbol=<ticker>
    '''
    
    symbol = request.args.get('symbol', default="SPY")
    tickerinfo = Ticker(symbol).info
    quote = round(Ticker(symbol).history(period="1d")["Close"].values[0],2)
    return jsonify({"close" : quote})

@app.route("/option_bs/<symbol>/<price>/<strike>/<mat_date>/<rf>/<call_put_flag>")
def BlackScholes(symbol : str,
                 price : int,
                 strike : int,
                 mat_date : str, #ex: ''
                 rf : int,
                 call_put_flag : str = "c" or "p"):
    '''Returns option premium based on Black Scholes equation
    https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf
    
    URL format : /option_bs/<symbol>/<price>/<strike>/<mat_date>/<rf>/<call_put_flag>
    '''
        
    # Get data
    ticker = Ticker(str(symbol))
    price = int(price) / 100
    vol = ticker.history(period="1Y")["Close"].std()
    div = ticker.info["dividendRate"]
    
    if div is None:
        div = 0.0
        
    mat_time = ((datetime.strptime(mat_date, '%Y-%m-%d') - datetime.now()).days) / 365

    # Convert to fraction
    rf = int(rf) / 10000
    vol = vol / 100
    div = div / 100
    strike = int(strike) / 100


    # Calculate d1 and d2
    d1 = (log(float(price) / strike)+((rf - div) + vol * vol / 2.) * mat_time) / ( vol * sqrt(mat_time))
    d2 = d1 - vol * sqrt(mat_time)
    
    # Calculate premium
    if call_put_flag =='c':
        premium = price * exp(-div * mat_time) * norm.cdf(d1) - strike * exp(-rf * mat_time) * norm.cdf(d2)
        return jsonify({"premium" : premium})
    
    elif call_put_flag == "p":
        premium = strike * exp(-rf * mat_time) * norm.cdf(-d2) -price * exp(-div * mat_time) * norm.cdf(-d1)
        return jsonify({"premium" : premium})
    
    else:
        return jsonify({"Error : could not calculate premium"})

@app.route("/option_yf/<symbol>/<strike>/<mat_date>/<call_put_flag>")
def OptionPrice(symbol : str,
                strike : int,
                mat_date : str,
                call_put_flag : str = "c" or "p"):
    '''Returns option chain from yfinance
    
    URL format : /option_yf/<symbol>/<strike>/<mat_date>/<call_put_flag>
    '''
    
    ticker = Ticker(symbol)
    
    # Get closest date
    option_dates = ticker.options
    option_dates = [datetime.strptime(date, '%Y-%m-%d').date() for date in option_dates]
    date = min(option_dates, key=lambda x: abs(x - datetime.strptime(mat_date, '%Y-%m-%d').date()))
    date = date.strftime('%Y-%m-%d')

    # Declare option_chain car
    option_chain = None
    
    # Get stock option date for calls or puts
    if call_put_flag == "c":
        option_chain = ticker.option_chain(date).calls
    
    elif call_put_flag == "p":
        option_chain = ticker.option_chain(date).puts
    
    else:
        raise CustomException("Error getting option premiums")
        
    # Parse option date to JSON
    strike = int(strike)/100
    closest_strike = min(option_chain["strike"], key=lambda x: abs(x - strike))
    option = option_chain[option_chain["strike"] == closest_strike]
    result = option.to_json(orient="split")
    
    return json.loads(result)


if __name__ == '__main__':
    app.run(debug=True)