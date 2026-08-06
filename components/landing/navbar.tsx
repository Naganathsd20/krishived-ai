"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, UserButton, SignOutButton } from "@clerk/nextjs";
import { Sprout, Menu, X, ArrowRight, LayoutDashboard, User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#top" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#why-choose" },
    { name: "Contact", href: "#footer" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 py-3.5",
        isScrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                KrishiVed
              </span>
              <span className="px-1.5 py-0.2 text-xs font-black rounded-lg bg-emerald-600 text-white shadow-xs">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 -mt-0.5 hidden sm:inline">
              Smart Agri Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons with Clerk Auth State */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>

              <Link href="/profile">
                <Button variant="ghost" size="sm" leftIcon={<UserIcon className="w-4 h-4" />}>
                  Profile
                </Button>
              </Link>

              <SignOutButton redirectUrl="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </SignOutButton>

              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-emerald-700">
                  Login
                </Button>
              </Link>

              <Link href="/sign-up">
                <Button
                  variant="emerald"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 mt-3 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 hover:text-emerald-600 py-1.5"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {isLoaded && isSignedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="emerald" className="w-full justify-center" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center" leftIcon={<UserIcon className="w-4 h-4" />}>
                      Profile
                    </Button>
                  </Link>

                  <SignOutButton redirectUrl="/">
                    <Button variant="danger" className="w-full justify-center" leftIcon={<LogOut className="w-4 h-4" />}>
                      Logout
                    </Button>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>

                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="emerald" className="w-full justify-center">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
