"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout, Bug, CloudSun, Bot, BookmarkCheck, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAnalyticsStats } from "@/types/analytics";

interface AnalyticsStatCardsProps {
  stats: IAnalyticsStats;
}

export const AnalyticsStatCards: React.FC<AnalyticsStatCardsProps> = ({ stats }) => {
  const STAT_ITEMS = [
    {
      title: "Crop Reports",
      count: stats.cropReportsCount,
      icon: Sprout,
      description: "Actual disease & crop analysis records",
      trend: stats.cropReportsCount > 0 ? `${stats.cropReportsCount} Total` : "No records",
      trendType: "up" as const,
      iconBg: "bg-emerald-100/80 text-emerald-700",
    },
    {
      title: "Disease Analyses",
      count: stats.diseaseAnalysesCount,
      icon: Bug,
      description: "Plant disease diagnostic scans",
      trend: stats.diseaseAnalysesCount > 0 ? `${stats.diseaseAnalysesCount} Scans` : "0 Scans",
      trendType: "up" as const,
      iconBg: "bg-teal-100/80 text-teal-700",
    },
    {
      title: "Weather Checks",
      count: stats.weatherChecksCount,
      icon: CloudSun,
      description: "Regional weather & climate telemetry",
      trend: stats.weatherChecksCount > 0 ? "Synced" : "No Checks",
      trendType: "active" as const,
      iconBg: "bg-sky-100/80 text-sky-700",
    },
    {
      title: "KrishiMitra Chats",
      count: stats.conversationsCount,
      icon: Bot,
      description: "AI agricultural consultation sessions",
      trend: stats.conversationsCount > 0 ? `${stats.conversationsCount} Active` : "0 Chats",
      trendType: "up" as const,
      iconBg: "bg-indigo-100/80 text-indigo-700",
    },
    {
      title: "Soil Recommendations",
      count: stats.soilRecommendationsCount,
      icon: BookmarkCheck,
      description: "Saved NPK & soil advisory plans",
      trend: stats.soilRecommendationsCount > 0 ? `${stats.soilRecommendationsCount} Saved` : "0 Saved",
      trendType: "up" as const,
      iconBg: "bg-amber-100/80 text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {STAT_ITEMS.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
          >
            <Card
              variant="glass"
              className="p-4 h-full flex flex-col justify-between border-slate-200/70 hover:border-emerald-300 transition-all duration-300 group"
            >
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl ${item.iconBg} transition-transform group-hover:scale-110 duration-200`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge
                    variant={item.trendType === "active" ? "info" : "emerald"}
                    className="text-[10px] px-2 py-0.5 gap-1 font-semibold"
                  >
                    {item.trendType === "active" ? (
                      <Sparkles className="w-3 h-3 text-sky-500" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {item.trend}
                  </Badge>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {item.count}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-0.5 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug font-normal">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
