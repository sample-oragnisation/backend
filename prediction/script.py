import sys
import json
import pandas as pd
import pickle
import time
from statsmodels.tsa.statespace.sarimax import SARIMAX

start_time = time.time()

# Load SARIMA model
model_path = 'D:\\Projects\\Energy-Management-System\\backend\\prediction\\sarima_model.pkl'
try:
    with open(model_path, 'rb') as model_file:
        model = pickle.load(model_file)
    print(f"Model loaded in {time.time() - start_time} seconds")
except Exception as e:
    print(f"Error loading model: {e}")
    sys.exit(1)

# Read input data from Node.js
data_json = json.loads(sys.stdin.read())
data = pd.DataFrame(data_json)
print(f"Data received and converted in {time.time() - start_time} seconds")

# Preprocess data
data['date'] = pd.to_datetime(data['date'])
data.set_index('date', inplace=True)
model_input = data['value']
print(f"Data preprocessed in {time.time() - start_time} seconds")

# Generate forecast
forecast = model.predict(start=len(model_input), end=len(model_input) + 10 - 1)
print(f"Prediction done in {time.time() - start_time} seconds")

# Return forecast as JSON
print(forecast.to_json())
