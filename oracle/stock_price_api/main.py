from flask import Flask, request, jsonify
from yfinance import Ticker

app = Flask(__name__)

@app.route('/')
def home():
  return "Stock Price API v0.1 "

@app.route("/test")
def test():
    return "Test: Pass"

@app.route("/quote")
def display_quote():
    symbol = request.args.get('symbol', default="SPY")
    tickerinfo = Ticker(symbol).info
    try:
        quote = tickerinfo['currentPrice']
    except:
        quote = tickerinfo['navPrice']
        
    return jsonify({"close" : quote})

if __name__ == '__main__':
    app.run(debug=True)