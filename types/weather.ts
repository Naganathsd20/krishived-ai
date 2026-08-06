export interface IWeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  rainProbability: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  updatedAt: string;
}
