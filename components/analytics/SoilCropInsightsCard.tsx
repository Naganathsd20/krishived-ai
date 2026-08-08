"use client";

import React from "react";
import { Sprout, Activity, Beaker, Droplet, ArrowUpRight, Sparkles, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ISoilCropInsightsData } from "@/types/analytics";

interface SoilCropInsightsCardProps {
  data: ISoilCropInsightsData;
}

export const SoilCropInsightsCard: React.FC<SoilCropInsightsCardProps> = ({ data }) => {
  const {
    hasData,
    mostRecommendedCrop,
    averageSoilScore,
    mostCommonFertilizer,
    irrigationRecommendation,
  } = data;

  const INSIGHTS = [
    {
      title: "Most Recommended Crop",
      value: mostRecommendedCrop,
      subtext: hasData ? "Calculated from your saved soil analyses" : "No saved soil data",
      icon: Sprout,
      iconBg: "bg-emerald-100/80",
      iconColor: "text-emerald-700",
      badge: "Top Crop",
    },
    {
      title: "Average Soil Score",
      value: averageSoilScore,
      subtext: hasData ? "Average NPK & organic fertility rating" : "No soil test records",
      icon: Activity,
      iconBg: "bg-teal-100/80",
      iconColor: "text-teal-700",
      badge: "Soil Rating",
    },
    {
      title: "Most Common Fertilizer",
      value: mostCommonFertilizer,
      subtext: hasData ? "Primary recommended blend" : "No fertilizer data",
      icon: Beaker,
      iconBg: "bg-amber-100/80",
      iconColor: "text-amber-700",
      badge: "NPK Ratio",
    },
    {
      title: "Irrigation Advisory",
      value: irrigationRecommendation,
      subtext: hasData ? "Latest water schedule recommendation" : "No schedule saved",
      icon: Droplet,
      iconBg: "bg-cyan-100/80",
      iconColor: "text-cyan-700",
      badge: "Water Plan",
    },
  ];

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Soil & Crop Insights
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Calculated directly from your saved soil recommendations
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] font-mono">
            {hasData ? "Real Records" : "No Saved Data"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INSIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 hover:border-emerald-300 transition-all duration-200 shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2.5 rounded-xl ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="emerald" className="text-[10px] py-0.5 px-2 font-semibold">
                        {item.badge}
                      </Badge>
                    </div>

                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      {item.title}
                    </span>
                    <div className="text-sm font-extrabold text-slate-900 mt-1 leading-snug truncate">
                      {item.value}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="leading-snug truncate">{item.subtext}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center space-y-2">
            <Info className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No Saved Soil Recommendations</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save AI soil recommendations on the Weather & Soil page to generate personalized crop, soil score, and fertilizer insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
