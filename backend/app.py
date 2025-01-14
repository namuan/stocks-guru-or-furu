import logging
import random
from datetime import datetime, timedelta

import yfinance as yf
from flask import Flask, render_template, jsonify
from flask_cors import CORS  # Only if frontend is served from a different origin

app = Flask(__name__)
CORS(app)  # Enable CORS if needed

PREDEFINED_STOCKS = [
    {'ticker': 'AAPL', 'company': 'Apple Inc.'},
    {'ticker': 'GOOGL', 'company': 'Alphabet Inc.'},
    {'ticker': 'MSFT', 'company': 'Microsoft Corporation'},
    {'ticker': 'AMZN', 'company': 'Amazon.com Inc.'},
    {'ticker': 'TSLA', 'company': 'Tesla Inc.'},
    {'ticker': 'META', 'company': 'Meta Platforms Inc.'},  # FB changed to META
    {'ticker': 'NFLX', 'company': 'Netflix Inc.'},
    {'ticker': 'NVDA', 'company': 'NVIDIA Corporation'},
    {'ticker': 'JPM', 'company': 'JPMorgan Chase & Co.'},
    {'ticker': 'V', 'company': 'Visa Inc.'}
]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/get_stock')
def get_stock():
    try:
        # Randomly select a stock
        stock = random.choice(PREDEFINED_STOCKS)
        ticker = stock['ticker']
        company = stock['company']

        # Get 10 years of data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * 10)

        # Get a random date between start_date and (end_date - 3 months - 1 week)
        max_random_date = end_date - timedelta(days=100)  # 3 months + ~1 week
        random_days = (max_random_date - start_date).days
        random_date = start_date + timedelta(days=random.randint(0, random_days))

        # Calculate the end date for our 3-month + 1-week window
        period_end_date = random_date + timedelta(days=100)  # ~3 months + 1 week

        # Fetch data for our random 3-month + 1-week period
        data = yf.download(ticker, start=random_date, end=period_end_date, interval='1d')

        if data.empty:
            return jsonify({'error': 'No data found for the selected stock.'}), 404

        # Extract closing prices and dates
        close_data = data['Close']

        history = close_data.values.tolist()
        dates = data.index.strftime('%Y-%m-%d').tolist()

        # Show all data except the last week (which will be revealed after prediction)
        prediction_days = 5  # 5 trading days = 1 week
        visible_days = len(history) - prediction_days

        # Determine actual change (up/down) based on the last visible day and the next week
        last_visible_price = history[visible_days - 1]
        future_price = history[visible_days + prediction_days - 1]
        actual_change = 'up' if future_price > last_visible_price else 'down'

        return jsonify({
            'ticker': ticker,
            'company': company,
            'prices': history,
            'dates': dates,
            'visibleDays': visible_days,
            'predictionDays': prediction_days,
            'actualChange': actual_change
        })

    except Exception as e:
        logging.error(f"Error: {e}", e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
