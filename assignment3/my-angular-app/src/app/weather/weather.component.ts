import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Renderer2} from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';  
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import Highcharts from 'highcharts/highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import WindBarb from 'highcharts/modules/windbarb';
import highcharsBellCurve from 'highcharts/modules/histogram-bellcurve';
import { trigger, state, style, animate, transition } from '@angular/animations';
if(typeof Highcharts ===  'object'){
  highcharsBellCurve(Highcharts);
  HighchartsMore(Highcharts);
  WindBarb(Highcharts);
}
/// <reference types="@types/google.maps" />
const mockDailyData = {
  data: {
    timelines: [
      {
        intervals: [
          {
            startTime: '2024-11-11T00:00:00Z',
            values: {
              weatherCode: 1000,
              temperatureMax: 75,
              temperatureMin: 55,
              windSpeed: 10,
              humidity: 60,
              sunriseTime: '2024-11-11T06:30:00Z',
              sunsetTime: '2024-11-11T18:30:00Z',
              visibility: 10,
              cloudCover: 20,
              temperatureApparent: 70,
            },
          },
          {
            startTime: '2024-11-12T00:00:00Z',
            values: {
              weatherCode: 1101,
              temperatureMax: 78,
              temperatureMin: 58,
              windSpeed: 12,
              humidity: 65,
              sunriseTime: '2024-11-12T06:32:00Z',
              sunsetTime: '2024-11-12T18:28:00Z',
              visibility: 9,
              cloudCover: 25,
              temperatureApparent: 72,
            },
          },
        ],
      },
    ],
  },
};

const mockHourlyData = {
  data: {
    timelines: [
      {
        intervals: [
          {
            startTime: '2024-11-11T00:00:00Z',
            values: {
              temperature: 60,
              humidity: 70,
              pressureSurfaceLevel: 1015,
              windSpeed: 8,
              windDirection: 90,
            },
          },
          {
            startTime: '2024-11-11T03:00:00Z',
            values: {
              temperature: 62,
              humidity: 65,
              pressureSurfaceLevel: 1016,
              windSpeed: 9,
              windDirection: 100,
            },
          },
        ],
      },
    ],
  },
};

interface WeatherResponse {
  data: {
    timelines: Array<{
      intervals: Array<{
        startTime: string;
        values: {
          weatherCode: number;
          temperatureMax: number;
          temperatureMin: number;
          windSpeed: number;
          humidity?: number;
          sunriseTime?: string;
          sunsetTime?: string;
          visibility?: number;
          moonPhase?: number;
          cloudCover?: number;
          uvIndex?: number;
          pressureSurfaceLevel?: number;
          temperature?: number;
          precipitationType?: number;
          precipitationProbability?: number;
          
          temperatureApparent?: number;
        };
      }>;
    }>;
  };
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
  standalone: true ,
  imports: [ReactiveFormsModule, CommonModule,MatAutocompleteModule,
    MatFormFieldModule,],
    animations: [
      trigger('slideAnimation', [
        state('hidden', style({ transform: 'translateX(-100%)', opacity: 0, display: 'none' })),
        state('visible', style({ transform: 'translateX(0)', opacity: 1, display: 'block' })),
        transition('hidden => visible', animate('400ms ease-in-out')),
        transition('visible => hidden', animate('400ms ease-in-out')),
      ]),
    ],
})

export class WeatherComponent implements OnInit {
  dailyData: any[] = [];
  hourlyData: any[] = [];
  isClearing: boolean = false;
  intervalId: any;
  progress: number = 0;
  isLoading: boolean = false;
  isResultsSelected: boolean = true;
  iserror: boolean = false;
  apiUrl = 'https://backend-dot-usc-571-as3-luca.uw.r.appspot.com/api/favorites';

  //apiUrl = '/api/favorites';
  favorites: any[] = []; 
  isHidden: boolean = true;
  weatherPaneState: string = 'hidden'; // 初始状态为 'hidden'
  detailsPaneState: string = 'hidden';
  paneState: string = 'out'; 
  selectedDate: string = '';
  weatherResultsVisible = false;
  autoDetectedLocation: [string, string] | null = null;
  selectedCity: string = '';
  selectedState: string = '';
  selectedDayDetails: any; 
  detailsList: any[] = [];
  weatherForm_auto = new FormGroup({
    city: new FormControl('', Validators.required)
  });
  lat!: string;
  lng!: string;
  citySuggestion: string[] = [];  // 用于保存城市建议
  cityControl = new FormControl('');
  @ViewChild('noRecordsAlert', { static: true }) noRecordsAlert!: ElementRef;
  @ViewChild('errorAlert', { static: true }) errorAlert!: ElementRef;
  @ViewChild('weatherResults', { static: true }) weatherResults!: ElementRef;
  @ViewChild('submitBtn', { static: true }) submitBtn!: ElementRef;
  @ViewChild('streetInput', { static: true }) streetInput!: ElementRef;
  @ViewChild('cityInput', { static: true }) cityInput!: ElementRef;
  @ViewChild('stateInput', { static: true }) stateInput!: ElementRef;
  @ViewChild('currentLocation', { static: true }) currentLocation!: ElementRef;
  @ViewChild('clearBtn', { static: true }) clearBtn!: ElementRef;
  @ViewChild('cityName', { static: true }) cityName!: ElementRef;
  @ViewChild('stateName', { static: true }) stateName!: ElementRef;
  @ViewChild('resultsTab', { static: true }) resultsTab!: ElementRef;
  @ViewChild('favoritesTab', { static: true }) favoritesTab!: ElementRef;
  @ViewChild('tableBody', { static: true }) tableBody!: ElementRef;
  @ViewChild('dailyTempChartContainer', { static: false }) dailyTempChartContainer!: ElementRef;
  @ViewChild('meteogramContainer', { static: false }) meteogramContainer!: ElementRef;
  @ViewChild('detailsPane', { static: false }) detailsPane!: ElementRef;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;
  isHovering: boolean = false;
  isFavorite: boolean = false;
  weatherForm: FormGroup;
  hourlyWeatherData: any[] = [];
  constructor(private http: HttpClient, private fb: FormBuilder , private renderer: Renderer2) {
    this.weatherForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      currentLocation: [false]
    });
  }
  ngAfterViewInit(): void {
    // 为每个输入框添加失去焦点时的 'blur' 事件监听器，进行验证
    this.addBlurEvent(this.streetInput);
    this.addBlurEvent(this.cityInput);
    this.addBlurEvent(this.stateInput);
    
  }
  public createMeteogram(weatherData: any[]): void {
    const temperatureData: [number, number][] = [];
    const humidityData: [number, number][] = [];
    const pressureData: [number, number][] = [];
    const windData: [number, number, number][] = [];
    const self = this;
    setTimeout(() =>{
      const container = this.meteogramContainer.nativeElement;
      if (container) {
        console.log('Meteogram chart created.');
    } else {
      console.error('Meteogram container not found.');
    }
    }, 300);
    const container = this.meteogramContainer.nativeElement;
    
    weatherData.forEach((interval, i) => {
        const date = new Date(interval.startTime).getTime();
        temperatureData.push([date, interval.values.temperature]);
        humidityData.push([date, Math.round(interval.values.humidity)]);
        pressureData.push([date, interval.values.pressureSurfaceLevel]);
        if (i % 2 === 0) {
            windData.push([date, interval.values.windSpeed, interval.values.windDirection]);
        }
    });

    const chartOptions:Highcharts.Options ={
        chart: {
            type: 'column',
            events: {
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
                y: 20
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
            title: { text: 'Temperature (°F)' },
            labels: {
                format: '{value}°',
                style: { fontSize: '10px' },
                x: -3
            },
            plotLines: [{
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'
        }, {
            title: { text: 'Humidity (%)' },
            labels: {
                format: '{value}%',
                style: { fontSize: '10px' },
                x: -3
            },
            opposite: true
        }, {
            title: {
                text: 'Pressure (inHg)',
                style: {
                    color: '#FFFF00'
                }
            },
            labels: {
                format: '{value} inHg',
                style: { fontSize: '10px' },
                x: -3
            },
            opposite: true
        }],
        tooltip: {
            shared: true,
            xDateFormat: '%A, %b %e, %H:%M',
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                pointPlacement: 'on',  
                dataGrouping: {
                    enabled: false 
                }
            }
        },
        series: [{
            name: 'Temperature',
            type: 'spline',
            data: temperatureData,
            tooltip: { valueSuffix: ' °F' },
            color: '#FF3333',
            negativeColor: '#48AFE8',
            zIndex: 1
        }, {
            name: 'Humidity',
            type: 'column',
            data: humidityData,
            yAxis: 1,
            tooltip: { valueSuffix: '%' },
            zIndex: 0
        }, {
            name: 'Pressure',
            type: 'line',
            data: pressureData,
            yAxis: 2,
            tooltip: { valueSuffix: ' inHg' },
            zIndex: 1
        }, {
            name: 'Wind',
            type: 'windbarb',
            data: windData,
            tooltip: { valueSuffix: ' mph' },
            zIndex: 1,
            vectorLength: 12
            
        }]
    };Highcharts.chart(container, chartOptions);
    console.log("create metro done");
}
  // 添加 'blur' 事件的辅助方法
  private addBlurEvent(inputElement: ElementRef): void {
    this.renderer.listen(inputElement.nativeElement, 'blur', () => {
      if (!inputElement.nativeElement.value) {
        // 若为空，添加 'is-invalid' 类
        this.renderer.addClass(inputElement.nativeElement, 'is-invalid');
      } else {
        // 若不为空，移除 'is-invalid' 类
        this.renderer.removeClass(inputElement.nativeElement, 'is-invalid');
      }
    });
  }
   /**
   * 格式化日期
   * @param dateString 日期字符串
   * @returns 格式化后的日期字符串
   */
   formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * 根据天气代码获取对应的图标路径和名称
   * @param weatherCode 天气代码
   * @returns 包含图标路径和天气名称的对象
   */
  getWeatherDetails(weatherCode: number): { icon: string; name: string } {
    const details = this.weatherData[weatherCode];
    return details ? details : { icon: 'image/default_icon.svg', name: 'Unknown Weather' };
  }
  ngOnInit(): void {
    this.loadFavorites();
    // 监听 currentLocation 复选框的变化
    this.currentLocation.nativeElement.addEventListener('change', () => {
      const isChecked = this.currentLocation.nativeElement.checked;
      
      // 启用或禁用地址输入框
      [this.streetInput, this.cityInput, this.stateInput].forEach(input => {
        this.renderer.setProperty(input.nativeElement, 'disabled', isChecked);
      });

      // 更新提交按钮状态
      this.updateSubmitButtonState();
    });

    // 监听输入框的变化并应用验证样式
    [this.streetInput, this.cityInput, this.stateInput].forEach(input => {
      input.nativeElement.addEventListener('input', () => this.updateSubmitButtonState());
      input.nativeElement.addEventListener('blur', () => {
        const isValid = input.nativeElement.value.trim() !== '';
        this.renderer.addClass(input.nativeElement, isValid ? 'is-valid' : 'is-invalid');
        this.renderer.removeClass(input.nativeElement, isValid ? 'is-invalid' : 'is-valid');
      });
    });

    // 初始状态
    this.updateSubmitButtonState();
  }
  selectTab(tab: string) {
    if (tab === 'results') {
      this.isResultsSelected = true;
    } else if (tab === 'favorites') {
      this.isResultsSelected = false;
    }
  }
  async cityInput_auto(event: Event): Promise<void> {
    const city = (event.target as HTMLInputElement).value;

    if (city) {
      const url = `https://backend-dot-usc-571-as3-luca.uw.r.appspot.com/api/place/autocomplete?input=${city}`;
      //const url = `/api/place/autocomplete?input=${city}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.citySuggestion = data.predictions.map((pred: any) => pred.terms[0].value);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        this.citySuggestion = [];
      }
    } else {
      this.citySuggestion = [];
    }
  }

  selectCity(city: string): void {
    this.weatherForm.get('city')?.setValue(city); // 将选中的城市填入输入框
    this.citySuggestion = []; // 清空建议列表
  }

  updateSubmitButtonState(): void {
    const isLocationChecked = this.currentLocation.nativeElement.checked;
    const isFormFilled = this.streetInput.nativeElement.value &&
                         this.cityInput.nativeElement.value &&
                         this.stateInput.nativeElement.value;

    // 启用或禁用提交按钮
    this.renderer.setProperty(this.submitBtn.nativeElement, 'disabled', !(isLocationChecked || isFormFilled));
  }

  onSubmit(): void {
    const isCurrentLocationChecked = this.weatherForm.get('currentLocation')?.value;
    const street = this.weatherForm.get('street')?.value;
    const city = this.weatherForm.get('city')?.value;
    const state = this.weatherForm.get('state')?.value;
    
    this.selectedCity = city;
    this.selectedState = state;
    if (isCurrentLocationChecked) {
      this.fetchLocationAndStoreData().then(() => {
        if (this.autoDetectedLocation) {
          console.log("enter checkbox");
          [this.lat, this.lng] = this.autoDetectedLocation;
          //this.weatherPaneState = 'visible';
          this.detailsPaneState = 'hidden';
          this.fetchWeatherData(this.lat, this.lng);
          this.fetchHourlyWeatherData(this.lat, this.lng);

          this.initializeMap(this.lat, this.lng);
        } else {
          console.error('Location detection failed');
          alert('Error: Unable to detect location.');
        }
      }).catch(error => {
        console.error('Failed to fetch location:', error);
        this.enableFields();
      });
    } else {
      console.log("NOT enter checkbox");
      const address = `${street}, ${city}, ${state}`;
      console.log("Generated address:", address);
      this.fetchGeocodeAndWeather(address).then(() => {
        // 显示结果区域
      this.isHidden = false;
    });
    }
    console.log(`Submit clicked. isCurrentLocationChecked: ${isCurrentLocationChecked}`);
    console.log(`Current autoDetectedLocation: ${this.autoDetectedLocation}`);
  }

  onClear(): void {
    this.lat = '';
    this.lng = '';
    this.autoDetectedLocation = ['', ''];
    this.isClearing = true;
    this.weatherPaneState = 'hidden';
    this.detailsPaneState = 'hidden';
    this.iserror = false;
    this.isLoading = false;
    this.progress = 0;
    //this.isResultsSelected = false;
    //this.isResultsSelected = false; 
    if (this.weatherResults) {
      this.weatherPaneState = 'hidden';
  }

  // 确保 tableBody 存在后清空表格内容
  if (this.tableBody) {
      const tbody = this.tableBody.nativeElement;
      while (tbody.firstChild) {
          this.renderer.removeChild(tbody, tbody.firstChild);
      }
  }
    // 重置表单并取消验证状态
    this.weatherForm.reset();
    this.weatherForm.get('currentLocation')?.setValue(false);
    this.weatherForm.markAsUntouched();
    // 清空地址输入框并移除验证样式
    [this.streetInput, this.cityInput, this.stateInput].forEach(input => {
      this.renderer.setProperty(input.nativeElement, 'value', ''); // 不使用 nativeElement
      this.renderer.removeClass(input.nativeElement, 'is-valid');
      this.renderer.removeClass(input.nativeElement, 'is-invalid');
    });

    // 复位当前定位复选框和启用地址字段
    this.renderer.setProperty(this.currentLocation, 'checked', false);
    [this.streetInput, this.cityInput, this.stateInput].forEach(input => {
      this.renderer.setProperty(input, 'disabled', false);
    });
    this.currentLocation.nativeElement.checked = false;
    this.currentLocation.nativeElement.dispatchEvent(new Event('change'));

    this.updateSubmitButtonState();
    this.isClearing = false;
    console.log('streetInput:', this.streetInput);
    console.log('cityInput:', this.cityInput);
    console.log('stateInput:', this.stateInput);
}
showFirstDayDetails(): void {
  if (this.dailyData && this.dailyData.length > 0) {
    const firstDay = this.dailyData[0];
    this.showDetails(firstDay);
  } else {
    console.error("nodata！");
  }
}

  toggleTabs(tab: string): void {
    const resultsTab = this.resultsTab.nativeElement;
    const favoritesTab = this.favoritesTab.nativeElement;
    //const noRecordsAlert = this.noRecordsAlert.nativeElement;

    if (tab === 'results') {
        this.renderer.addClass(resultsTab, 'active');
        this.renderer.removeClass(favoritesTab, 'active');
        //this.renderer.setStyle(noRecordsAlert, 'display', 'none');
    } else {
        this.renderer.addClass(favoritesTab, 'active');
        this.renderer.removeClass(resultsTab, 'active');
        //this.renderer.setStyle(noRecordsAlert, 'display', 'block');
    }
}
fetchLocationAndStoreData(): Promise<void> {
    return fetch('https://ipinfo.io?token=b7d947caec3ca6')
      .then(response => response.json())
      .then(data => {
        const loc = data.loc.split(',');
        this.lat = loc[0].trim();
        this.lng = loc[1].trim();
        this.autoDetectedLocation = [this.lat, this.lng];
        this.selectedCity = data.city;
        this.selectedState = data.region;
        console.log(`Detected location: ${this.selectedCity}, ${this.selectedState}`);
        console.log(`Lat: ${this.lat}, Lng: ${this.lng}`);
        console.log(`Type of lat: ${typeof this.lat}, Type of lng: ${typeof this.lng}`);
      })
      .catch(error => {
        console.error('Error fetching location:', error);
        throw error;
      });
  }
  enableFields(): void {
    this.weatherForm.get('street')?.enable();
    this.weatherForm.get('city')?.enable();
    this.weatherForm.get('state')?.enable();
  }
  public onDailyTempTabClick(): void {
    if (this.dailyData) {
      console.log('Daily Temp Chart tab clicked.');
      this.createTemperatureRangeChart(this.dailyData);
    } else {
      console.error('No daily data available.');
    }
  }
  
  public onMeteogramTabClick(): void {
    if (this.hourlyData) {
      console.log('Meteogram tab clicked.');
      this.createMeteogram(this.hourlyData);
    } else {
      console.error('No hourly data available.');
    }
  }
  public fetchWeatherData(lat: string, lng: string): void {
    //const url = `/weather/daily?lat=${lat}&lng=${lng}`;
    const url = `https://backend-dot-usc-571-as3-luca.uw.r.appspot.com/weather/daily?lat=${lat}&lng=${lng}`;

    this.isLoading = true;
    this.progress = 0;
    const interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 5;
      }
    }, 300);

    this.http.get<WeatherResponse>(url).pipe(
      catchError(error => {
        console.error('Daily Weather API error:', error);
        this.isLoading = false; // 隐藏进度条
        clearInterval(interval);
        this.iserror = true;
        //this.weatherPaneState = '';
        return of(null);
      })
    ).subscribe(response => {
      this.isLoading = false; // 隐藏进度条
      clearInterval(interval);
      if (response) {
        this.dailyData = response.data.timelines[0].intervals || [];
        const dailyData = response.data.timelines[0].intervals;
        console.log('Daily Weather Data:', dailyData)
        this.iserror = false;
        this.weatherPaneState = 'visible';
        this.detailsPaneState = 'hidden';
        //this.weatherResultsVisible = true;  // 设置为 true 显示结果

        this.populateDayViewTable(dailyData);
        // setTimeout(() => {
        //   this.createTemperatureRangeChart(dailyData);
        // }, 300);
        //this.createTemperatureRangeChart(dailyData);
      } else {
        console.error('Failed to fetch daily weather data');
        this.iserror = true;
        //this.weatherPaneState = ''; 
      }
    });
  }

  public fetchHourlyWeatherData(lat: string, lng: string): void {
    //const url = `/weather/hourly?lat=${lat}&lng=${lng}`;
    const url = `https://backend-dot-usc-571-as3-luca.uw.r.appspot.com/weather/hourly?lat=${lat}&lng=${lng}`;

    this.http.get<WeatherResponse>(url).pipe(
      catchError(error => {
        console.error('Hourly Weather API error:', error);
        //this.iserror = true;
        //this.weatherPaneState = '';
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        //this.iserror = false;
        this.weatherPaneState = 'visible';
        this.detailsPaneState = 'hidden';
        this.hourlyData =response.data.timelines[0].intervals;
        const hourlyData = response.data.timelines[0].intervals;
        console.log('Hourly Weather Data:', response);
        console.log("prepare to createMeteogram");
        // setTimeout(() => {
        //   this.createMeteogram(hourlyData);
        // }, 300);
        //this.createMeteogram(hourlyData);
      } else {
        console.error('Failed to fetch hourly weather data');
        //this.iserror = true;
        //this.weatherPaneState = '';
      }
    });
  }
  
  createTemperatureRangeChart(weatherData: any[]): void {
    const data = this.convertWeatherDataToHighchartsFormat(weatherData);
    const container = this.dailyTempChartContainer.nativeElement;

    const chartOptions:Highcharts.Options = {
      chart: {
        type: 'arearange',
        zooming: {type:'x'},
        scrollablePlotArea: {
          minWidth: 900,
          scrollPositionX: 1
        }
      },
      title: {
        text: 'Temperature Range (Min, Max)'
      },
      xAxis: {
        type: 'datetime',
        accessibility: {
          rangeDescription: 'Range: next 7 days from today'
        }
      },
      yAxis: {
        title: {
          text: 'Temperature (°F)'
        }
      },
      tooltip: {
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
        type: 'arearange',
        color: {
          linearGradient: {
            x1: 0, y1: 0, x2: 0, y2: 1
          },
          stops: [
            [0, 'rgba(250,167,32,1)'],
            [1, 'rgba(44,175,254,0.4)']
          ]
        }
      }]
    };
    Highcharts.chart(container, chartOptions);
  }

  convertWeatherDataToHighchartsFormat(weatherData: any[]) {
    return weatherData.map(day => [
      new Date(day.startTime).getTime(),
      day.values.temperatureMin,
      day.values.temperatureMax
    ]);
  }
   

  
  public fetchGeocodeAndWeather(address: string): Promise<void> {
    const apiKey = 'AIzaSyBfBwt8lwVEEiBTbBoG8QREw3R5mDC9Kls'; // 替换为您的 Google API 密钥
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    return fetch(geocodeUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          const location = data.results[0].geometry.location;
          const lat = location.lat.toString();
          const lng = location.lng.toString();
          this.initializeMap(location.lat, location.lng);

          // 使用获得的经纬度调用天气数据
          this.fetchWeatherData(lat, lng);
          console.log(lat, lng);
          this.fetchHourlyWeatherData(lat, lng);
          console.log("fetch done")
        } else {
          // 显示错误提示框
          this.iserror = true;
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
      });
}

async initializeMap(latitude: string, longitude: string): Promise<void> {
  try {
    // 导入 Google Maps 库
    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;

    // 将字符串类型的经纬度转换为数字类型
    const lat: number = Number(latitude);
    const lng: number = Number(longitude);

    // 检查转换后的值是否为有效数字
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid latitude or longitude values!');
      return;
    }

    // 获取地图容器元素
    const mapContainer = this.mapContainer.nativeElement;

    if (!mapContainer) {
      console.error('Map container not found!');
      return;
    }

    // 初始化地图
    const map = new Map(mapContainer, {
      center: { lat: lat, lng: lng },
      zoom: 12,
    });

    // 添加标记
    new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map,
      title: 'Selected Location',
    });

    console.log('Map initialized successfully.');
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}
populateDayViewTable(dailyData: any[]): void {
  this.dailyData = dailyData; // 将API数据保存到组件属性中
}
showDetails(day: any): void {
  console.log('Showing details for:', day);
  this.selectedDayDetails = day;
  this.selectedDate = this.formatDate(day.startTime);
  const weatherDetails = this.getWeatherDetails(day.values.weatherCode);
    this.detailsList = [
      { label: 'Status', value: weatherDetails.name },
      { label: 'Max Temperature', value: `${day.values.temperatureMax}°F` },
      { label: 'Min Temperature', value: `${day.values.temperatureMin}°F` },
      { label: 'Apparent Temperature', value: `${day.values.temperatureApparent}°F` },
      { label: 'Sun Rise Time', value: this.formatTime(day.values.sunriseTime) },
      { label: 'Sun Set Time', value: this.formatTime(day.values.sunsetTime) },
      { label: 'Humidity', value: `${day.values.humidity}%` },
      { label: 'Wind Speed', value: `${day.values.windSpeed} mph` },
      { label: 'Visibility', value: `${day.values.visibility} mi` },
      { label: 'Cloud Cover', value: `${day.values.cloudCover}%` }
    ];
    this.weatherPaneState = 'hidden';
    this.detailsPaneState = 'visible';
}
tweetWeather(): void {
  // 构建 Tweet 文本内容
  const city = this.selectedCity || 'City';
  const state = this.selectedState || 'State';
  const date = this.selectedDate || 'Date';
  const temperature = this.detailsList.find((detail) => detail.label === 'Max Temperature')?.value || 'N/A';
  const weatherCode = this.selectedDayDetails?.values.weatherCode || '';
  const summary = this.getWeatherDetails(weatherCode)?.name || 'N/A';
  
  const tweetText = `The temperature in ${city}, ${state} on ${date} is ${temperature}. The weather conditions are ${summary}. #CSCI571WeatherSearch`;

  // 创建 Tweet URL
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  // 打开 Tweet 对话框
  window.open(tweetUrl, '_blank');
}
formatTime(timeString: string): string {
  const date = new Date(timeString);
  // 使用 toLocaleTimeString 来设置时间格式为12小时制，并仅显示小时和AM/PM
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}
toggleView(showDetails: boolean): void {
  if (showDetails) {
    this.weatherPaneState = 'hidden';
    this.detailsPaneState = 'visible';
  } else {
    this.weatherPaneState = 'visible';
    this.detailsPaneState = 'hidden';
  }
}
 // 加载收藏夹列表
//  loadFavorites() {
//   this.http.get<any[]>(this.apiUrl).subscribe(
//     (data) => {
//       this.favorites = data;
//     },
//     (error) => {
//       console.error('Failed to load favorites:', error);
//     }
//   );
// }
loadFavorites() {
  this.http.get<any[]>(this.apiUrl).subscribe(
    (data) => {
      // 过滤掉包含复杂对象的数据，确保显示的是正确格式的城市和州名
      this.favorites = data.filter(item => typeof item.city === 'string' && typeof item.state === 'string');
      console.log('Favorites loaded:', this.favorites);
    },
    (error) => {
      console.error('Failed to load favorites:', error);
    }
  );
}
// 添加城市到收藏夹
addToFavorites() {
  if (!this.selectedCity || !this.selectedCity) {
    alert('Please enter both city and state.');
    return;
  }

  const city = this.selectedCity.trim();
const state = this.selectedState.trim();
  
this.http.post(this.apiUrl, { city, state }).subscribe(
  (response: any) => {
    if (response.alreadyExists) {
    } else {
    }
    this.loadFavorites(); // 刷新收藏夹列表
    this.isFavorite = true; 
  },
  (error) => {
    alert(error.error.message || 'Failed to add favorite city.');
  }
);
  // this.http.post(this.apiUrl, { city, state }).subscribe(
  //   () => {
  //     alert('City added to favorites!');
  //     this.selectedCity = '';
  //     this.selectedState = '';
  //     this.loadFavorites(); // 刷新收藏夹列表
  //   },
  //   (error) => {
  //     alert(error.error.message || 'Failed to add favorite city.');
  //   }
  // );
}
toggleFavorite() {
  const city = this.selectedCity.trim();
const state = this.selectedState.trim();
  if (this.isFavorite) {
    this.removeFromFavorites(city,state);
  } else {
    this.addToFavorites();
  }
}
// 删除收藏的城市
removeFromFavorites(city: string, state: string) {
  this.http.delete(this.apiUrl, { body: { city, state } }).subscribe(
    () => {
      this.loadFavorites();
      this.isFavorite = false;
    },
    (error) => {
      alert('Failed to remove favorite city.');
    }
  );
}
loadWeather(city: string, state: string): void {
  // 更新选中的城市和州
  this.selectedCity = city;
  this.selectedState = state;
  console.log(`Loading weather for favorite city: ${city}, ${state}`);

  // 切换到搜索结果视图
  this.isResultsSelected = true;
  this.weatherPaneState = 'visible';
  this.detailsPaneState = 'hidden';

  // 调用地理编码和天气 API
  this.fetchGeocodeAndWeather(`${city}, ${state}`)
    .then(() => {
      console.log('Weather data loaded successfully.');
      this.iserror = false;
    })
    .catch(error => {
      console.error('Failed to load weather data for favorite city:', error);
      this.iserror = true;
    });
}
// toggleView(showDetails: boolean): void {
//   if (showDetails) {
//     this.detailsPane.nativeElement.classList.remove('d-none');
//     this.weatherResults.nativeElement.classList.add('d-none');
//   } else {
//     this.detailsPane.nativeElement.classList.add('d-none');
//     this.weatherResults.nativeElement.classList.remove('d-none');
//   }
// }

  private weatherData: { [key: number]: { icon: string; name: string } } = {
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



}