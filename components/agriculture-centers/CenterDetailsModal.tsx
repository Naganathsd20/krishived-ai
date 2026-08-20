"use client";

import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Navigation,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IAgricultureCenter } from "@/types/agriculture-center";

interface CenterDetailsModalProps {
  center: IAgricultureCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CenterDetailsModal: React.FC<CenterDetailsModalProps> = ({ center, isOpen, onClose }) => {
  if (!center) return null;

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
    sourceUrl,
    lastVerified,
    distanceKm,
  } = center;

  const getDirectionsUrl = () => {
    const coords = location?.coordinates;
    if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
    }
    const queryStr = encodeURIComponent(`${name}, ${address}, ${district}, ${state}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${queryStr}`;
  };

  const formattedDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Verified";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={name}
      description={`${district}, ${state} • Official Agriculture Support Center`}
      size="lg"
      footer={
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-bold border-slate-200 text-slate-700"
          >
            Close
          </Button>

          <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
            <Button variant="emerald" size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Map</span>
            </Button>
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="emerald" className="text-xs py-1 px-2.5 font-bold gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Government Center
          </Badge>

          <Badge variant="info" className="text-xs py-1 px-2.5 font-bold">
            {type}
          </Badge>

          {distanceKm !== null && distanceKm !== undefined && (
            <Badge variant="warning" className="text-xs py-1 px-2.5 font-mono font-bold">
              {distanceKm} km away
            </Badge>
          )}
        </div>

        {/* Address & Location Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Official Center Address
          </h4>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">{address}</p>
          <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 font-medium">
            <span>District: <strong className="text-slate-700">{district}</strong></span>
            <span>State: <strong className="text-slate-700">{state}</strong></span>
            {pincode && <span>PIN Code: <strong className="text-slate-700">{pincode}</strong></span>}
          </div>
        </div>

        {/* Verified Contact Methods */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Contact Directory
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Telephone</span>
              </div>
              <div>
                {phone ? (
                  <a href={`tel:${phone}`} className="text-xs font-mono font-bold text-emerald-700 hover:underline">
                    {phone}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not available</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email Address</span>
              </div>
              <div className="truncate">
                {email ? (
                  <a href={`mailto:${email}`} className="text-xs font-mono font-semibold text-emerald-700 hover:underline" title={email}>
                    {email}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not available</span>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Web Portal</span>
              </div>
              <div>
                {website ? (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Source Integrity Metadata */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-1.5 text-xs text-emerald-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Verification Source</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-800">
            {officialSource}
            {sourceUrl && (
              <>
                {" • "}
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                  Reference Catalog
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
};
