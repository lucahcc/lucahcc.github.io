from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

@app.route('/get_weather', methods=['GET'])
def get_weather():
    location = request.args.get('location')
    api_key = os.getenv('TOMORROW_IO_API_KEY')
    url = f"https://api.tomorrow.io/v4/timelines?location={location}&fields=temperature&apikey={api_key}"
    
    response = requests.get(url)
    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch weather data'}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
