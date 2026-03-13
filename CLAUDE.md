# CLAUDE.md - TradingView Yahoo Finance Developer Guide

This document provides a comprehensive overview of the TradingView Yahoo Finance repository for AI assistants and developers. It covers the codebase structure, development workflows, architectural patterns, and conventions to follow when contributing to this project.

## Project Overview

**TradingView Yahoo Finance** is a Flask-based web application that displays interactive stock charts using TradingView's Lightweight Charts library with real-time financial data fetched from Yahoo Finance. The application features:

- Real-time stock data visualization with OHLC candlestick charts
- Technical indicators: Exponential Moving Average (EMA) and Relative Strength Index (RSI)
- Multi-timeframe analysis (1m, 5m, 15m, 1h, 1d, 1wk, 1mo)
- Dynamic watchlist management with persistent SQLite storage
- Modern, responsive UI with light/dark theme toggle
- Real-time quote updates for watchlisted symbols

## Repository Structure

```
tradingview-yahoo-finance/
├── app.py                    # Main Flask application (172 lines)
├── models.py                 # SQLAlchemy ORM models (22 lines)
├── requirements.txt          # Python dependencies (35 packages)
├── templates/
│   └── index.html           # Main HTML template with embedded CSS/JS
├── static/
│   └── main.js              # Frontend JavaScript logic
├── README.md                # User-facing project documentation
└── CLAUDE.md                # This file - AI assistant guide
```

## Technology Stack

**Backend:**
- **Flask 3.0.3** - Web framework for routing and serving
- **SQLAlchemy 2.0.40** - ORM for database operations
- **SQLite** - Database (auto-created as `symbols.db`)
- **yfinance 0.2.61** - Yahoo Finance API client
- **pandas 2.2.2** - Data manipulation and analysis
- **pandas_ta 0.3.14b0** - Technical analysis indicators (EMA, RSI)

**Frontend:**
- **Vanilla JavaScript** - No frameworks; lightweight and responsive
- **Lightweight Charts** - TradingView charting library (via CDN)
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **DaisyUI 3.9.3** - Component library built on Tailwind (via CDN)

## Architecture & Design Patterns

### Backend Architecture

The Flask application uses a simple, straightforward architecture:

1. **Route Handlers** (`app.py:1-173`)
   - `GET /` - Serves `index.html`
   - `GET /api/data/<ticker>/<interval>/<ema_period>/<rsi_period>` - Returns chart data
   - `GET /api/symbols` - Returns watchlist with current quotes
   - `POST /api/symbols` - Adds new symbol to watchlist (with validation)
   - `DELETE /api/symbols/<id>` - Removes symbol from watchlist

2. **Data Fetching** (`app.py:20-66`)
   - `fetch_yahoo_data()` function handles all Yahoo Finance API calls
   - Dynamically calculates start_date based on interval
   - Processes data with pandas and technical indicators
   - Returns structured JSON for frontend consumption

3. **Database** (`models.py`)
   - Single `Symbol` model with fields: `id`, `ticker`, `name`, `created_at`
   - Instance method `to_dict()` for JSON serialization
   - Automatic initialization with 8 default symbols (AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA, NFLX)

4. **Error Handling**
   - Graceful fallbacks for API failures (returns empty/default data)
   - Try-catch blocks in data fetching (app.py:117-126)
   - Symbol validation against Yahoo Finance before adding (app.py:150-154)

### Frontend Architecture

Single-page application (SPA) with vanilla JavaScript:

1. **Global State** - Managed via JavaScript object properties
2. **Event Listeners** - DOM events trigger API calls and UI updates
3. **Async API Calls** - Uses Fetch API for all backend communication
4. **Chart Management** - Lightweight Charts library with series management
5. **Theme Toggle** - Toggles `dark` class on `<html>` element for Tailwind dark mode

## Development Setup

### Prerequisites
- Python 3.x
- pip (Python package manager)

### Quick Start

```bash
# 1. Clone and navigate
git clone https://github.com/marketcalls/tradingview-yahoo-finance.git
cd tradingview-yahoo-finance

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run application
python app.py

# 6. Open browser
# Navigate to http://127.0.0.1:5000
```

**Note:** Debug mode is enabled by default in `app.py:173`. The Flask development server auto-reloads on code changes.

## Code Conventions & Patterns

### Python Conventions
- **Naming:** snake_case for functions and variables
- **API Routes:** All API endpoints follow `/api/<resource>` pattern
- **Error Responses:** Return JSON with `error` key and appropriate HTTP status codes
- **Database Sessions:** Use `db.session.add()`, `db.session.commit()`, `db.session.delete()`

### Flask Patterns Used
```python
# Route definition
@app.route('/api/endpoint/<param>')
def handler_function(param):
    return jsonify({'data': value})

# Database initialization in app context
with app.app_context():
    db.create_all()
```

### Error Handling Pattern
Try-catch blocks with fallback data (app.py:117-126):
```python
try:
    # Attempt operation
    result = some_operation()
except Exception as e:
    # Log and return fallback
    print(f"Error: {e}")
    return fallback_data
```

### JavaScript Conventions
- **Naming:** camelCase for functions and variables
- **API Calls:** Use Fetch API with `.json()` for response parsing
- **DOM Updates:** Direct manipulation or through template strings
- **Events:** Use `addEventListener()` for all event bindings

## API Documentation

### Chart Data Endpoint
**GET** `/api/data/<ticker>/<interval>/<ema_period>/<rsi_period>`

Returns OHLC candlestick data with EMA and RSI indicators.

**Parameters:**
- `ticker` - Stock symbol (e.g., "AAPL")
- `interval` - Timeframe: `1m`, `5m`, `15m`, `60m`, `1d`, `1wk`, `1mo`
- `ema_period` - EMA calculation period (typically 20)
- `rsi_period` - RSI calculation period (typically 14)

**Response:**
```json
{
  "candlestick": [
    {"time": 1234567890, "open": 150.0, "high": 152.0, "low": 149.5, "close": 151.5},
    ...
  ],
  "ema": [
    {"time": 1234567890, "value": 151.2},
    ...
  ],
  "rsi": [
    {"time": 1234567890, "value": 65.5},
    ...
  ]
}
```

### Watchlist Endpoints

**GET** `/api/symbols`

Returns all symbols in watchlist with current market data.

**Response:**
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "price": 185.50,
    "change": 2.34,
    "name": "Apple Inc."
  },
  ...
]
```

**POST** `/api/symbols`

Adds a new symbol to watchlist. Validates symbol exists via Yahoo Finance.

**Request:**
```json
{"symbol": "TSLA"}
```

**Response:** 201 Created
```json
{"message": "Symbol added successfully", "symbol": {...}}
```

**DELETE** `/api/symbols/<id>`

Removes symbol from watchlist.

**Response:** 200 OK
```json
{"message": "Symbol deleted successfully"}
```

## Key Functions & Utilities

### `fetch_yahoo_data(ticker, interval, ema_period=20, rsi_period=14)`

**Location:** `app.py:20-66`

Fetches historical OHLC data from Yahoo Finance and calculates technical indicators.

**Timeframe Logic:**
- `1m`, `5m` - Last 7 days
- `15m`, `60m` - Last 60 days
- `1d`, `1wk`, `1mo` - Last 5 years

**Process:**
1. Fetch data from yfinance
2. Calculate EMA using pandas_ta
3. Calculate RSI using pandas_ta
4. Convert to JSON-serializable format (Unix timestamps)
5. Return three lists: candlestick, ema, rsi

## Common Development Tasks

### Adding a New Technical Indicator

1. Import the pandas_ta function at top of `app.py`
2. Add calculation in `fetch_yahoo_data()` function
3. Create data list similar to EMA/RSI pattern
4. Return from function and add to response JSON
5. Update frontend JavaScript to create a new chart series

**Example:**
```python
# In fetch_yahoo_data()
data['MACD'] = ta.macd(data['Close'])
macd_data = [{'time': int(row.Index.timestamp()), 'value': row.MACD} for row in data.itertuples()]
```

### Adding a New API Endpoint

1. Define route in `app.py` with appropriate HTTP method
2. Use `@app.route()` decorator
3. Follow `/api/<resource>` naming pattern
4. Return JSON response using `jsonify()`
5. Use appropriate HTTP status codes (200, 201, 400, 404, etc.)

**Example:**
```python
@app.route('/api/new-endpoint', methods=['GET'])
def new_endpoint():
    try:
        data = some_operation()
        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

### Modifying Database Schema

1. Update the `Symbol` model in `models.py`
2. Delete existing `symbols.db` file (migrations not set up)
3. Application will auto-create new schema on startup
4. Re-add default symbols in `app.py:82-88`

## Database Schema

### Symbol Table
```
CREATE TABLE symbol (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Symbols:** AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA, NFLX

## AI Assistant Guidelines

When working on this codebase, follow these principles:

1. **Read First** - Always read existing code before making changes. Understand patterns and conventions.
2. **Simplicity First** - Avoid over-engineering. The current architecture is intentionally simple.
3. **Respect Patterns** - Follow existing Flask route structure, error handling, and naming conventions.
4. **No Premature Abstraction** - Don't create utilities for one-time operations or hypothetical future needs.
5. **Test Locally** - Run the application and test changes in the browser before committing.
6. **Clear Commits** - Use descriptive commit messages in imperative form ("Add feature" not "Added feature").
7. **External API Awareness** - Be mindful of yfinance rate limiting when making multiple requests.
8. **File References** - When discussing code, use format: `filename:line_number` (e.g., `app.py:20`)

## Git Workflow

**Development Branch:** `claude/add-claude-documentation-08jvk`

All changes should be committed to this branch with clear, focused commits:

```bash
# Make changes, then:
git add specific_files.py
git commit -m "Clear description of change"
git push -u origin claude/add-claude-documentation-08jvk
```

## Testing & Verification

### Manual Testing Checklist

1. **Application Startup**
   - Run `python app.py` successfully
   - No import errors or database issues
   - Server accessible at `http://127.0.0.1:5000`

2. **API Endpoints**
   - Chart data loads for various symbols/timeframes
   - Watchlist displays with current prices
   - Adding/removing symbols works
   - Error handling for invalid symbols

3. **Frontend**
   - Chart renders correctly with candlestick, EMA, RSI
   - Watchlist updates in real-time
   - Theme toggle switches between light/dark
   - Responsive on mobile devices

4. **Database**
   - New symbols persist across application restarts
   - Default symbols exist on first run
   - Duplicate symbol prevention works

## Performance Considerations

- **yfinance Rate Limiting:** Requests are rate-limited by Yahoo Finance. Implement caching if needed for high-frequency updates.
- **Chart Rendering:** Lightweight Charts is optimized for performance; large datasets (5+ years) may impact responsiveness.
- **Frontend Bundle:** All CSS/JS via CDN; no build step required, keeping deployment simple.
- **Database:** SQLite is fine for this project scope; consider PostgreSQL if scaling significantly.

## Useful Resources

- **Flask Documentation:** https://flask.palletsprojects.com/
- **SQLAlchemy ORM:** https://docs.sqlalchemy.org/
- **yfinance GitHub:** https://github.com/ranaroussi/yfinance
- **Lightweight Charts Docs:** https://tradingview.github.io/lightweight-charts/
- **Tailwind CSS:** https://tailwindcss.com/docs
