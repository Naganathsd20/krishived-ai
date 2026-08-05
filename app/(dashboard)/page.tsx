"use client";

import React, { useState } from "react";
import {
  Sprout,
  BrainCircuit,
  TrendingUp,
  CloudSun,
  Sparkles,
  Plus,
  ArrowUpRight,
  Search,
  Mail,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GridContainer,
} from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonCard } from "@/components/ui/loading";

export default function OverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoInput, setDemoInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) {
      setInputError("Field name is required for validation test.");
      return;
    }
    setInputError("");
    setIsLoadingDemo(true);
    setTimeout(() => {
      setIsLoadingDemo(false);
      alert(`Validation Successful! Input value: "${demoInput}"`);
    }, 800);
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Project Foundation & Component Suite"
        description="Welcome to KrishiVed AI — Next-gen scalable architectural foundation with glassmorphism design tokens, Framer Motion primitives, and custom green theme."
        badge={
          <Badge variant="glass" dot>
            Foundational Build Ready
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Launch Modal Demo
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <GridContainer cols={4}>
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Advisory Models
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">24/7</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              +100% Ready <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Ready for Gemini AI advisory pipeline integration
          </p>
        </Card>

        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Diagnostic Precision
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">99.4%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              Target <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Custom vision & multi-modal pest analysis engine
          </p>
        </Card>

        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Soil Telemetry Nodes
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">1,280</span>
            <Badge variant="warning" className="text-[10px]">
              Simulated
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Micro-climate telemetry stream ready for MongoDB
          </p>
        </Card>

        <Card variant="gradient" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Architecture Score
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">100/100</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-2">
            Strict Next.js 15 App Router & TypeScript
          </p>
        </Card>
      </GridContainer>

      {/* Component Suite Showcases */}
      <div className="space-y-8 pt-4">
        {/* Section 1: Button Variants & Sizes */}
        <Card variant="glass" hoverEffect={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <CardTitle>Reusable Button Design System</CardTitle>
            </div>
            <CardDescription>
              Flexible multi-variant buttons with Framer Motion hover/tap spring feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Variants
              </h5>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Default Emerald</Button>
                <Button variant="emerald" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Gradient Glow
                </Button>
                <Button variant="outline">Outline Glass</Button>
                <Button variant="glass">Glass Pill</Button>
                <Button variant="ghost">Ghost Style</Button>
                <Button variant="danger">Danger Action</Button>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Sizes & States
              </h5>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="emerald">
                  Small Button
                </Button>
                <Button size="md" variant="emerald">
                  Medium Button
                </Button>
                <Button size="lg" variant="emerald">
                  Large Hero Button
                </Button>
                <Button size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="emerald" isLoading>
                  Processing
                </Button>
                <Button variant="default" disabled>
                  Disabled State
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Form Input Component & Validation */}
        <GridContainer cols={2}>
          <Card variant="glass" hoverEffect={false}>
            <CardHeader>
              <CardTitle>Form Inputs & Text Fields</CardTitle>
              <CardDescription>
                Input components with floating icons, label validation, and focus rings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <Input
                  label="Farm Field Identifier"
                  placeholder="e.g. Sector-7 North Organic Plot"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  error={inputError}
                  required
                />

                <Input
                  label="Agronomist Email Address"
                  placeholder="agronomist@krishived.ai"
                  type="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="Verification notice will be sent via Cloudinary/Clerk flow."
                />

                <Input
                  label="API Access Secret Token"
                  type="password"
                  placeholder="••••••••••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="emerald"
                    className="w-full"
                    isLoading={isLoadingDemo}
                  >
                    Test Input Validation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Badges & Status Pill Showcase */}
          <Card variant="glass" hoverEffect={false}>
            <CardHeader>
              <CardTitle>Badges & Status Indicators</CardTitle>
              <CardDescription>
                Pill badges for real-time status reporting, categories, and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Status Pills
                </h5>
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="emerald" dot>
                    Active Crop Season
                  </Badge>
                  <Badge variant="warning" dot>
                    Pest Threat Detected
                  </Badge>
                  <Badge variant="info">Soil Hydro Sync</Badge>
                  <Badge variant="glass" dot>
                    Glassmorphic Tag
                  </Badge>
                  <Badge variant="danger" dot>
                    Critical Anomaly
                  </Badge>
                  <Badge variant="outline">Default Outline</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Loading Skeleton Placeholders
                </h5>
                <SkeletonCard />
              </div>
            </CardContent>
          </Card>
        </GridContainer>

        {/* Section 3: Empty State Component Showcase */}
        <Card variant="glass" hoverEffect={false}>
          <CardHeader>
            <CardTitle>Empty State Component</CardTitle>
            <CardDescription>
              Clean placeholder interface for empty lists, search results, or pending data loading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Soil Telemetry Logs Found"
              description="Connect a physical IoT node or generate simulated telemetry data to begin monitoring soil pH, moisture, and NPK levels."
              icon={<Sprout className="w-8 h-8" />}
              actionLabel="Simulate Sensor Data"
              onAction={() => alert("Simulation trigger ready for backend!")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Dialog Component Showcase */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="KrishiVed AI Platform Foundation"
        description="Modular architecture initialized for scalable development."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="emerald" onClick={() => setIsModalOpen(false)}>
              Acknowledge & Proceed
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-emerald-950">
                Foundation Architecture Active
              </h5>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                The folder structure, atomic UI primitives, Tailwind green glass design system, and responsive layout are fully configured.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-amber-950">Backend & AI Isolated</h5>
              <p className="text-xs text-amber-800/90 mt-0.5">
                As instructed, MongoDB, Gemini AI, Clerk Auth, and Cloudinary backends are postponed for future development phases.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
