from flask import Flask, jsonify, request, send_from_directory
import requests

app = Flask(__name__)

# Tomorrow.io API 密钥
TOMORROW_API_KEY = '41D2qShsv5syv4rqOxhxNH3SVeytnEMS'

@app.route('/image/<path:filename>')
def serve_image(filename):
    return send_from_directory('image', filename)

@app.route("/")
def home():
    return send_from_directory('static', 'weather.html')

# 提供 CSS 文件
@app.route("/styles.css")
def style():
    return send_from_directory('static', 'styles.css')

# 提供 JS 文件
@app.route("/script.js")
def js():
    return send_from_directory('static', 'script.js')

# 每日天气数据 API 路由
@app.route('/weather/daily', methods=['GET'])
def get_daily_weather():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    if not lat or not lng:
        return jsonify({'error': 'Latitude and Longitude are required.'}), 400

    fields = (
        'temperatureMax,temperatureMin,weatherCode,windSpeed,humidity,sunriseTime,sunsetTime,'
        'visibility,moonPhase,cloudCover,uvIndex,pressureSurfaceLevel,temperature,precipitationType,'
        'precipitationProbability'
    )
    url = f'https://api.tomorrow.io/v4/timelines?location={lat},{lng}&fields={fields}&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey={TOMORROW_API_KEY}'

    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch daily weather data.'}), response.status_code

# 每小时天气数据 API 路由
@app.route('/weather/hourly', methods=['GET'])
def get_hourly_weather():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    if not lat or not lng:
        return jsonify({'error': 'Latitude and Longitude are required.'}), 400

    fields = 'temperature,humidity,pressureSurfaceLevel,windSpeed,windDirection'
    url = f'https://api.tomorrow.io/v4/timelines?location={lat},{lng}&fields={fields}&timesteps=1h&units=imperial&timezone=America/Los_Angeles&apikey={TOMORROW_API_KEY}'

    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch hourly weather data.'}), response.status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
