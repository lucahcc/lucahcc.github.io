let hourlyWeatherData = []; 
let selectedCity = '';
let selectedState = '';
document.addEventListener('DOMContentLoaded', function() {
    const currentLocationCheckbox = document.getElementById('currentLocation');
    const submitBtn = document.getElementById('submitBtn');
    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
    const noRecordsAlert = document.getElementById('noRecordsAlert');
    const errorAlert = document.getElementById('errorAlert');
    function updateSubmitButtonState() {
        if (currentLocationCheckbox.checked || (streetInput.value && cityInput.value && stateSelect.value)) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
    currentLocationCheckbox.addEventListener('change', function() {
        const isChecked = currentLocationCheckbox.checked;
        [streetInput, cityInput, stateSelect].forEach(input => {
            input.disabled = isChecked;
        });
        updateSubmitButtonState();
    });

    [streetInput, cityInput, stateSelect].forEach(input => {
        input.addEventListener('input', updateSubmitButtonState);
        input.addEventListener('blur', function() {  // 添加验证逻辑
            input.classList.toggle('is-invalid', !input.value);
        });
    });

    // 添加blur事件监听器
    document.querySelectorAll('.form-control, .form-select').forEach(function(input) {
        input.addEventListener('blur', function() {
            if (!input.value) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
    });

    document.getElementById('weatherForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const isCurrentLocationChecked = currentLocationCheckbox.checked;
        selectedCity = document.getElementById('city').value;
        selectedState = document.getElementById('state').value;

        if (isCurrentLocationChecked) {
            fetchLocationAndStoreData().then(() => {
                if (autoDetectedLocation) {
                    const [lat, lng] = autoDetectedLocation;
                    fetchWeatherData(lat, lng);
                    fetchHourlyWeatherData(lat, lng);
                } else {
                    console.error('Location detection failed');
                    alert('Error: Unable to detect location.');
                }
            }).catch(error => {
                console.error('Failed to fetch location:', error);
                enableFields();  // Re-enable fields if location detection fails
            });
        } else {
            const address = `${streetInput.value}, ${cityInput.value}, ${stateSelect.value}`;
            fetchGeocodeAndWeather(address);
        }
    });

    document.getElementById('clearBtn').addEventListener('click', function() {
        [streetInput, cityInput, stateSelect].forEach(input => {
            input.value = '';
            input.classList.remove('is-invalid');
        });
        const errorAlert = document.getElementById('errorAlert');
        currentLocationCheckbox.checked = false;
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;
        errorAlert.style.display = 'none';
        document.getElementById('weatherResults').style.display = 'none';

        // 清空表格的 <tbody>
        const tableBody = document.getElementById('day-view-table').querySelector('tbody');
        tableBody.innerHTML = '';
    
        // 清空标题中的城市和州名称
        document.getElementById('city-name').textContent = 'City';
        document.getElementById('state-name').textContent = 'State';

        updateSubmitButtonState();
    });
    updateSubmitButtonState();
    function toggleTabs(tab) {
        const resultsTab = document.getElementById('resultsTab');
        const favoritesTab = document.getElementById('favoritesTab');

        if (tab === 'results') {
            resultsTab.classList.add('active');
            favoritesTab.classList.remove('active');
            noRecordsAlert.style.display = 'none';

        } else {
            favoritesTab.classList.add('active');
            resultsTab.classList.remove('active');
            noRecordsAlert.style.display = 'block';
        }
    }
    function fetchLocationAndStoreData() {
        return fetch('https://ipinfo.io?token=b7d947caec3ca6')
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
                throw error; 
            });
    }
    window.toggleTabs = toggleTabs;
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
    
    function convertWeatherDataToHighchartsFormat(weatherData) {
        return weatherData.map(day => [
            new Date(day.startTime).getTime(),  
            day.values.temperatureMin,          
            day.values.temperatureMax           
        ]);
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

    async function fetchWeatherData(lat, lng) {
        try {
            const response = await axios.get(`/weather/daily?lat=${lat}&lng=${lng}`);
            if (response.status !== 200) throw new Error('Failed to fetch daily weather data');
            document.getElementById('city-name').textContent = selectedCity;
            document.getElementById('state-name').textContent = selectedState;
            document.getElementById('weatherResults').style.display = 'block';
            const dailyData = response.data.data.timelines[0].intervals;
            console.log('Daily Weather Data:', dailyData);
            populateDayViewTable(dailyData);
            createTemperatureRangeChart('dailyTempChartContainer', dailyData);
        } catch (error) {
            console.error('Weather API error:', error);
        }
    }
    
    async function fetchHourlyWeatherData(lat, lng) {
        try {
            const response = await axios.get(`/weather/hourly?lat=${lat}&lng=${lng}`);
            if (response.status !== 200) throw new Error('Failed to fetch hourly weather data');
            
            const hourlyData =response.data.data.timelines[0].intervals;
            console.log('Hourly Weather Data:', hourlyData);
            createMeteogram('meteogramContainer', hourlyData);
        } catch (error) {
            console.error('Hourly Weather API error:', error);
        }
    }
    function populateDayViewTable(dailyData) {
        if (!Array.isArray(dailyData)) {
            console.error("Error: 'dailyData' is not an array or is undefined.");
            return;
        }
        const tableBody = document.getElementById('day-view-table').querySelector('tbody');
        
        // 检查 tableBody 是否存在，防止 null 错误
        if (!tableBody) {
            console.error("Error: 'day-view-table' element or its tbody is not found.");
            return;
        }
        tableBody.innerHTML = '';  // 清空旧数据
    
        const htmlContent = dailyData.map((day, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDate(day.startTime)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${getWeatherDetails(day.values.weatherCode).icon}" alt="Weather Icon" class="weather-icon" style="width: 30px; height: 30px;"> 
                    <div class="weather_name ms-2">${getWeatherDetails(day.values.weatherCode).name}</div>
                </div>
            </td>
            <td>${day.values.temperatureMax}°F</td>
            <td>${day.values.temperatureMin}°F</td>
            <td>${day.values.windSpeed} mph</td>
        </tr>
    `).join('');

    // 将生成的 HTML 内容插入到表格主体中
    tableBody.innerHTML = htmlContent;
        };
    
    function fetchGeocodeAndWeather(address) {
        var apiKey = 'AIzaSyBfBwt8lwVEEiBTbBoG8QREw3R5mDC9Kls';  // 你的Google Geocoding API密钥
        var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const errorAlert = document.getElementById('errorAlert');
        // 调用Google Maps Geocoding API获取经纬度
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "OK") {
                    var location = data.results[0].geometry.location;
                    var lat = location.lat;
                    var lng = location.lng;
                    errorAlert.style.display = 'none';
                    // 使用获取到的经纬度调用Tomorrow.io API查询天气数据
                    fetchWeatherData(lat, lng);
                    fetchHourlyWeatherData(lat, lng);
                } else {
                    errorAlert.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Geocoding error:', error);
                errorAlert.style.display = 'block';
            });
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
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        }
        const weatherData = {
            4201: { icon: 'image/Weather Symbols for Weather Codes/rain_heavy.svg', name: 'Heavy Rain' },
            4001: { icon: 'image/Weather Symbols for Weather Codes/rain.svg', name: 'Rain' },
            4200: { icon: 'image/Weather Symbols for Weather Codes/rain_light.svg', name: 'Light Rain' },
            6201: { icon: 'image/Weather Symbols for Weather Codes/freezing_rain_heavy.svg', name: 'Heavy Freezing Rain' },
            6001: { icon: 'image/Weather Symbols for Weather Codes/freezing_rain.svg', name: 'Freezing Rain' },
            6200: { icon: 'image/Weather Symbols for Weather Codes/freezing_rain_light.svg', name: 'Light Freezing Rain' },
            6000: { icon: 'image/Weather Symbols for Weather Codes/freezing_drizzle.svg', name: 'Freezing Drizzle' },
            4000: { icon: 'image/Weather Symbols for Weather Codes/drizzle.svg', name: 'Drizzle' },
            7101: { icon: 'image/Weather Symbols for Weather Codes/ice_pellets_heavy.svg', name: 'Heavy Ice Pellets' },
            7000: { icon: 'image/Weather Symbols for Weather Codes/ice_pellets.svg', name: 'Ice Pellets' },
            7102: { icon: 'image/Weather Symbols for Weather Codes/ice_pellets_light.svg', name: 'Light Ice Pellets' },
            5000: { icon: 'image/Weather Symbols for Weather Codes/snow.svg', name: 'Snow' },
            5100: { icon: 'image/Weather Symbols for Weather Codes/snow_light.svg', name: 'Light Snow' },
            5101: { icon: 'image/Weather Symbols for Weather Codes/snow_heavy.svg', name: 'Heavy Snow' },
            5001: { icon: 'image/Weather Symbols for Weather Codes/flurries.svg', name: 'Flurries' },
            8000: { icon: 'image/Weather Symbols for Weather Codes/tstorm.svg', name: 'Thunderstorm' },
            2100: { icon: 'image/Weather Symbols for Weather Codes/fog_light.svg', name: 'Light Fog' },
            2000: { icon: 'image/Weather Symbols for Weather Codes/fog.svg', name: 'Fog' },
            1001: { icon: 'image/Weather Symbols for Weather Codes/cloudy.svg', name: 'Cloudy' },
            1102: { icon: 'image/Weather Symbols for Weather Codes/mostly_cloudy.svg', name: 'Mostly Cloudy' },
            1101: { icon: 'image/Weather Symbols for Weather Codes/partly_cloudy_day.svg', name: 'Partly Cloudy' },
            1100: { icon: 'image/Weather Symbols for Weather Codes/mostly_clear_day.svg', name: 'Mostly Clear' },
            11001: { icon: 'image/Weather Symbols for Weather Codes/mostly_clear_night.svg', name: 'Mostly Clear' },
            1000: { icon: 'image/Weather Symbols for Weather Codes/clear_day.svg', name: 'Clear' },
            10001: { icon: 'image/Weather Symbols for Weather Codes/clear_night.svg', name: 'Clear' },
            11101: { icon: 'image/Weather Symbols for Weather Codes/mostly_clear_night.svg', name: 'Mostly Clear' }
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
            return details ? details : { icon: 'image/default_icon.svg', name: 'Unknown Weather' };
        }
});
var autoDetectedLocation = null;




//------------------------------old_code----------------------------------------------------------//






    
// function fetchWeatherData(lat, lng) {
//     try {
//         const response =  fetch(`/weather/daily?lat=${lat}&lng=${lng}`);
//         if (!response.ok) throw new Error('Failed to fetch daily weather data');

//         const data =  response.json();
//         displayWeatherDataForDay(data.data.timelines[0].intervals);
//     } catch (error) {
//         console.error('Weather API error:', error);
//         alert('Error: Unable to retrieve daily weather data.');
//     }
// }

// // 获取每小时天气数据
// function fetchHourlyWeatherData(lat, lng) {
//     try {
//         const response =  fetch(`/weather/hourly?lat=${lat}&lng=${lng}`);
//         if (!response.ok) throw new Error('Failed to fetch hourly weather data');

//         const data = response.json();
//         hourlyWeatherData = data.data.timelines[0].intervals || [];
//         console.log('Hourly Weather Data:', hourlyWeatherData);
//     } catch (error) {
//         console.error('Hourly Weather API error:', error);
//     }
// }

// document.addEventListener('DOMContentLoaded', function() {
//     var checkbox = document.getElementById('autoDetect');
//     var streetInput = document.getElementById('street');
//     var cityInput = document.getElementById('city');
//     var stateSelect = document.getElementById('state');
//     var submitButton = document.getElementById('submitBtn');
//     var autoDetectedLocation = null;
//     checkbox.addEventListener('change', function() {
//         if (this.checked) {
//             fetchLocationAndStoreData();  
//             disableFields();  
//         } else {
//             enableFields();  
//         }
//     });

    
//     submitButton.addEventListener('click', function(event) {
//         event.preventDefault();

//         if (checkbox.checked) {
            
//             if (autoDetectedLocation) {
//                 var [lat, lng] = autoDetectedLocation;
//                 const city = cityInput.dataset.detectedCity;
//                 const state = stateSelect.dataset.detectedState;
//                 const address = `${city}, ${state}, USA`;
//                 fetchWeatherData(lat, lng);
//                 fetchHourlyWeatherData(lat, lng);
//             } else {
//                 alert('Error: Unable to detect location. Please try again.');
//             }
//         } else {
            
//             var street = streetInput.value;
//             var city = cityInput.value;
//             var state = stateSelect.value;

//             if (!street || !city || !state) {
//                 alert('Please fill in all required fields.');
//                 return;
//             }

            
//             var address = `${street}, ${city}, ${state}`;
//             fetchGeocodeAndWeather(address);
//         }
//     });

    
//     function fetchLocationAndStoreData() {
//         fetch('https://ipinfo.io?token=b7d947caec3ca6')
//             .then(response => response.json())
//             .then(data => {
//                 var loc = data.loc.split(',');
//                 var lat = loc[0];
//                 var lng = loc[1];

//                 // 保存自动检测到的经纬度信息，供后续使用
//                 autoDetectedLocation = [lat, lng];
//                 cityInput.dataset.detectedCity = data.city;
//                 stateSelect.dataset.detectedState = data.region;
//             })
//             .catch(error => {
//                 console.error('Error fetching location:', error);
//                 enableFields();  // 如果获取位置失败，重新启用字段输入
//             });
//     }

//     // 禁用表单字段
//     function disableFields() {
//         streetInput.disabled = true;
//         cityInput.disabled = true;
//         stateSelect.disabled = true;

//         // 清空输入框的值
//         streetInput.value = '';
//         cityInput.value = '';
//         stateSelect.value = '';
//     }

//     // 启用表单字段并清空输入值
//     function enableFields() {
//         streetInput.disabled = false;
//         cityInput.disabled = false;
//         stateSelect.disabled = false;

//         // 清空字段和自动检测信息
//         streetInput.value = '';
//         cityInput.value = '';
//         stateSelect.value = '';
//         autoDetectedLocation = null;
//         // 清空保存的 data 属性
//         delete cityInput.dataset.detectedCity;
//         delete stateSelect.dataset.detectedState;
//     }
// });

// //google map
// document.getElementById('weatherForm').addEventListener('submit', function(event) {
// event.preventDefault();

// var street = document.getElementById('street').value;
// var city = document.getElementById('city').value;
// var state = document.getElementById('state').value;

// if (!street || !city || !state) {
//     alert('Please fill in all required fields.');
//     return;
// }

// // 构造地址并调用Google Geocoding API
// var address = `${street}, ${city}, ${state}`;
// fetchGeocodeAndWeather(address);

// });

