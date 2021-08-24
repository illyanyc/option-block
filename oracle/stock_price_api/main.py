from flask import Flask, request, jsonify
# from yfinance import Ticker
import alpaca_trade_api as tradeapi

app = Flask(__name__)


api = tradeapi.REST(
"PKRG0ECAA5JI5N80I4WY",
"GYCxaneWb48clfFItOUvCYhf6DUEvgmAEl7s16jC",
api_version = "v2"
)

@app.route('/')
def home():
  return "Stock Price API v0.1 "

@app.route("/test")
def test():
    return "Test: Pass"

@app.route("/quote")
def display_quote():
    symbol = request.args.get('symbol', default="SPY")
    # quote = Ticker(symbol).info['currentPrice']
    barset = api.get_barset(symbol, 'day', limit=1)
    return jsonify({"close" : barset[symbol][0].c})

if __name__ == '__main__':
    app.run(debug=True)