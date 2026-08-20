"use client";

import React from "react";
import { Users, UserPlus, Activity, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IAdminKpiStats } from "@/types/admin";

interface AdminKpiCardsProps {
  stats: IAdminKpiStats;
  timeRangeLabel: string;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ stats, timeRangeLabel }) => {
  const { totalUsers, newUsersInRange, activeUsersInRange, totalPlatformActivities } = stats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Total Users */}
      <Card variant="glass" className="p-4 border-emerald-200/80 bg-emerald-50/20">
        <CardContent className="p-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>Total Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono tracking-tight">
            {totalUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Registered platform accounts
          </p>
        </CardContent>
      </Card>

      {/* New Signups */}
      <Card variant="glass" className="p-4 border-sky-200/80 bg-sky-50/20">
        <CardContent className="p-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-sky-800 font-bold">
            <span>New Farmers</span>
            <UserPlus className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-950 font-mono tracking-tight">
            +{newUsersInRange.toLocaleString()}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">
            Joined within {timeRangeLabel}
          </p>
        </CardContent>
      </Card>

      {/* Active Farmers */}
      <Card variant="glass" className="p-4 border-teal-200/80 bg-gradient-to-br from-teal-50/40 to-emerald-50/40">
        <CardContent className="p-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-teal-900 font-bold">
            <span>Active Farmers</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-950 font-mono tracking-tight">
            {activeUsersInRange.toLocaleString()}
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            Active in {timeRangeLabel} window
          </p>
        </CardContent>
      </Card>

      {/* Total Platform Activity */}
      <Card variant="glass" className="p-4 border-amber-200/80 bg-amber-50/20">
        <CardContent className="p-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
            <span>Total Activities</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950 font-mono tracking-tight">
            {totalPlatformActivities.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            Scans, chats, logs & schedules
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
