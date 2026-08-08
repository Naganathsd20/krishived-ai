import {
  LayoutDashboard,
  Sprout,
  BrainCircuit,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
  User,
  Bot,
  BarChart3,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const APP_CONFIG = {
  name: "KrishiVed AI",
  tagline: "AI-Powered Smart Agricultural Intelligence",
  version: "1.0.0-beta",
  status: "Operational",
};

export const DASHBOARD_NAV_ITEMS: NavSection[] = [
  {
    label: "Main Platform",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "KrishiMitra",
        href: "/ai-assistant",
        icon: Bot,
        isNew: true,
      },
      {
        title: "Profile",
        href: "/profile",
        icon: User,
      },
      {
        title: "Crop Advisory",
        href: "#",
        icon: Sprout,
        badge: "AI Ready",
      },
      {
        title: "Disease Diagnostics",
        href: "/disease-detection",
        icon: BrainCircuit,
        isNew: true,
      },
      {
        title: "Weather & Soil",
        href: "/weather-soil",
        icon: CloudSun,
      },
    ],
  },
  {
    label: "Analytics & Reports",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        isNew: true,
      },
      {
        title: "Yield Intelligence",
        href: "#",
        icon: TrendingUp,
      },
      {
        title: "Field Reports",
        href: "#",
        icon: FileText,
      },
      {
        title: "Quality Assurance",
        href: "#",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "#",
        icon: Settings,
      },
      {
        title: "Help & Support",
        href: "#",
        icon: HelpCircle,
      },
    ],
  },
];
