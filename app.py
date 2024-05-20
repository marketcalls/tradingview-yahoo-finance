from flask import Flask, render_template, jsonify
import yfinance as yf
from datetime import datetime, timedelta

app = Flask(__name__)

def fetch_yahoo_data(ticker, interval):
    end_date = datetime.now()
    if interval in ['1m', '5m']:
        start_date = end_date - timedelta(days=7)
    if interval in ['15m', '60m']:
        start_date = end_date - timedelta(days=30)
    elif interval == '1d':
        start_date = end_date - timedelta(days=365*5)
    elif interval == '1wk':
        start_date = end_date - timedelta(weeks=365*5)
    elif interval == '1mo':
        start_date = end_date - timedelta(days=365*5)

    data = yf.download(ticker, start=start_date, end=end_date, interval=interval)
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
    return candlestick_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data/<ticker>/<interval>')
def get_data(ticker, interval):
    data = fetch_yahoo_data(ticker, interval)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)