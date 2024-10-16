
let hourlyWeatherData = []; 

function resetForm() {
    var streetInput = document.getElementById('street');
    var cityInput = document.getElementById('city');
    var stateSelect = document.getElementById('state');
    var checkbox = document.getElementById('autoDetect');
    streetInput.value = '';
    cityInput.value = '';
    stateSelect.value = '';  
    checkbox.checked = false;
    streetInput.disabled = false;
    cityInput.disabled = false;
    stateSelect.disabled = false;
    clearWeatherDetails();
}


function clearWeatherDetails() {
    const divIds = [
        'weather-details',
        'weather-7day',
        'weather-details_click',
        'weather-details_chart_1',
        'weather-details_chart_2',
        'weather-details_limit'
    ];
    divIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = ''; 
            element.style.display = 'none'; 
        }
    });
}
/*
document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.getElementById('autoDetect');
    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
    const submitButton = document.getElementById('submitBtn');
    let autoDetectedLocation = null;

    // 监听复选框的变化
    checkbox.addEventListener('change', async function () {
        if (this.checked) {
            disableFields();
            await fetchLocationAndStoreData(); // 确保位置获取完成
        } else {
            enableFields();
        }
    });

    // 表单提交事件处理函数
    submitButton.addEventListener('click', async function (event) {
        event.preventDefault();

        if (checkbox.checked) {
            if (autoDetectedLocation) {
                const [lat, lng] = autoDetectedLocation;
                const city = cityInput.dataset.detectedCity;
                const state = stateSelect.dataset.detectedState;
                const address = `${city}, ${state}, USA`;

                // 获取天气数据
                await fetchWeatherData(lat, lng);
                await fetchHourlyWeatherData(lat, lng);
            } else {
                alert('Error: Unable to detect location. Please try again.');
            }
        } else {
            const street = streetInput.value;
            const city = cityInput.value;
            const state = stateSelect.value;

            if (!street || !city || !state) {
                alert('Please fill in all required fields.');
                return;
            }

            const address = `${street}, ${city}, ${state}`;
            await fetchGeocodeAndWeather(address); // 等待地理编码完成
        }
    });

    // 获取自动检测的位置并保存
    async function fetchLocationAndStoreData() {
        try {
            const response = await fetch('https://ipinfo.io?token=b7d947caec3ca6');
            const data = await response.json();
            const [lat, lng] = data.loc.split(',');

            // 保存经纬度和检测的城市、州
            autoDetectedLocation = [lat, lng];
            cityInput.dataset.detectedCity = data.city;
            stateSelect.dataset.detectedState = data.region;
        } catch (error) {
            console.error('Error fetching location:', error);
            enableFields(); // 如果获取位置失败，重新启用输入框
        }
    }

    // 禁用输入字段
    function disableFields() {
        streetInput.disabled = true;
        cityInput.disabled = true;
        stateSelect.disabled = true;

        // 清空输入框的值
        streetInput.value = '';
        cityInput.value = '';
        stateSelect.value = '';
    }

    // 启用输入字段并重置状态
    function enableFields() {
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;

        // 重置输入框和自动检测信息
        streetInput.value = '';
        cityInput.value = '';
        stateSelect.value = '';
        autoDetectedLocation = null;

        // 清除保存的 data 属性
        delete cityInput.dataset.detectedCity;
        delete stateSelect.dataset.detectedState;
    }

    // 使用地理编码 API 获取经纬度并查询天气
    async function fetchGeocodeAndWeather(address) {
        try {
            const apiKey = 'YOUR_GOOGLE_API_KEY'; // 替换为你的 Google API 密钥
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

            const response = await fetch(geocodeUrl);
            const data = await response.json();

            if (data.status === "OK") {
                const location = data.results[0].geometry.location;
                const lat = location.lat;
                const lng = location.lng;

                await fetchWeatherData(lat, lng);
                await fetchHourlyWeatherData(lat, lng);
            } else {
                alert('No records found for the provided address.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            alert('Error: Unable to get geocoding information.');
        }
    }

    
});*/

// 获取每日天气数据
async function fetchWeatherData(lat, lng) {
    try {
        const response = await fetch(`/weather/daily?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error('Failed to fetch daily weather data');

        const data = await response.json();
        displayWeatherDataForDay(data.data.timelines[0].intervals);
    } catch (error) {
        console.error('Weather API error:', error);
        alert('Error: Unable to retrieve daily weather data.');
    }
}

// 获取每小时天气数据
async function fetchHourlyWeatherData(lat, lng) {
    try {
        const response = await fetch(`/weather/hourly?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error('Failed to fetch hourly weather data');

        const data = await response.json();
        hourlyWeatherData = data.data.timelines[0].intervals || [];
        console.log('Hourly Weather Data:', hourlyWeatherData);
    } catch (error) {
        console.error('Hourly Weather API error:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('autoDetect');
    var streetInput = document.getElementById('street');
    var cityInput = document.getElementById('city');
    var stateSelect = document.getElementById('state');
    var submitButton = document.getElementById('submitBtn');
    var autoDetectedLocation = null;
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            fetchLocationAndStoreData();  
            disableFields();  
        } else {
            enableFields();  
        }
    });

    
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (checkbox.checked) {
            
            if (autoDetectedLocation) {
                var [lat, lng] = autoDetectedLocation;
                const city = cityInput.dataset.detectedCity;
                const state = stateSelect.dataset.detectedState;
                const address = `${city}, ${state}, USA`;
                fetchWeatherData(lat, lng);
                fetchHourlyWeatherData(lat, lng);
            } else {
                alert('Error: Unable to detect location. Please try again.');
            }
        } else {
            
            var street = streetInput.value;
            var city = cityInput.value;
            var state = stateSelect.value;

            if (!street || !city || !state) {
                alert('Please fill in all required fields.');
                return;
            }

            
            var address = `${street}, ${city}, ${state}`;
            fetchGeocodeAndWeather(address);
        }
    });

    
    function fetchLocationAndStoreData() {
        fetch('https://ipinfo.io?token=b7d947caec3ca6')
            .then(response => response.json())
            .then(data => {
                var loc = data.loc.split(',');
                var lat = loc[0];
                var lng = loc[1];

                // 保存自动检测到的经纬度信息，供后续使用
                autoDetectedLocation = [lat, lng];
                cityInput.dataset.detectedCity = data.city;
                stateSelect.dataset.detectedState = data.region;
            })
            .catch(error => {
                console.error('Error fetching location:', error);
                enableFields();  // 如果获取位置失败，重新启用字段输入
            });
    }

    // 禁用表单字段
    function disableFields() {
        streetInput.disabled = true;
        cityInput.disabled = true;
        stateSelect.disabled = true;

        // 清空输入框的值
        streetInput.value = '';
        cityInput.value = '';
        stateSelect.value = '';
    }

    // 启用表单字段并清空输入值
    function enableFields() {
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;

        // 清空字段和自动检测信息
        streetInput.value = '';
        cityInput.value = '';
        stateSelect.value = '';
        autoDetectedLocation = null;
        // 清空保存的 data 属性
        delete cityInput.dataset.detectedCity;
        delete stateSelect.dataset.detectedState;
    }
});


//google map
document.getElementById('weatherForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var street = document.getElementById('street').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;

    if (!street || !city || !state) {
        alert('Please fill in all required fields.');
        return;
    }

    // 构造地址并调用Google Geocoding API
    var address = `${street}, ${city}, ${state}`;
    fetchGeocodeAndWeather(address);

});

function fetchGeocodeAndWeather(address) {
    var apiKey = 'AIzaSyBfBwt8lwVEEiBTbBoG8QREw3R5mDC9Kls';  // 你的Google Geocoding API密钥
    var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    // 调用Google Maps Geocoding API获取经纬度
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                var location = data.results[0].geometry.location;
                var lat = location.lat;
                var lng = location.lng;

                // 使用获取到的经纬度调用Tomorrow.io API查询天气数据
                fetchWeatherData(lat, lng);
                fetchHourlyWeatherData(lat, lng);
            } else {
                displayNoRecordsFound();
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            alert('Error: Unable to get geocoding information.');
        });
}
function displayNoRecordsFound() {
    const weatherDetailsDiv = document.getElementById('weather-details_limit');

    // 动态设置内容
    weatherDetailsDiv.innerHTML = '<p>No records have been found.</p>';

    // 显示容器
    weatherDetailsDiv.style.display = 'flex';
}



function formatDate(dateString) {
    // 将 ISO 8601 时间字符串转换为 JavaScript Date 对象
    const date = new Date(dateString);

    // 定义星期、月份的名称
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // 获取星期几，日期，月份，年份
    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const day = date.getUTCDate();
    const month = monthsOfYear[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    // 格式化输出
    return `${dayOfWeek}, ${day} ${month} ${year}`;
}
function displayWeatherDataForDay(weatherData) {
    const weatherDetailsDiv = document.getElementById('weather-details');
    const weather_7day = document.getElementById('weather-7day');
    let address = '';

    // 判断是否选中复选框
    const checkbox = document.getElementById('autoDetect');
    if (checkbox.checked) {
        // 使用自动检测保存的地址
        const city = document.getElementById('city').dataset.detectedCity;
        const state = document.getElementById('state').dataset.detectedState;
        address = `${city}, ${state}, USA`;
    } else {
        // 使用手动输入的地址
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        address = `${street ? street + ', ' : ''}${city ? city + ', ' : ''}${state}, USA`;
    }

    // 构建天气详细信息的HTML
    const weatherCode = weatherData[0].values.weatherCode;
    const weatherDetails = getWeatherDetails(weatherCode);
    const temperature = weatherData[0].values.temperature;
    const htmlContent = `
    <div class="address">${address}</div>
    <div class="weather-mid">
        <div class="weather-icon-container">
            <img src="${weatherDetails.icon}" alt="Weather Icon" class="weather-icon-large">
            <div class="weather-name">${weatherDetails.name}</div>
        </div>
        <div class="temp-container">
            <span class="temp-info">${temperature}°C</span>
        </div>
    </div>

    <div class="weather-row">
        <div class="weather-info">
            <div class="weather-label">Humidity:</div>
            <img src="../image/humidity.png" alt="Humidity Icon" class="weather-icon">
            <span>${weatherData[0].values.humidity}%</span>
        </div>
        <div class="weather-info">
            <div class="weather-label">Pressure:</div>
            <img src="../image/Pressure.png" alt="Pressure Icon" class="weather-icon">
            <span>${weatherData[0].values.pressureSurfaceLevel} hPa</span>
        </div>
        <div class="weather-info">
            <div class="weather-label">Wind Speed:</div>
            <img src="../image/Wind_Speed.png" alt="Wind Speed Icon" class="weather-icon">
            <span>${weatherData[0].values.windSpeed} km/h</span>
        </div>
        <div class="weather-info">
            <div class="weather-label">Visibility:</div>
            <img src="../image/Visibility.png" alt="Visibility Icon" class="weather-icon">
            <span>${weatherData[0].values.visibility} km</span>
        </div>
        <div class="weather-info">
            <div class="weather-label">Cloud Cover:</div>
            <img src="../image/Cloud_Cover.png" alt="Cloud Cover Icon" class="weather-icon">
            <span>${weatherData[0].values.cloudCover}%</span>
        </div>
        <div class="weather-info">
            <div class="weather-label">UV Level:</div>
            <img src="../image/UV_Level.png" alt="UV Icon" class="weather-icon">
            <span>${weatherData[0].values.uvIndex}</span>
        </div>
    </div>
    `;
    const htmlContent_7day = `
    <table class="weather-forecast-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Temp High</th>
                <th>Temp Low</th>
                <th>Wind Speed</th>
            </tr>
        </thead>
        <tbody>
            ${weatherData.map((day, index) => `
                <tr>
                    <td>${formatDate(day.startTime)}</td>
                    <td>
                        <div class="weather-icon-name">
                            <img src="${getWeatherDetails(day.values.weatherCode).icon}" alt="Weather Icon" class="weather-icon"> 
                            <div class="weather_name">${getWeatherDetails(day.values.weatherCode).name}</div>
                        </div>
                    </td>
                    <td>${day.values.temperatureMax}</td>
                    <td>${day.values.temperatureMin}</td>
                    <td>${day.values.windSpeed}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
`;

    // 将生成的HTML设置到div中
    weatherDetailsDiv.innerHTML = htmlContent;
    weather_7day.innerHTML = htmlContent_7day;
    // 显示天气详细信息
    weatherDetailsDiv.style.display = 'block';
    weather_7day.style.display = 'block';
    setupWeatherRowClickEvent(weatherData); // 在表格生成后绑定事件
}

// 绑定每一行的点击事件，生成对应天气详情并清空其他内容
function setupWeatherRowClickEvent(weatherData) {
    const rows = document.querySelectorAll('.weather-forecast-table tbody tr');

    rows.forEach((row, index) => {
        row.addEventListener('click', () => {
            const selectedDay = weatherData[index]; // 获取点击行对应的天气数据
            displayClickedDayWeather(selectedDay, weatherData);  // 显示天气详情
        });
    });
}

// 显示点击当天的天气详情，并清空其他区域内容
function displayClickedDayWeather(day, weatherData) {
    // 获取所需的DOM元素
    const weatherDetailsDiv = document.getElementById('weather-details');
    const weather7DayDiv = document.getElementById('weather-7day');
    const weatherDetailsClickDiv = document.getElementById('weather-details_click');
    const weather_chart = document.getElementById('weather-details_chart_1');
    // 清空原有内容
    weatherDetailsDiv.innerHTML = '';
    weatherDetailsDiv.style.display = 'none';
    weather7DayDiv.innerHTML = '';
    weather7DayDiv.style.display = 'none';


    // 获取天气详情并生成HTML
    const weatherDetails = getWeatherDetails(day.values.weatherCode);
    const htmlContent = `
            <div class = "detail_title">Daily Weather Details</div>
                <div class="custom-line"></div>
                <div class="weather-details-card">
                    <div class="weather-details-top">
                        <div class="weather-info-left">
                            <h3 class="weather-date">${formatDate(day.startTime)}</h3>
                            <p class="weather-name">${weatherDetails.name}</p>
                            <p class="weather-temp">${day.values.temperatureMax}°F / ${day.values.temperatureMin}°F</p>
                        </div>
                        <div class="weather-icon-right">
                            <img src="${weatherDetails.icon}" alt="Weather Icon" class="weather-icon-right-inside">
                        </div>
                    </div>
                    <div class="weather-details-bottom">
                        <p>Precipitation: ${getPrecipitationType(day.values.precipitationType)}</p>
                        <p>Chance of Rain: ${day.values.precipitationProbability}%</p>
                        <p>Wind Speed: ${day.values.windSpeed} mph</p>
                        <p>Humidity: ${day.values.humidity}%</p>
                        <p>Visibility: ${day.values.visibility} mi</p>
                        <p>Sunrise/Sunset: ${formatTime(day.values.sunriseTime)} / ${formatTime(day.values.sunsetTime)}</p>
                    </div>
                </div>
                <div class = "detail_title">Weather Charts</div>
                <div class="custom-line"></div>
                <div class="header_button">
                    <button id="toggleButton" class="arrow down"></button>
                </div>
            `;


    // 将生成的HTML插入到#weather-details_click中
    weatherDetailsClickDiv.innerHTML = htmlContent;
    weatherDetailsClickDiv.style.display = 'block';
    const toggleButton = document.getElementById('toggleButton');
    const chartContainer_1 = document.getElementById('weather-details_chart_1');
    const chartContainer_2 = document.getElementById('weather-details_chart_2');
    chartContainer_1.style.display = 'none';
    chartContainer_2.style.display = 'none';
    let isOpen = false;
    toggleButton.addEventListener('click', function () {
        if (isOpen) {
            
            chartContainer_1.style.display = 'none';
            chartContainer_2.style.display = 'none';
    
            
            toggleButton.classList.remove('up');
            toggleButton.classList.add('down');
    
            
            chartContainer_1.innerHTML = '';
            chartContainer_2.innerHTML = '';
        } else {
            
            chartContainer_1.style.display = 'block';
            chartContainer_2.style.display = 'block';
    
            
            toggleButton.classList.remove('down');
            toggleButton.classList.add('up');
    
            
            createTemperatureRangeChart(chartContainer_1, weatherData);
            createMeteogram(chartContainer_2, hourlyWeatherData);
        }
    
        
        isOpen = !isOpen;
    });
}
function convertWeatherDataToHighchartsFormat(weatherData) {
    return weatherData.map(day => [
        new Date(day.startTime).getTime(),  
        day.values.temperatureMin,          
        day.values.temperatureMax           
    ]);
}

function createTemperatureRangeChart(container, weatherData) {

    const data = convertWeatherDataToHighchartsFormat(weatherData);

    Highcharts.chart(container, {
        chart: {
            type: 'arearange',
            zoomType: 'x', 
            scrollablePlotArea: {
                minWidth: 900,
                scrollPositionX: 1
            }
        },
        title: {
            text: 'Temperature Range (Min Max)'
        },
        xAxis: {
            type: 'datetime',
            accessibility: {
                rangeDescription: 'The next 7 days starting from today.'
            }
        },
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: '°F',
            xDateFormat: '%A, %b %e' 
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Temperature',
            data: data,
            color: {
                linearGradient: {
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 1
                },
                stops: [
                    [0, 'rgba(250,167,32,1)'], 
                    [1, 'rgba(44,175,254,0.4)']  
                ]
            }
        }]
    });
} 

function createMeteogram(container, weatherData) {
    
    const temperatureData = [];
    const humidityData = [];
    const pressureData = [];
    const windData = []
    
    weatherData.map((interval, i) => {
        const date = new Date(interval.startTime).getTime();
        temperatureData.push([date, interval.values.temperature]);
        humidityData.push([date, Math.round(interval.values.humidity)]);
        pressureData.push([date, interval.values.pressureSurfaceLevel]);
        if (i % 2 === 0) {
            windData.push([date, interval.values.windSpeed, interval.values.windDirection]);
            console.log(windData);
        }
    });
    

 
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            events: {
                load: function () {
                    drawBlocksForWindArrows(this); 
                }
            }
        },
        title: {
            text: 'Hourly Weather (For Next 5 Days)'
        },
        xAxis: [{
            type: 'datetime',
            tickInterval: 6 * 36e5,
            minorTickInterval: 2 * 36e5,
            tickLength: 5,
            minorTickLength: 5,
            minorTickPosition: 'inside',
            gridLineWidth: 1,
            minorTickWidth: 1,
            startOnTick: false,
            endOnTick: false,
            tickPosition: 'inside',
            minorGridLineColor: 'rgba(128, 128, 128, 0.1)', 
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            minPadding: 0,
            maxPadding: 0,
            offset: 30,
            showLastLabel: true,
            labels: {
                format: '{value:%H}',
                align: 'center',
                y: 64
            },
            crosshair: true
        }, {
            linkedTo: 0,
            type: 'datetime',
            tickLength: 20,
            tickInterval: 24 * 3600 * 1000,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -8
            },
            opposite: true
        }],
        yAxis: [{
            title: { text: null },
            labels: {
                format: '{value}°',
                style: { fontSize: '10px' },
                x: -3
            },
            plotLines: [
                {
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 5,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'
        }, {
            title:{
                text:null
            },
            labels: { enabled: false },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0
        }, {
            allowDecimals: false,
            title: {
                text: 'inHg',
                offset: 0,
                align: 'high',
                rotation: 0,
                style: { fontSize: '10px',color: Highcharts.getOptions().colors[8], fontWeight: 'bold' },
                textAlign: 'left',
                x: 3
            },
            labels: {
                style: { fontSize: '8px', color: Highcharts.getOptions().colors[8],fontWeight: 'bold' },
                y: 2,
                x: 3
            },
            gridLineWidth: 0,
            opposite: true
        }],legend: {
            enabled: false
        },

        plotOptions: {
            series: {
                pointPlacement: 'on',  
                dataGrouping: {
                    enabled: false 
                }
            }
        },tooltip: {
            shared: true,
            xDateFormat:'%A, %b %e, %H:%M',
        },
        series: [{
            name: 'Temperature',
            type: 'spline',
            data: temperatureData,
            tooltip: {valueSuffix: ' °F' },
            color: '#FF3333',
            negativeColor: '#48AFE8',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            zIndex: 1

        }, {
            name: 'Humidity',
            type: 'column',
            data: humidityData,
            tooltip: {valueSuffix: '%' },
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return this.point.index % 2 === 0 ? this.y : null;
                },
                style: { fontSize: '10px', color: '#ddd', textOutline: '2px black' },
                y: -4
            },
            grouping: false,
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            
        }, {
            name: 'Air pressure',
            type: 'line',
            data: pressureData,
            yAxis: 2,
            tooltip: {  valueSuffix: ' inHg' },
            marker: {
                enabled: false
            },
            shadow: false,
            dashStyle: 'shortdot',
            color: 'rgba(250,167,32,1)',
        }, {
            name: 'Wind',
            type: 'windbarb',

            data: windData,
            lineWidth:1.5,
            id: 'windbarbs',
            vectorLength: 8,
            yOffset: -15,
            xOffset: 6,
            tooltip: { shared: true, valueSuffix: ' mph' },
            color: '#808080',
        }]
    });
}

function drawBlocksForWindArrows(chart) {
    const xAxis = chart.xAxis[0];
    
    // Iterate over the positions, increment by 1 hour instead of 2 hours to make lines denser
    for (let pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {
    // Get the X position
    const isLast = pos === max + 36e5;
    const x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);
    
    // Draw the vertical dividers and ticks
    const isLong = (chart.options.chart.resolution > 36e5) ? pos % chart.options.chart.resolution === 0 : i % 2 === 0;
    
    chart.renderer
    .path([
    "M",
    x,
    chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
    "L",
    x,
    chart.plotTop + chart.plotHeight + 20,
    "Z"
    ])
    .attr({
    stroke: chart.options.chart.plotBorderColor,
    "stroke-width": 1
    })
    .add();
    }
    }
    function filterWindDataForMinorTicks(windData) {
    return windData.filter((_, index) => index % 2 === 0);  // 每隔两个数据点返回一个
}


function formatTime(timeString) {
    const date = new Date(timeString);
    const hours = date.getHours() % 12 || 12; 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM'; 
    return `${hours}:${minutes} ${ampm}`;
}
const precipitationTypeMapping = {
    0: "N/A",
    1: "Rain",
    2: "Snow",
    3: "Freezing Rain",
    4: "Ice Pellets"
};
function getPrecipitationType(type) {
    return precipitationTypeMapping[type] || "N/A";  // 如果找不到映射，返回 "N/A"
}

const weatherData = {
    4201: { icon: '../image/Weather Symbols for Weather Codes/rain_heavy.svg', name: 'Heavy Rain' },
    4001: { icon: '../image/Weather Symbols for Weather Codes/rain.svg', name: 'Rain' },
    4200: { icon: '../image/Weather Symbols for Weather Codes/rain_light.svg', name: 'Light Rain' },
    6201: { icon: '../image/Weather Symbols for Weather Codes/freezing_rain_heavy.svg', name: 'Heavy Freezing Rain' },
    6001: { icon: '../image/Weather Symbols for Weather Codes/freezing_rain.svg', name: 'Freezing Rain' },
    6200: { icon: '../image/Weather Symbols for Weather Codes/freezing_rain_light.svg', name: 'Light Freezing Rain' },
    6000: { icon: '../image/Weather Symbols for Weather Codes/freezing_drizzle.svg', name: 'Freezing Drizzle' },
    4000: { icon: '../image/Weather Symbols for Weather Codes/drizzle.svg', name: 'Drizzle' },
    7101: { icon: '../image/Weather Symbols for Weather Codes/ice_pellets_heavy.svg', name: 'Heavy Ice Pellets' },
    7000: { icon: '../image/Weather Symbols for Weather Codes/ice_pellets.svg', name: 'Ice Pellets' },
    7102: { icon: '../image/Weather Symbols for Weather Codes/ice_pellets_light.svg', name: 'Light Ice Pellets' },
    5000: { icon: '../image/Weather Symbols for Weather Codes/snow.svg', name: 'Snow' },
    5100: { icon: '../image/Weather Symbols for Weather Codes/snow_light.svg', name: 'Light Snow' },
    5101: { icon: '../image/Weather Symbols for Weather Codes/snow_heavy.svg', name: 'Heavy Snow' },
    5001: { icon: '../image/Weather Symbols for Weather Codes/flurries.svg', name: 'Flurries' },
    8000: { icon: '../image/Weather Symbols for Weather Codes/tstorm.svg', name: 'Thunderstorm' },
    2100: { icon: '../image/Weather Symbols for Weather Codes/fog_light.svg', name: 'Light Fog' },
    2000: { icon: '../image/Weather Symbols for Weather Codes/fog.svg', name: 'Fog' },
    1001: { icon: '../image/Weather Symbols for Weather Codes/cloudy.svg', name: 'Cloudy' },
    1102: { icon: '../image/Weather Symbols for Weather Codes/mostly_cloudy.svg', name: 'Mostly Cloudy' },
    1101: { icon: '../image/Weather Symbols for Weather Codes/partly_cloudy_day.svg', name: 'Partly Cloudy' },
    1100: { icon: '../image/Weather Symbols for Weather Codes/mostly_clear_day.svg', name: 'Mostly Clear' },
    11001: { icon: '../image/Weather Symbols for Weather Codes/mostly_clear_night.svg', name: 'Mostly Clear' },
    1000: { icon: '../image/Weather Symbols for Weather Codes/clear_day.svg', name: 'Clear' },
    10001: { icon: '../image/Weather Symbols for Weather Codes/clear_night.svg', name: 'Clear' },
    11101: { icon: '../image/Weather Symbols for Weather Codes/mostly_clear_night.svg', name: 'Mostly Clear' }
};
/**
 * 根据天气代码获取对应的图标路径和名称
 * @param {number} weatherCode - 天气代码
 * @returns {object} 包含图标路径和天气名称的对象
 */
function getWeatherDetails(weatherCode) {
    // 检查映射中是否有该天气代码
    const details = weatherData[weatherCode];
    // 如果有，则返回图标路径和名称，否则返回默认值
    return details ? details : { icon: '../image/default_icon.svg', name: 'Unknown Weather' };
}
/*
function fetchWeatherData(lat, lng) {
    var apiKey = '41D2qShsv5syv4rqOxhxNH3SVeytnEMS';  // 替换为你的Tomorrow.io API密钥
    var fields = 'temperatureMax,temperatureMin,weatherCode,windSpeed,humidity,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover,uvIndex,pressureSurfaceLevel,temperature,precipitationType,precipitationProbability'; // 根据需要添加或删除字段
    var weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=${fields}&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey=${apiKey}`;
    console.log(lat,lng);
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.timelines) {
                var dailyWeather = data.data.timelines[0].intervals; // 获取所有天的天气数据
                console.log('Weather data for 7 days:', dailyWeather);

                // 显示每天的天气数据，这里你可以选择如何显示，如更新一个表格或天气卡片
                displayWeatherDataForDay(dailyWeather);
            } else {
                displayNoRecordsFound();
            }
        })
        .catch(error => {
            console.error('Weather API error:', error);
            alert('Error: Unable to retrieve weather data.');
        });
}
function fetchHourlyWeatherData(lat, lng) {
    const apiKey = '41D2qShsv5syv4rqOxhxNH3SVeytnEMS';
    const fields = 'temperature,humidity,pressureSurfaceLevel,windSpeed,windDirection';
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=${fields}&timesteps=1h&units=imperial&timezone=America/Los_Angeles&apikey=${apiKey}`;
    console.log(lat,lng);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.timelines) {
                hourlyWeatherData = data.data.timelines[0].intervals; // 存储每小时数据
                console.log('Hourly Weather Data:', hourlyWeatherData);
            } else {
                
            }
        })
        .catch(error => console.error('Hourly Weather API error:', error));
}*/