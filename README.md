
# TradingView Chart with Yahoo Finance Data

This project is a web application that displays a TradingView lightweight chart with candlestick data fetched from Yahoo Finance. Users can input a stock symbol and select different timeframes to view the corresponding stock data. The application also includes a theme toggle feature to switch between light and dark modes.

## Features

- Fetch and display stock data from Yahoo Finance
- View stock data in different timeframes (1 minute, 5 minutes, 15 minutes, hourly, daily, weekly, monthly)
- Toggle between light and dark themes

## Installation

Follow these steps to set up and run the application:

### Prerequisites

- Python 3.x

### Steps

1. **Clone the repository:**

   ```sh
   git clone https://github.com/marketcalls/tradingview-yahoo-finance.git
   cd tradingview-yahoo-finance
   ```

2. **Create a virtual environment(Windows):**

   ```sh
   python -m venv venv
   myenv\Scripts\activate.bat
   ```

3. **Install the dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Run the Flask application:**

   ```sh
   python app.py
   ```

5. **Open your web browser and visit:**

   ```
   http://127.0.0.1:5000
   ```

## License

This project is licensed under the MIT License. 