// 引入依赖模块
const cors = require('cors');
const express = require('express');
const axios = require('axios');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
const TOMORROW_API_KEY = '41D2qShsv5syv4rqOxhxNH3SVeytnEMS';
const googleApiKey = 'AIzaSyAHtPdCJmrd4CDblo8LG2W7j7DqGcb1Opg';
app.use(express.static(path.join(__dirname)));
const uri = 'mongodb+srv://jinhehu123:Lnkj9wF2CdAwzk44@uscas3luca.gvvo7.mongodb.net/?retryWrites=true&w=majority&appName=USCAS3LUCA';

const client = new MongoClient(uri);
app.use(cors({
  origin: 'https://frontend-dot-usc-571-as3-luca.uw.r.appspot.com', // 替换为你的前端 URL
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

async function connectDB() {
    try {
      await client.connect();
      console.log('Successfully connected to MongoDB Atlas!');
      const db = client.db('weatherDB'); // 替换为你的数据库名称
      const collection = db.collection('favorites'); // 替换为你的集合名称
  
      // 示例查询：打印所有收藏的数据
      const favorites = await collection.find().toArray();
      console.log(favorites);
    } catch (error) {
      console.error('Connection error:', error);
    }
  }
connectDB();

app.use(express.json());

app.post('/api/favorites', async (req, res) => {
    let { city, state } = req.body;
  
    // 格式化为小写字符串
    city = typeof city === 'string' ? city.trim() : '';
    state = typeof state === 'string' ? state.trim(): '';
  
    if (!city || !state) {
      return res.status(400).json({ message: 'Invalid city or state.' });
    }
  
    try {
      const db = client.db('weatherDB');
      const collection = db.collection('favorites');
  
      const existing = await collection.findOne({ city, state });
      if (existing) {
        return res.status(200).json({ message: 'City already in favorites.', alreadyExists: true });
      }
  
      await collection.insertOne({ city, state });
      res.status(201).json({ message: 'City added to favorites.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add favorite city.' });
    }
  });
  
app.get('/api/favorites', async (req, res) => {
    try {
      const db = client.db('weatherDB');
      const collection = db.collection('favorites');
  
      // 获取所有收藏的城市
      const favorites = await collection.find().toArray();
      res.json(favorites);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch favorites.' });
    }
  });
  app.delete('/api/favorites', async (req, res) => {
  const { city, state } = req.body;
  try {
    const db = client.db('weatherDB');
    const collection = db.collection('favorites');

    // 删除指定的城市
    await collection.deleteOne({ city, state });
    res.json({ message: 'City removed from favorites.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove favorite city.' });
  }
});
  
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));
// 提供 HTML 页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});
// 每日天气数据 API 路由
app.get('/weather/daily', async (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const fields = 'temperatureMax,temperatureMin,weatherCode,windSpeed,humidity,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover,uvIndex,pressureSurfaceLevel,temperature,precipitationType,precipitationProbability,temperatureApparent';
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=${fields}&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey=${TOMORROW_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
        console.log(response.data); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily weather data.' });
    }
});
app.get('/api/place/autocomplete', async (req, res) => {
    const { input } = req.query;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${googleApiKey}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Google API:', error);
        res.status(500).send('Internal Server Error');
    }
});
// 每小时天气数据 API 路由
app.get('/weather/hourly', async (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const fields = 'temperature,humidity,pressureSurfaceLevel,windSpeed,windDirection';
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=${fields}&timesteps=1h&units=imperial&timezone=America/Los_Angeles&apikey=${TOMORROW_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hourly weather data.' });
    }
});
app.get('/api/places', async (req, res) => {
    const input = req.query.input;
    if (!input) {
        return res.status(400).send({ error: 'Missing input parameter' });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_AUTO_CITY_KEY}`;
    
    try {
        const response = await axios.get(url);
        // 直接将Google Places的响应发送回客户端
        res.send(response.data);
    } catch (error) {
        // 错误处理
        res.status(500).send({ error: 'Failed to fetch data from Google Places API' });
    }
});
app.use(express.static(path.join(__dirname, 'my-angular-app/dist/my-angular-app')));

// 处理所有其他路由，返回 Angular 的 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-angular-app/dist/my-angular-app/index.html'));
});
// 服务器启动
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});