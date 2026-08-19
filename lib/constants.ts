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
  Store,
  Landmark,
  BookOpen,
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
        title: "Farm Diary",
        href: "/farm-diary",
        icon: BookOpen,
        badge: "New",
        isNew: true,
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
        href: "/crop-advisory",
        icon: Sprout,
        badge: "AI Ready",
        isNew: true,
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
      {
        title: "Mandi Prices",
        href: "/mandi-prices",
        icon: Store,
        badge: "Agmarknet",
        isNew: true,
      },
      {
        title: "Government Schemes",
        href: "/government-schemes",
        icon: Landmark,
        badge: "Verified",
        isNew: true,
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
        href: "/yield-intelligence",
        icon: TrendingUp,
        isNew: true,
      },
      {
        title: "Field Reports",
        href: "/field-reports",
        icon: FileText,
        isNew: true,
      },
      {
        title: "Quality Assurance",
        href: "/quality-assurance",
        icon: ShieldCheck,
        isNew: true,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        isNew: true,
      },
      {
        title: "Help & Support",
        href: "/help-support",
        icon: HelpCircle,
        isNew: true,
      },
    ],
  },
];
