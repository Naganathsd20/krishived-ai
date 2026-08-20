"use client";

import React from "react";
import { History, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAdminRecentActivity } from "@/types/admin";

interface AdminRecentActivityProps {
  activities: IAdminRecentActivity[];
}

export const AdminRecentActivity: React.FC<AdminRecentActivityProps> = ({ activities }) => {
  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Anonymized Platform Activity Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time activity stream across diagnostics, schedules, diary entries & soil telemetry
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold text-slate-600">
            Privacy-Protected Stream
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-1 space-y-2.5">
        {!activities || activities.length === 0 ? (
          <div className="p-6 text-center space-y-2 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No recent platform activity logged</p>
            <p className="text-[11px] text-slate-500">
              Activities will appear here in real-time as farmers interact with platform tools.
            </p>
          </div>
        ) : (
          activities.map((act) => {
            const timeFormatted = new Date(act.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const dateFormatted = new Date(act.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start justify-between gap-3 hover:bg-slate-100/70 transition-all"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" className="text-[9px] px-1.5 py-0 font-bold shrink-0">
                      {act.activityType}
                    </Badge>
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {act.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-700 font-semibold">{act.crop}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                  <div>{timeFormatted}</div>
                  <div>{dateFormatted}</div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
