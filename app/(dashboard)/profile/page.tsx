import React from "react";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import {
  PageContainer,
  PageHeader,
} from "@/components/layout/container";

export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Mail, User as UserIcon, Calendar, CheckCircle2, Sprout } from "lucide-react";

export default async function ProfilePage() {
  const user = await getOrCreateUser();

  if (!user) {
    redirect("/sign-in");
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Joined";

  return (
    <PageContainer>
      <PageHeader
        title="User Profile & Account Settings"
        description="View and manage your KrishiVed AI farmer profile, authentication preferences, and system language settings."
        badge={
          <Badge variant="emerald" dot>
            MongoDB User Profile
          </Badge>
        }
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Profile Summary Card */}
        <Card variant="glass" className="border-emerald-200/80 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-28 w-full relative" />

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-xl">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {user.name}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <Badge variant="emerald" className="px-3 py-1 text-xs">
                Verified {user.role}
              </Badge>
            </div>

            {/* Profile Field Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Full Name
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {user.name}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </span>
                  <span className="text-base font-bold text-slate-900 truncate block">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Assigned Role
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {user.role || "Farmer"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Platform Language
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {user.language || "English"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account System Status */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <CardTitle>MongoDB Account Synchronization</CardTitle>
            </div>
            <CardDescription>
              Your Clerk identity and MongoDB profile database are in active sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-sm">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Clerk ID: <code className="text-xs font-mono text-emerald-800 bg-white/80 px-1.5 py-0.5 rounded">{user.clerkId}</code></span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Member Since: {formattedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
