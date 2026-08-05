"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] relative">
      {/* Top Glass Navbar */}
      <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Main Content Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
