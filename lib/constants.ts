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
  Building2,
  Calendar,
  Droplets,
  ShieldAlert,
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
      },
      {
        title: "Crop Schedule",
        href: "/crop-schedule",
        icon: Calendar,
      },
      {
        title: "Irrigation Planning",
        href: "/irrigation",
        icon: Droplets,
      },
      {
        title: "KrishiMitra",
        href: "/ai-assistant",
        icon: Bot,
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
      },
      {
        title: "Disease Diagnostics",
        href: "/disease-detection",
        icon: BrainCircuit,
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
      },
      {
        title: "Government Schemes",
        href: "/government-schemes",
        icon: Landmark,
      },
      {
        title: "Agri Support Centers",
        href: "/agriculture-centers",
        icon: Building2,
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
      },
      {
        title: "Yield Intelligence",
        href: "/yield-intelligence",
        icon: TrendingUp,
      },
      {
        title: "Field Reports",
        href: "/field-reports",
        icon: FileText,
      },
      {
        title: "Quality Assurance",
        href: "/quality-assurance",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Admin Dashboard",
        href: "/admin",
        icon: ShieldAlert,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        href: "/help-support",
        icon: HelpCircle,
      },
    ],
  },
];
