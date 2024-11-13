import { Routes } from '@angular/router';
import { WeatherComponent } from './weather/weather.component';

export const routes: Routes = [
    { path: '', component: WeatherComponent } // 配置根路径加载 WeatherComponent
  ];