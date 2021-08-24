import os
from flask import Flask
import yfinance as yf

app = Flask(__name__)

@app.route("/quote")
def display_quote():
    symbol = request.args.get('symbol', default="SPY")
    quote = yf.Ticker(symbol).info['currentPrice']
    return {"price" : quote}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))