import logging
import random
import csv
import os
from datetime import datetime, timedelta

import yfinance as yf
from flask import Flask, render_template, jsonify
from flask_cors import CORS  # Only if frontend is served from a different origin

app = Flask(__name__)
CORS(app)  # Enable CORS if needed

# Load stocks from CSV at startup
STOCKS = []
try:
    csv_path = os.path.join(os.path.dirname(__file__), 'alllisted.csv')
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['Symbol'] and row['Description']:
                description = row['Description']
                if 'Common Stock' in description:
                    # Filter to include only Common Stock, and remove the phrase from the name
                    clean_company = description.replace('Common Stock', '').strip()
                    STOCKS.append({
                        'ticker': row['Symbol'],
                        'company': clean_company
                    })
    logging.info(f"Loaded {len(STOCKS)} stocks from {csv_path}")
except Exception as e:
    logging.error(f"Error loading stocks from CSV: {e}")
    STOCKS = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/get_stock')
def get_stock():
    try:
        if not STOCKS:
            return jsonify({'error': 'No stocks available.'}), 500

        # Randomly select a stock
        stock = random.choice(STOCKS)
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

        # Extract OHLC and closing prices and dates
        ohlc_data = [{
            'x': int(date.timestamp() * 1000),
            'y': [row['Open'].iloc[0], row['High'].iloc[0], row['Low'].iloc[0], row['Close'].iloc[0]]
        } for date, row in data[['Open', 'High', 'Low', 'Close']].iterrows()]
        close_data = data['Close']

        history = close_data.values.tolist()

        # Show all data except the last week (which will be revealed after prediction)
        prediction_days = 5  # 5 trading days = 1 week
        visible_days = len(history) - prediction_days

        # Determine actual change (up/down) based on the last visible day and the next week
        last_visible_price = history[visible_days - 1]
        future_price = history[visible_days + prediction_days - 1]
        actual_change = 'up' if future_price > last_visible_price else 'down'

        # Get dates for the question period
        visible_data = data.iloc[:visible_days]
        start_date_str = visible_data.index[0].strftime('%Y-%m-%d')
        end_date_str = visible_data.index[-1].strftime('%Y-%m-%d')

        return jsonify({
            'ticker': ticker,
            'company': company,
            'prices': history,
            'ohlc': ohlc_data,
            'visibleDays': visible_days,
            'predictionDays': prediction_days,
            'actualChange': actual_change,
            'questionStartDate': start_date_str,
            'questionEndDate': end_date_str
        }), 200

    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
