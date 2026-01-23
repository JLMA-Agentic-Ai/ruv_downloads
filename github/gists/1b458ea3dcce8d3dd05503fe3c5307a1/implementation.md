## Project Structure

```
crypto_trading_bot/
├── README.md
├── .env
├── requirements.txt
├── db_setup.py
├── api_integration.py
├── narrative_prediction.py
├── profit_taking.py
├── backtesting.py
├── main.py
├── tests/
    ├── __init__.py
    ├── test_db_setup.py
    ├── test_api_integration.py
    ├── test_narrative_prediction.py
    ├── test_profit_taking.py
```

---

## Project Setup Guide

### Prerequisites

- **Python 3.7 or higher** installed on your system.
- A **Crypto.com Exchange API key and secret**.
- An **OpenAI API key** for using `liteLLM`.

### Steps

1. **Clone the Repository**

   Create a directory for the project:

   ```bash
   mkdir crypto_trading_bot
   cd crypto_trading_bot
   ```

2. **Create a Virtual Environment (Optional but Recommended)**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use venv\Scripts\activate
   ```

3. **Create the `requirements.txt` File**

   ```bash
   echo "requests\nsqlalchemy\npython-dotenv\nlitellm\npandas" > requirements.txt
   ```

4. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set Up Environment Variables**

   Create a `.env` file in the project root directory with your API credentials:

   ```
   CRYPTO_API_KEY=your_crypto_api_key
   CRYPTO_API_SECRET=your_crypto_api_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

   Replace `your_crypto_api_key`, `your_crypto_api_secret`, and `your_openai_api_key` with your actual API keys.

6. **Add the Python Scripts**

   Create the necessary `.py` files as per the project structure and copy the code provided below into each file.

7. **Run the Script**

   ```bash
   python main.py
   ```

8. **Run Unit Tests**

   Navigate to the project directory and run:

   ```bash
   python -m unittest discover tests
   ```

---

## Documentation

### Overview

This project implements a profit-taking script for Crypto.com that uses narrative predictions to optimize exit and reinvestment timing before each trade. It includes:

- **Environment setup**
- **Database configuration** using SQLAlchemy
- **API integration** with Crypto.com Exchange
- **Profit-taking logic** enhanced with narrative predictions using `liteLLM`
- **Backtesting and simulation**
- **Unit testing** for each module

---

## File Explanations and Code

### 1. `requirements.txt`

List of all required Python packages.

```txt
requests
sqlalchemy
python-dotenv
litellm
pandas
```

---

### 2. `.env`

Environment variables file. **Do not share this file publicly.**

```
CRYPTO_API_KEY=your_crypto_api_key
CRYPTO_API_SECRET=your_crypto_api_secret
OPENAI_API_KEY=your_openai_api_key
```

---

### 3. `db_setup.py`

Sets up the database and defines the `Trade` model.

```python
# db_setup.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# Database setup
engine = create_engine('sqlite:///trading.db')
Base = declarative_base()

class Trade(Base):
    __tablename__ = 'trades'
    id = Column(Integer, primary_key=True)
    asset = Column(String)
    purchase_price = Column(Float)
    quantity = Column(Float)
    purchase_time = Column(DateTime, default=datetime.datetime.utcnow)
    sell_price = Column(Float, nullable=True)
    sell_time = Column(DateTime, nullable=True)
    profit = Column(Float, nullable=True)
    narrative = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
```

---

### 4. `api_integration.py`

Contains functions to interact with the Crypto.com Exchange API.

```python
# api_integration.py
import requests
import hmac
import hashlib
import time
import os
from dotenv import load_dotenv

# Load API credentials from .env file
load_dotenv()
API_KEY = os.getenv('CRYPTO_API_KEY')
API_SECRET = os.getenv('CRYPTO_API_SECRET')
BASE_URL = 'https://api.crypto.com/v2/'

def get_signature(payload, secret):
    """Generate API signature."""
    param_string = ''
    for key in sorted(payload.keys()):
        if key != 'sig':
            param_string += key + str(payload[key])
    sig = hmac.new(
        bytes(secret, 'utf-8'),
        msg=bytes(param_string, 'utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()
    return sig

def api_request(method, params):
    """Make an API request to Crypto.com."""
    try:
        payload = {
            'id': int(time.time() * 1000),
            'method': method,
            'api_key': API_KEY,
            'params': params,
            'nonce': int(time.time() * 1000)
        }
        payload['sig'] = get_signature(payload, API_SECRET)
        response = requests.post(BASE_URL + method, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API request error: {e}")
        return {'error': str(e)}

def get_account_balance():
    """Retrieve account balance."""
    method = 'private/get-account-summary'
    params = {}
    response = api_request(method, params)
    return response

def get_market_price(symbol):
    """Retrieve current market price for a symbol."""
    method = 'public/get-ticker'
    params = {'instrument_name': symbol}
    try:
        response = requests.get(BASE_URL + method, params=params)
        response.raise_for_status()
        data = response.json()
        return float(data['result']['data'][0]['a'])
    except requests.exceptions.RequestException as e:
        print(f"Market price retrieval error: {e}")
        return None

def execute_buy_order(symbol, notional_amount):
    """Execute a buy order."""
    method = 'private/create-order'
    params = {
        'instrument_name': symbol,
        'side': 'BUY',
        'type': 'MARKET',
        'notional': notional_amount
    }
    response = api_request(method, params)
    return response

def execute_sell_order(symbol, quantity):
    """Execute a sell order."""
    method = 'private/create-order'
    params = {
        'instrument_name': symbol,
        'side': 'SELL',
        'type': 'MARKET',
        'quantity': quantity
    }
    response = api_request(method, params)
    return response
```

---

### 5. `narrative_prediction.py`

Generates narrative-based predictions using `liteLLM`.

```python
# narrative_prediction.py
from litellm import completion
import datetime
import os
from dotenv import load_dotenv

# Load OpenAI API key from .env file
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def generate_narrative_prediction(asset, latest_price, volume, current_time):
    """Generate a narrative-based prediction for the asset."""
    prompt = f"""
    Write a detailed financial news article dated {current_time + datetime.timedelta(hours=24)} where a senior cryptocurrency analyst at a major investment bank is reviewing {asset}'s price movements over the past 24 hours. The analyst should:

    1. Set the Scene:
       - Current price: {latest_price}
       - 24h trading volume: {volume}
       - Key support/resistance levels
       - Recent market sentiment

    2. Provide Hourly Analysis:
       - Review each hour's price movement
       - Volume patterns
       - Key market events
       - Technical indicator shifts

    3. Statistical Validation:
       - Compare predictions to actual prices
       - Calculate accuracy metrics:
         * MAPE (Mean Absolute Percentage Error)
         * RMSE (Root Mean Square Error)
         * Directional Accuracy
         * Maximum Deviation

    4. Market Context:
       - ETF flow impact
       - Institutional trading patterns
       - Regional market influences
       - Technical level breaches

    5. Future Projections:
       - Next 24h price targets
       - Volume expectations
       - Key levels to watch
       - Risk factors

    Note: All predictions must be based on data available at {current_time} and include specific price levels and confidence intervals.
    """
    response = completion(prompt=prompt, api_key=OPENAI_API_KEY, model='gpt-3.5-turbo')
    return response

def extract_prediction(narrative):
    """Extract key predictions and confidence scores from the narrative."""
    # Placeholder for actual parsing logic.
    # In practice, implement NLP to extract structured data from the narrative.

    # Dummy data for illustration
    predicted_price_change = 1.05  # Indicates a 5% increase
    confidence_score = 0.8  # 80% confidence

    return {
        'next_24h_price_target': predicted_price_change,
        'confidence_score': confidence_score
    }
```

---

### 6. `profit_taking.py`

Contains the profit-taking logic, enhanced with narrative predictions.

```python
# profit_taking.py
import time
import datetime
from db_setup import session, Trade
from api_integration import get_market_price, execute_sell_order, get_account_balance
from narrative_prediction import generate_narrative_prediction, extract_prediction

def monitor_and_sell(asset, profit_threshold):
    """Monitor asset price and execute sell when profit threshold is met."""
    # Retrieve the latest trade for the asset
    trade = session.query(Trade).filter_by(asset=asset, sell_price=None).order_by(Trade.purchase_time.desc()).first()
    if not trade:
        print(f"No active trade found for {asset}.")
        return

    purchase_price = trade.purchase_price
    quantity = trade.quantity
    current_time = datetime.datetime.utcnow()

    # Get narrative prediction
    latest_price = get_market_price(asset)
    volume_info = get_account_balance()  # Adjust as needed
    narrative_response = generate_narrative_prediction(asset, latest_price, volume_info, current_time)
    narrative = narrative_response['choices'][0]['message']['content']
    prediction_data = extract_prediction(narrative)

    # Adjust profit threshold based on prediction
    predicted_price_change = prediction_data['next_24h_price_target']
    confidence_score = prediction_data['confidence_score']
    adjusted_profit_threshold = profit_threshold * predicted_price_change * confidence_score

    print(f"Adjusted profit threshold based on narrative prediction: {adjusted_profit_threshold}%")

    target_price = purchase_price * (1 + adjusted_profit_threshold / 100)
    print(f"Monitoring {asset} for a target sell price of {target_price}")

    # Save narrative and confidence score to the trade record
    trade.narrative = narrative
    trade.confidence_score = confidence_score
    session.commit()

    while True:
        current_price = get_market_price(asset)
        if current_price is None:
            time.sleep(60)
            continue
        print(f"[{datetime.datetime.utcnow()}] Current price of {asset}: {current_price}")

        if current_price >= target_price:
            # Execute sell order
            sell_order = execute_sell_order(asset, quantity)
            if sell_order.get('result'):
                sell_price = current_price
                sell_time = datetime.datetime.utcnow()
                profit = (sell_price - purchase_price) * quantity

                # Update trade record
                trade.sell_price = sell_price
                trade.sell_time = sell_time
                trade.profit = profit
                session.commit()
                print(f"Sold {quantity} of {asset} at {sell_price}. Profit: {profit}")
                break
            else:
                print(f"Sell order failed: {sell_order.get('error')}")
        time.sleep(60)  # Wait for 1 minute before checking again
```

---

### 7. `backtesting.py`

Module for backtesting the strategy using historical data.

```python
# backtesting.py
import pandas as pd
from narrative_prediction import generate_narrative_prediction, extract_prediction

def backtest_strategy(asset, profit_threshold, historical_data):
    """Simulate profit-taking strategy using historical data and narrative predictions."""
    initial_balance = 10000  # Starting with $10,000
    balance = initial_balance
    position = 0
    purchase_price = 0

    print(f"Starting backtest for {asset} with profit threshold of {profit_threshold}%")

    for index, row in historical_data.iterrows():
        date = pd.to_datetime(row['date'])
        price = row['price']

        if position == 0:
            # Buy condition
            position = balance / price
            purchase_price = price
            balance = 0
            print(f"Bought {position} of {asset} at {price} on {date}")
        elif position > 0:
            # Generate narrative prediction
            current_time = date
            latest_price = price
            volume_info = None  # Adjust as needed
            narrative_response = generate_narrative_prediction(asset, latest_price, volume_info, current_time)
            narrative = narrative_response['choices'][0]['message']['content']
            prediction_data = extract_prediction(narrative)

            # Adjust profit threshold
            predicted_price_change = prediction_data['next_24h_price_target']
            confidence_score = prediction_data['confidence_score']
            adjusted_profit_threshold = profit_threshold * predicted_price_change * confidence_score
            target_price = purchase_price * (1 + adjusted_profit_threshold / 100)

            # Sell condition
            if price >= target_price:
                balance = position * price
                profit = balance - initial_balance
                print(f"Sold {position} of {asset} at {price} on {date}. Profit: {profit}")
                position = 0

    final_balance = balance if balance > 0 else position * price
    total_profit = final_balance - initial_balance
    print(f"Backtest completed. Total Profit: {total_profit}")
```

---

### 8. `main.py`

The main script that ties everything together.

```python
# main.py
from db_setup import session, Trade
from api_integration import get_market_price, execute_buy_order, get_account_balance
from profit_taking import monitor_and_sell
from narrative_prediction import generate_narrative_prediction, extract_prediction
import datetime

if __name__ == "__main__":
    asset = 'BTC_USDT'
    profit_threshold = 5  # 5% base profit target

    # Check if there's an existing trade
    existing_trade = session.query(Trade).filter_by(asset=asset, sell_price=None).first()

    if not existing_trade:
        # Execute a buy order based on narrative prediction
        amount_to_invest = 1000  # Invest $1,000
        current_time = datetime.datetime.utcnow()
        latest_price = get_market_price(asset)
        if latest_price is None:
            print("Unable to retrieve latest price. Exiting.")
            exit()

        volume_info = get_account_balance()  # Adjust as needed

        # Generate narrative prediction before buying
        narrative_response = generate_narrative_prediction(asset, latest_price, volume_info, current_time)
        narrative = narrative_response['choices'][0]['message']['content']
        prediction_data = extract_prediction(narrative)

        # Decide whether to buy based on prediction
        predicted_price_change = prediction_data['next_24h_price_target']
        confidence_score = prediction_data['confidence_score']

        if predicted_price_change > 1 and confidence_score > 0.7:
            # Prediction is positive and confidence is high
            buy_order = execute_buy_order(asset, amount_to_invest)
            if buy_order.get('result'):
                purchase_price = latest_price
                quantity = amount_to_invest / purchase_price
                new_trade = Trade(
                    asset=asset,
                    purchase_price=purchase_price,
                    quantity=quantity,
                    purchase_time=datetime.datetime.utcnow(),
                    narrative=narrative,
                    confidence_score=confidence_score
                )
                session.add(new_trade)
                session.commit()
                print(f"Bought {quantity} of {asset} at {purchase_price}")
            else:
                print(f"Buy order failed: {buy_order.get('error')}")
        else:
            print("Skipping buy order based on narrative prediction.")
    else:
        print(f"Existing trade found for {asset}.")

    # Monitor and execute sell order when profit target is reached
    monitor_and_sell(asset, profit_threshold)
```

---

### 9. `tests/` Directory

Contains unit tests for each module.

#### `tests/__init__.py`

An empty file to make the directory a package.

```python
# tests/__init__.py
```

#### `tests/test_db_setup.py`

Unit tests for the database setup.

```python
# tests/test_db_setup.py
import unittest
from db_setup import session, Trade

class TestDBSetup(unittest.TestCase):
    def test_trade_creation(self):
        trade = Trade(
            asset='BTC_USDT',
            purchase_price=50000.0,
            quantity=0.02
        )
        session.add(trade)
        session.commit()
        retrieved_trade = session.query(Trade).filter_by(id=trade.id).first()
        self.assertIsNotNone(retrieved_trade)
        self.assertEqual(retrieved_trade.asset, 'BTC_USDT')
        session.delete(retrieved_trade)
        session.commit()

if __name__ == '__main__':
    unittest.main()
```

#### `tests/test_api_integration.py`

Unit tests for API integration functions.

```python
# tests/test_api_integration.py
import unittest
from api_integration import get_market_price, get_account_balance

class TestAPIIntegration(unittest.TestCase):
    def test_get_market_price(self):
        price = get_market_price('BTC_USDT')
        self.assertIsInstance(price, float)

    def test_get_account_balance(self):
        balance = get_account_balance()
        self.assertIn('result', balance)

if __name__ == '__main__':
    unittest.main()
```

#### `tests/test_narrative_prediction.py`

Unit tests for narrative prediction functions.

```python
# tests/test_narrative_prediction.py
import unittest
from narrative_prediction import generate_narrative_prediction, extract_prediction
import datetime

class TestNarrativePrediction(unittest.TestCase):
    def test_generate_narrative_prediction(self):
        asset = 'BTC_USDT'
        latest_price = 50000.0
        volume = {}
        current_time = datetime.datetime.utcnow()
        response = generate_narrative_prediction(asset, latest_price, volume, current_time)
        self.assertIn('choices', response)
        self.assertGreater(len(response['choices']), 0)

    def test_extract_prediction(self):
        narrative = "Dummy narrative content."
        prediction = extract_prediction(narrative)
        self.assertIn('next_24h_price_target', prediction)
        self.assertIn('confidence_score', prediction)

if __name__ == '__main__':
    unittest.main()
```

#### `tests/test_profit_taking.py`

Unit tests for the profit-taking logic.

```python
# tests/test_profit_taking.py
import unittest
from profit_taking import monitor_and_sell
from db_setup import session, Trade
from unittest.mock import patch

class TestProfitTaking(unittest.TestCase):
    @patch('profit_taking.get_market_price')
    @patch('profit_taking.execute_sell_order')
    def test_monitor_and_sell(self, mock_execute_sell_order, mock_get_market_price):
        # Setup
        asset = 'BTC_USDT'
        trade = Trade(
            asset=asset,
            purchase_price=50000.0,
            quantity=0.02
        )
        session.add(trade)
        session.commit()

        # Mock responses
        mock_get_market_price.return_value = 52500.0  # Simulate a 5% increase
        mock_execute_sell_order.return_value = {'result': True}

        # Test
        monitor_and_sell(asset, profit_threshold=5)

        # Verify
        updated_trade = session.query(Trade).filter_by(id=trade.id).first()
        self.assertIsNotNone(updated_trade.sell_price)
        self.assertIsNotNone(updated_trade.profit)

        # Cleanup
        session.delete(updated_trade)
        session.commit()

if __name__ == '__main__':
    unittest.main()
```

---

## Guidance and Additional Notes

- **API Keys:** Ensure that your `.env` file contains valid API keys for both Crypto.com Exchange and OpenAI.
- **OpenAI Usage:** Be aware of OpenAI's usage policies and any associated costs with using their API.
- **Data Privacy:** Do not log sensitive information such as API keys or account balances.
- **Error Handling:** The code includes basic error handling, but you may want to enhance it for robustness.
- **Testing:** The unit tests use mocking where necessary to simulate API responses and should be run in a test environment.
- **Logging:** Consider adding logging to monitor the script's behavior over time.

---

## Running the Script and Tests

### Running the Script

```bash
python main.py
```

This will start the trading bot. It will attempt to execute a buy order based on narrative prediction and then monitor the market to execute a sell order when the adjusted profit threshold is met.

### Running Unit Tests

Navigate to the project directory and run:

```bash
python -m unittest discover tests
```

This command discovers and runs all unit tests in the `tests` directory.

---

## Conclusion

This project provides a comprehensive implementation of a profit-taking script for Crypto.com, enhanced with narrative predictions to optimize trading decisions. The inclusion of unit tests ensures that each component functions as expected, promoting code reliability and maintainability.

---

**Disclaimer:** Trading cryptocurrencies involves significant risk, and this script is for educational purposes only. It does not constitute financial advice. Always conduct thorough testing and consider consulting a professional financial advisor before deploying any trading bots in a live environment.


