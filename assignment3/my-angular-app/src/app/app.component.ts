import { Component } from '@angular/core';
import { WeatherComponent } from './weather/weather.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    WeatherComponent],  // 确保此处引入 WeatherComponent
  template: `
    <div>
      <app-weather></app-weather>  <!-- 使用 WeatherComponent -->
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // 根组件逻辑
  title = "myapp";
}

