"use client";

import React from "react";
import { History, BrainCircuit, BookmarkCheck, CloudSun, Bot, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IRecentActivityItem } from "@/types/analytics";

interface RecentActivityListProps {
  activities: IRecentActivityItem[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  const getIconConfig = (type: string) => {
    switch (type) {
      case "disease":
        return { icon: BrainCircuit, iconBg: "bg-teal-100 text-teal-700" };
      case "soil":
        return { icon: BookmarkCheck, iconBg: "bg-emerald-100 text-emerald-700" };
      case "weather":
        return { icon: CloudSun, iconBg: "bg-sky-100 text-sky-700" };
      case "chat":
      default:
        return { icon: Bot, iconBg: "bg-indigo-100 text-indigo-700" };
    }
  };

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Chronological log of your farm operations & AI sessions
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] font-mono">
            {activities.length} Events
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="relative pl-7 space-y-5 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
            {activities.map((act) => {
              const { icon: Icon, iconBg } = getIconConfig(act.type);
              return (
                <div key={act.id} className="relative flex items-start justify-between gap-3 group">
                  <div className={`absolute left-3.5 -translate-x-1/2 top-0.5 p-1.5 rounded-full ${iconBg} ring-4 ring-white shadow-2xs transition-transform group-hover:scale-110`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      {act.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <div className="p-3 w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-700">No Recent Activity Recorded</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Your recent disease analyses, saved soil plans, and KrishiMitra chats will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
