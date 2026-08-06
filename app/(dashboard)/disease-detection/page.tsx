"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileImage,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Info,
  Camera,
  Sun,
  ZoomIn,
  Loader2,
  ShieldAlert,
  Zap,
  Activity,
  Pill,
  Leaf,
  Clock,
  History,
  Check,
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uploadImageWithProgress } from "@/lib/upload";
import { IDiseaseAnalysisDocument } from "@/types/disease";

export default function DiseaseDetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Analysis & History State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IDiseaseAnalysisDocument | null>(null);
  const [historyList, setHistoryList] = useState<IDiseaseAnalysisDocument[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch past analysis history from MongoDB
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/analyze-disease");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryList(data.history);
        }
      }
    } catch (err) {
      console.error("Failed to load disease history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    setShowSuccessToast(false);
    setUploadProgress(0);
    setAnalysisResult(null);

    // 1. Format Validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid format. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    // 2. Size Validation (10MB limit)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg("File size exceeds 10MB limit. Please select a smaller file.");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      // 3. Upload to Cloudinary
      const result = await uploadImageWithProgress({
        file,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      if (result.success && result.secure_url) {
        setCloudinaryUrl(result.secure_url);
        if (result.public_id) {
          setPublicId(result.public_id);
        }
        setShowSuccessToast(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to upload image. Please check your network connection.";
      setErrorMsg(errorMessage);
      setSelectedFile(null);
      setCloudinaryUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!cloudinaryUrl) {
      setErrorMsg("Please upload an image before running AI analysis.");
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze-disease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cloudinaryUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        // Refresh analysis history
        fetchHistory();
      } else {
        throw new Error(data.error || "Failed to analyze crop image.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "AI Analysis failed. Please try again.";
      setErrorMsg(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setCloudinaryUrl(null);
    setPublicId(null);
    setErrorMsg(null);
    setShowSuccessToast(false);
    setUploadProgress(0);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return <Badge variant="danger">Severity: High</Badge>;
      case "Medium":
        return <Badge variant="warning">Severity: Medium</Badge>;
      default:
        return <Badge variant="emerald">Severity: Low / Healthy</Badge>;
    }
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <PageHeader
        title="🌿 AI Crop Disease Detection"
        description="Upload a clear image of a crop or leaf. Our AI analyzes the image and identifies possible diseases within seconds."
        badge={
          <Badge variant="emerald" dot>
            Gemini Vision AI & MongoDB Active
          </Badge>
        }
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Toast Notification */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">
                  Image uploaded to Cloudinary CDN! Ready for AI Diagnostic Scan.
                </span>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-xs underline font-medium hover:opacity-80"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Upload Card */}
        <Card variant="glass" className="border-emerald-100 shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3">
              <Sprout className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
              Crop Image Analysis & Diagnostics
            </CardTitle>
            <CardDescription className="text-slate-600 max-w-md mx-auto">
              Upload your field leaf photograph to trigger real-time Google Gemini Vision AI evaluation.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onInputChange}
              accept="image/jpeg,image/jpg,image/png"
              disabled={isUploading || isAnalyzing}
              className="hidden"
            />

            {/* Error Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uploading Progress Indicator */}
            {isUploading && (
              <div className="mb-6 p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>

                <div className="w-full max-w-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Uploading to Cloudinary CDN...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Optimizing image quality for Gemini AI Vision model...
                </p>
              </div>
            )}

            {/* AI Analyzing Indicator */}
            {isAnalyzing && (
              <div className="mb-6 p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-inner animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>

                <div>
                  <h4 className="text-lg font-bold">Gemini Vision AI Analyzing Crop Image...</h4>
                  <p className="text-xs text-emerald-200/80 mt-1 max-w-sm">
                    Scanning cellular leaf patterns, spot distributions, and pathological symptoms...
                  </p>
                </div>

                <Badge variant="glass" className="text-xs text-emerald-300 border-emerald-400/30">
                  AI Model: Gemini 1.5 Flash Vision
                </Badge>
              </div>
            )}

            {!cloudinaryUrl && !isUploading && !isAnalyzing ? (
              /* Drag & Drop Area */
              <motion.div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group",
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-500/10 scale-[1.01]"
                    : "border-slate-300 hover:border-emerald-500 bg-white/70 hover:bg-emerald-50/40 shadow-xs"
                )}
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100/80 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-md mb-5">
                  <UploadCloud className="w-8 h-8 transition-transform group-hover:scale-110" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Drag & Drop your crop image here
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm">
                  Drag and drop a photo directly from your device, or click below to select a file.
                </p>

                <Button
                  type="button"
                  variant="emerald"
                  size="md"
                  leftIcon={<FileImage className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="shadow-md shadow-emerald-600/20"
                >
                  Upload Image
                </Button>

                {/* Information Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-200/60 w-full max-w-md">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Formats: <strong>JPG, JPEG, PNG</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Max Size: <strong>10MB</strong></span>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {/* Cloudinary Preview & Action Bar */}
            {cloudinaryUrl && !isUploading && !isAnalyzing && !analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="space-y-6"
              >
                {/* Large Preview Container */}
                <div className="relative rounded-3xl overflow-hidden border border-emerald-200 shadow-xl bg-slate-900/90 group max-h-[420px] flex items-center justify-center">
                  <img
                    src={cloudinaryUrl}
                    alt="Cloudinary crop preview"
                    className="w-full h-auto max-h-[420px] object-contain rounded-3xl"
                  />

                  <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cloudinary Secured</span>
                  </div>
                </div>

                {/* File Details */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {selectedFile?.name || "Uploaded Crop Image"}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Size: {selectedFile ? formatFileSize(selectedFile.size) : "Uploaded"} • Ready for Gemini AI
                        </p>
                      </div>
                    </div>

                    <Badge variant="emerald" className="px-3 py-1 text-xs shrink-0">
                      CDN Image Active
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </Button>

                  <Button
                    type="button"
                    variant="emerald"
                    className="w-full sm:w-auto shadow-lg shadow-emerald-600/25 px-6"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    onClick={handleAnalyzeClick}
                  >
                    Analyze Disease with Gemini AI
                  </Button>
                </div>
              </motion.div>
            )}

            {/* AI Diagnostic Results Cards */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Header & Status Card */}
                <Card variant="glass" className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 shadow-xl overflow-hidden">
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                          <Activity className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                              Gemini Vision AI Diagnosis
                            </span>
                            <span className="text-xs text-slate-400">• Confidence: {analysisResult.confidence}</span>
                          </div>
                          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                            {analysisResult.disease}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getSeverityBadge(analysisResult.severity)}
                        <Badge variant="glass" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          Saved to MongoDB
                        </Badge>
                      </div>
                    </div>

                    {/* Image Preview & Immediate Action Highlight */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md max-h-56">
                        <img
                          src={analysisResult.imageUrl}
                          alt={analysisResult.disease}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Immediate Actions */}
                      <div className="md:col-span-2 p-5 rounded-2xl bg-emerald-900 text-white space-y-3 shadow-md">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>Immediate Action Plan for Farmer</span>
                        </div>
                        <ul className="space-y-2">
                          {analysisResult.immediateActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-100 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Diagnosis Overview Grid */}
                    <GridContainer cols={2}>
                      {/* Symptoms Card */}
                      <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                          <span>Observed Symptoms</span>
                        </div>
                        <ul className="space-y-1.5">
                          {analysisResult.symptoms.map((sym, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pathogen Cause Card */}
                      <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>Root Cause & Pathogen</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {analysisResult.cause}
                        </p>
                      </div>
                    </GridContainer>

                    {/* Treatment & Prevention Grid */}
                    <GridContainer cols={2}>
                      {/* Recommended Treatment */}
                      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span>Recommended Treatment Steps</span>
                        </div>
                        <ol className="space-y-2">
                          {analysisResult.treatment.map((step, i) => (
                            <li key={i} className="text-xs text-emerald-900 flex items-start gap-2">
                              <span className="font-bold text-emerald-700">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Prevention Strategy */}
                      <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                        <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
                          <Sprout className="w-4 h-4 text-teal-600" />
                          <span>Prevention & Cultural Control</span>
                        </div>
                        <ul className="space-y-2">
                          {analysisResult.prevention.map((prev, i) => (
                            <li key={i} className="text-xs text-teal-900 flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{prev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </GridContainer>

                    {/* Recommended Products Card */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Recommended Fertilizer Formulation
                        </span>
                        <p className="text-xs font-bold text-slate-800">
                          {analysisResult.recommendedFertilizer}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Recommended Fungicide / Pesticide
                        </span>
                        <p className="text-xs font-bold text-emerald-700">
                          {analysisResult.recommendedPesticide}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                      >
                        Scan Another Crop Photo
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Previous Analysis History List */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <CardTitle>Recent Analysis History (MongoDB)</CardTitle>
              </div>
              <Badge variant="glass" className="text-xs">
                {historyList.length} Saved Scans
              </Badge>
            </div>
            <CardDescription>
              View past AI crop disease diagnostic records saved to your MongoDB profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading MongoDB scan history...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No past crop diagnostic scans found. Upload a photo above to run your first Gemini Vision scan!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {historyList.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-emerald-400 transition-all cursor-pointer"
                    onClick={() => {
                      setAnalysisResult(item);
                      setCloudinaryUrl(item.imageUrl);
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.disease}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {item.disease}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Confidence: {item.confidence}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photography Best Practices Card */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              <CardTitle>Photography Tips for High Accuracy</CardTitle>
            </div>
            <CardDescription>
              Follow these simple guidelines to ensure optimal AI diagnosis accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-0.5">Close-Up Focus</h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Capture a clear, focused photo of the affected leaf, stem, or fruit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-0.5">Good Lighting</h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Use bright, natural daylight without harsh glare or heavy shadows.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-0.5">Visible Symptoms</h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Ensure leaf spots, discoloration, or fungal lesions are clearly visible.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
