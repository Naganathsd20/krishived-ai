"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Navigation,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IAgricultureCenter } from "@/types/agriculture-center";

interface AgricultureCenterCardProps {
  center: IAgricultureCenter;
  onViewDetails: (center: IAgricultureCenter) => void;
}

export const AgricultureCenterCard: React.FC<AgricultureCenterCardProps> = ({ center, onViewDetails }) => {
  const {
    name,
    type,
    address,
    district,
    state,
    pincode,
    phone,
    email,
    website,
    location,
    officialSource,
    lastVerified,
    distanceKm,
  } = center;

  // Type styling configuration
  const getTypeBadge = (typeVal: string) => {
    switch (typeVal) {
      case "KVK":
        return { label: "Krishi Vigyan Kendra (KVK)", variant: "emerald" as const };
      case "GovtOffice":
        return { label: "Govt Agriculture Office", variant: "info" as const };
      case "University":
        return { label: "Agri University / Research", variant: "warning" as const };
      case "SoilLab":
        return { label: "Soil Testing Lab", variant: "emerald" as const };
      case "FarmerService":
        return { label: "Farmer Support Center", variant: "info" as const };
      default:
        return { label: typeVal, variant: "outline" as const };
    }
  };

  const typeConfig = getTypeBadge(type);

  // Google Maps Directions Deep Link
  const getDirectionsUrl = () => {
    const coords = location?.coordinates;
    if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
      const lng = coords[0];
      const lat = coords[1];
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const queryStr = encodeURIComponent(`${name}, ${address}, ${district}, ${state}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${queryStr}`;
  };

  const formattedVerifiedDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently Verified";

  return (
    <Card
      variant="glass"
      className="p-5 h-full flex flex-col justify-between border-slate-200/80 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md group"
    >
      <CardContent className="p-0 space-y-4 flex-grow">
        {/* Header: Title & Badges */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={typeConfig.variant} className="text-[10px] py-0.5 px-2 font-extrabold">
              {typeConfig.label}
            </Badge>

            {distanceKm !== null && distanceKm !== undefined && (
              <Badge variant="emerald" className="text-[10px] py-0.5 px-2 font-mono font-bold shrink-0 gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" />
                {distanceKm} km away
              </Badge>
            )}
          </div>

          <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
            {name}
          </h3>
        </div>

        {/* Address & Location */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {address}
              {pincode ? `, PIN: ${pincode}` : ""}
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500 pl-6">
            District: <span className="text-slate-800">{district}</span> • State:{" "}
            <span className="text-slate-800">{state}</span>
          </div>
        </div>

        {/* Contact Information List */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2 text-xs">
          {/* Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone:</span>
            </div>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                {phone}
              </a>
            ) : (
              <span className="text-slate-400 italic">Not available</span>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email:</span>
            </div>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="font-mono font-semibold text-emerald-700 hover:underline truncate max-w-[160px]"
                title={email}
              >
                {email}
              </a>
            ) : (
              <span className="text-slate-400 italic">Not available</span>
            )}
          </div>

          {/* Official Website */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Website:</span>
            </div>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-400 italic">Not available</span>
            )}
          </div>
        </div>

        {/* Verification Source Metadata */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
          <div className="flex items-center gap-1" title={officialSource}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[180px] font-medium">{officialSource}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Verified {formattedVerifiedDate}</span>
          </div>
        </div>
      </CardContent>

      {/* Footer Action Buttons */}
      <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(center)}
          className="flex-1 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Details</span>
        </Button>

        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="emerald"
            size="sm"
            className="w-full rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </Button>
        </a>
      </div>
    </Card>
  );
};
