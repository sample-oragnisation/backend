from flask import Flask, jsonify, request
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

app = Flask(__name__)

#get data from the prediction.js and predict SARIMA and return back the result to the prediction.js
@app.route('/predict', methods=['POST'])
def predict():
    try:
        request_data = request.json
        collection_type = request_data.get('collectionType') 
        data = request_data.get('data')

        if collection_type not in ['electric', 'solar']:
            return jsonify({'error': 'Invalid collection type. Must be "electric" or "solar".'}), 400

        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        df['total'] = df['total'].astype(int)
        df = df.sort_index()

        sarimax_model = SARIMAX(df['total'],
                                order=(1, 1, 1),
                                seasonal_order=(1, 1, 1, 7))  
        results = sarimax_model.fit()

        forecast = results.get_forecast(steps=10)
        forecast_index = pd.date_range(start=df.index.max() + pd.Timedelta(days=1), periods=10)
        forecast_df = pd.DataFrame({'date': forecast_index, 'forecast': forecast.predicted_mean})
        forecast_df['forecast'] = forecast_df['forecast'].astype(int)

        forecast_df['date'] = forecast_df.index.strftime('%Y-%m-%d')
        forecast_df.set_index('date', inplace=True)

        forecast_json = forecast_df.reset_index().to_dict(orient='records')

        return jsonify(forecast_json)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
