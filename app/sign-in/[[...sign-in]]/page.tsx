import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Sprout, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col justify-between items-center p-4 sm:p-6 md:p-8">
      {/* Top Header / Branding */}
      <header className="w-full max-w-7xl flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                KrishiVed
              </span>
              <span className="px-1.5 py-0.5 text-xs font-black rounded-lg bg-emerald-600 text-white shadow-xs">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 -mt-0.5 hidden sm:inline">
              Smart Agri Platform
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full my-auto flex flex-col items-center justify-center py-6">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                cardBox: "shadow-xl border border-emerald-100 rounded-3xl overflow-hidden glass-card w-full",
                card: "bg-white/90 backdrop-blur-md p-6 sm:p-8 w-full border-none shadow-none",
                headerTitle: "text-2xl font-bold text-slate-900 tracking-tight",
                headerSubtitle: "text-slate-600 text-sm font-normal",
                socialButtonsBlockButton: "border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-700 font-medium rounded-xl h-11",
                socialButtonsBlockButtonText: "text-slate-700 font-medium text-sm",
                dividerLine: "bg-emerald-100/80",
                dividerText: "text-slate-400 text-xs font-medium uppercase tracking-wider",
                formButtonPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-200 border-none text-sm h-11",
                formFieldLabel: "text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1",
                formFieldInput: "rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 bg-white/90 transition-all h-11 text-sm",
                footerActionLink: "text-emerald-600 hover:text-emerald-700 font-semibold transition-colors",
                identityPreviewText: "text-slate-700 font-medium",
                identityPreviewEditButtonIcon: "text-emerald-600 hover:text-emerald-700",
                formResendCodeLink: "text-emerald-600 hover:text-emerald-700 font-medium",
              },
              variables: {
                colorPrimary: "#059669",
                colorBackground: "#ffffff",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-2">
        <p>© {new Date().getFullYear()} KrishiVed AI. Smart Agricultural Intelligence Platform.</p>
      </footer>
    </div>
  );
}
