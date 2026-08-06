"use client";

import React from "react";
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Cloud,
  Thermometer,
  MapPin,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IWeatherData } from "@/types/weather";

interface WeatherCardProps {
  weather: IWeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes("rain") || cond.includes("shower")) {
      return <CloudRain className="w-12 h-12 text-blue-500 animate-pulse" />;
    }
    if (cond.includes("drizzle")) {
      return <CloudDrizzle className="w-12 h-12 text-teal-500" />;
    }
    if (cond.includes("thunder") || cond.includes("storm")) {
      return <CloudLightning className="w-12 h-12 text-amber-500" />;
    }
    if (cond.includes("cloud")) {
      return <CloudSun className="w-12 h-12 text-emerald-600" />;
    }
    return <Sun className="w-12 h-12 text-amber-500 animate-spin-slow" />;
  };

  return (
    <Card
      variant="glass"
      className="border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 shadow-xl p-6 sm:p-8 overflow-hidden relative"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left: Location & Temperature */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {weather.city}, <span className="text-emerald-700">{weather.country}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated: {weather.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-4 pt-2">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">
              {weather.temperature}°C
            </span>
            <div className="space-y-1">
              <Badge variant="emerald" className="px-2.5 py-0.5 text-xs">
                {weather.condition}
              </Badge>
              <p className="text-xs text-slate-500 capitalize font-medium">
                {weather.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Weather Icon & High/Low Meta */}
        <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-8">
          <div className="p-4 rounded-3xl bg-white/80 border border-slate-200/80 shadow-sm flex items-center justify-center">
            {getWeatherIcon(weather.condition)}
          </div>

          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-600 font-semibold">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              <span>Feels like {weather.feelsLike}°C</span>
            </div>

            <div className="flex items-center justify-end gap-3 text-xs font-semibold">
              <span className="text-emerald-600">High: {weather.tempMax}°C</span>
              <span className="text-slate-400">|</span>
              <span className="text-blue-600">Low: {weather.tempMin}°C</span>
            </div>

            <Badge variant="glass" className="text-[11px] text-emerald-800 bg-emerald-100/80 border-emerald-300">
              Optimal Agronomic Range
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
