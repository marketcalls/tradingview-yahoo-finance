from flask import Flask, render_template, jsonify
import yfinance as yf
import pandas as pd
import pandas_ta as ta
from datetime import datetime, timedelta
import json

app = Flask(__name__)

def fetch_yahoo_data(ticker, interval, ema_period=20, rsi_period=14):
    ticker = yf.Ticker(ticker)

    end_date = datetime.now()
    if interval in ['1m', '5m']:
        start_date = end_date - timedelta(days=7)
    elif interval in ['15m', '60m']:
        start_date = end_date - timedelta(days=60)
    elif interval == '1d':
        start_date = end_date - timedelta(days=365*5)
    elif interval == '1wk':
        start_date = end_date - timedelta(weeks=365*5)
    elif interval == '1mo':
        start_date = end_date - timedelta(days=365*5)

    data = ticker.history(start=start_date, end=end_date, interval=interval)
    data['EMA'] = ta.ema(data['Close'], length=ema_period)
    data['RSI'] = ta.rsi(data['Close'], length=rsi_period)

    candlestick_data = [
        {
            'time': int(row.Index.timestamp()),
            'open': row.Open,
            'high': row.High,
            'low': row.Low,
            'close': row.Close
        }
        for row in data.itertuples()
    ]

    ema_data = [
        {
            'time': int(row.Index.timestamp()),
            'value': row.EMA
        }
        for row in data.itertuples() if not pd.isna(row.EMA)
    ]

    rsi_data = [
        {
            'time': int(row.Index.timestamp()),
            'value': row.RSI if not pd.isna(row.RSI) else 0  # Convert NaN to zero
        }
        for row in data.itertuples()
    ]

    return candlestick_data, ema_data, rsi_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data/<ticker>/<interval>/<int:ema_period>/<int:rsi_period>')
def get_data(ticker, interval, ema_period, rsi_period):
    candlestick_data, ema_data, rsi_data = fetch_yahoo_data(ticker, interval, ema_period, rsi_period)
    return jsonify({'candlestick': candlestick_data, 'ema': ema_data, 'rsi': rsi_data})

@app.route('/api/symbols')
def get_symbols():
    with open('symbols.txt') as f:
        symbol_list = [line.strip() for line in f]
    
    # Get real quotes for symbols
    try:
        symbols_str = ' '.join(symbol_list)
        tickers = yf.Tickers(symbols_str)
        
        symbols_data = []
        for symbol in symbol_list:
            try:
                ticker_info = tickers.tickers[symbol].info
                quote_data = {
                    'symbol': symbol,
                    'price': ticker_info.get('currentPrice', 0),
                    'change': ticker_info.get('regularMarketChangePercent', 0),
                    'name': ticker_info.get('shortName', symbol),
                    'currency': ticker_info.get('currency', 'USD')
                }
                symbols_data.append(quote_data)
            except Exception as e:
                # Fallback data if we can't get info for a particular symbol
                symbols_data.append({
                    'symbol': symbol,
                    'price': 0,
                    'change': 0,
                    'name': symbol,
                    'currency': 'USD'
                })
                print(f"Error getting data for {symbol}: {e}")
        
        return jsonify(symbols_data)
    
    except Exception as e:
        print(f"Error fetching quotes: {e}")
        # Fallback to just returning the symbols without data
        return jsonify([{'symbol': s, 'price': 0, 'change': 0, 'name': s, 'currency': 'USD'} for s in symbol_list])

if __name__ == '__main__':
    app.run(debug=True)