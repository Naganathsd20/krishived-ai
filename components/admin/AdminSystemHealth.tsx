"use client";

import React from "react";
import { Activity, Database, CloudSun, Bot, Image, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAdminServiceHealth, IAdminSystemHealth } from "@/types/admin";

interface AdminSystemHealthProps {
  health: IAdminSystemHealth;
}

export const AdminSystemHealth: React.FC<AdminSystemHealthProps> = ({ health }) => {
  const { overallStatus, database, weatherApi, geminiAi, cloudinary } = health;

  const services = [
    { key: "database", data: database, icon: Database },
    { key: "weatherApi", data: weatherApi, icon: CloudSun },
    { key: "geminiAi", data: geminiAi, icon: Bot },
    { key: "cloudinary", data: cloudinary, icon: Image },
  ];

  const getStatusBadge = (status: IAdminServiceHealth["status"]) => {
    switch (status) {
      case "Operational":
        return (
          <Badge variant="emerald" className="gap-1 text-[10px] px-2 py-0.5 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Operational</span>
          </Badge>
        );
      case "Degraded":
        return (
          <Badge variant="warning" className="gap-1 text-[10px] px-2 py-0.5 font-bold">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Degraded</span>
          </Badge>
        );
      case "Unconfigured":
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[10px] px-2 py-0.5 font-bold text-slate-500">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Fallback Provider</span>
          </Badge>
        );
    }
  };

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                System Infrastructure & Services Health
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time operational status of database and external API pipelines
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={overallStatus === "Operational" ? "emerald" : "warning"}
            className="text-[11px] px-2.5 py-0.5 font-extrabold"
          >
            System {overallStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(({ key, data, icon: Icon }) => (
            <div
              key={key}
              className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{data.name}</span>
                </div>
                {getStatusBadge(data.status)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/40">
                <span className="truncate pr-2">{data.details}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">{data.lastChecked}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
