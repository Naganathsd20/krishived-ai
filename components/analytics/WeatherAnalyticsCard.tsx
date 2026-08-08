"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CloudSun, Thermometer, Droplets, CloudRain, Eye, TrendingUp, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IWeatherAnalyticsData } from "@/types/analytics";

interface WeatherAnalyticsCardProps {
  data: IWeatherAnalyticsData;
}

export const WeatherAnalyticsCard: React.FC<WeatherAnalyticsCardProps> = ({ data }) => {
  const {
    hasData,
    avgTemperature,
    avgHumidity,
    avgRainProbability,
    weatherChecksCount,
    recentCity,
    trend,
  } = data;

  const [activeDayIdx, setActiveDayIdx] = useState<number>(trend.length > 0 ? trend.length - 1 : 0);

  // SVG Trend Line & Area calculations
  const points = trend.map((item, idx) => {
    const step = trend.length > 1 ? 600 / (trend.length - 1) : 0;
    const x = trend.length === 1 ? 350 : 50 + idx * step;
    const y = Math.max(15, Math.min(115, 120 - (item.temp - 10) * 4));
    return { x, y, item, idx };
  });

  const lineD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `M ${points[0].x} 125 L ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") + ` L ${points[points.length - 1].x} 125 Z`
    : "";

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Weather Analytics
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Regional climate telemetry & historical weather checks
              </CardDescription>
            </div>
          </div>
          <Badge variant="info" className="text-[10px] font-mono">
            {recentCity || "Weather Sync"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700">Avg Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-amber-900 font-mono mt-0.5">
              {avgTemperature !== null ? `${avgTemperature}°C` : "N/A"}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {avgTemperature !== null ? "Average Recorded" : "No telemetry"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-sky-700">Avg Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-extrabold text-sky-900 font-mono mt-0.5">
              {avgHumidity !== null ? `${avgHumidity}%` : "N/A"}
            </div>
            <span className="text-[10px] text-sky-700 font-medium">
              {avgHumidity !== null ? "Humidity Level" : "No telemetry"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-indigo-700">Rain Prob</span>
              <CloudRain className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-indigo-900 font-mono mt-0.5">
              {avgRainProbability !== null ? `${avgRainProbability}%` : "N/A"}
            </div>
            <span className="text-[10px] text-indigo-700 font-medium">Precipitation</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Weather Checks</span>
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-900 font-mono mt-0.5">
              {weatherChecksCount}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Saved Syncs</span>
          </div>
        </div>

        {/* 7-Day Temperature Trend Visual Chart */}
        {hasData && trend.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Weather Check Temperature (°C) History
              </span>
              <span className="text-[11px] font-mono text-sky-700 font-semibold">
                Stored Records
              </span>
            </div>

            {/* Custom SVG Line & Area Chart Container */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-inner relative overflow-hidden">
              <div className="h-36 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 130">
                  <defs>
                    <linearGradient id="tempGradReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="700" y2="25" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="65" x2="700" y2="65" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="105" x2="700" y2="105" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Dynamic Area Fill */}
                  {areaD && <path d={areaD} fill="url(#tempGradReal)" />}

                  {/* Dynamic Line Path */}
                  {lineD && (
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      d={lineD}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* SVG Points */}
                  {points.map(({ x, y, item, idx }) => {
                    const isSelected = activeDayIdx === idx;
                    return (
                      <g key={idx} className="cursor-pointer" onClick={() => setActiveDayIdx(idx)}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 7 : 5}
                          className={`${
                            isSelected
                              ? "fill-white stroke-sky-600 stroke-[3]"
                              : "fill-sky-500 stroke-white stroke-2"
                          } transition-all duration-200`}
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="text-[11px] font-bold fill-slate-700 font-mono"
                        >
                          {item.temp}°
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Day Labels below chart */}
                <div className="flex justify-between px-4 mt-2">
                  {trend.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIdx(idx)}
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg transition-colors ${
                        activeDayIdx === idx
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {trend[activeDayIdx] && (
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-800">
                    {trend[activeDayIdx].city} ({trend[activeDayIdx].dateStr}):
                  </span>
                  <span className="text-slate-600 font-medium">
                    {trend[activeDayIdx].temp}°C • {trend[activeDayIdx].humidity}% Humidity
                  </span>
                </div>
                <Badge variant="info" className="text-[10px] font-bold font-mono">
                  {trend[activeDayIdx].rainProb}% Rain
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/60 flex items-start gap-3 text-xs text-sky-900">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Historical weather analytics requires stored checks.</span>
              <p className="mt-1 leading-relaxed text-[11px] text-sky-800">
                Perform weather searches or save soil recommendations on the Weather & Soil page to build your personal historical weather trend log.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
