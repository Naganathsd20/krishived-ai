import { ReactNode } from "react";

export type ComponentVariant = "default" | "emerald" | "outline" | "glass" | "ghost" | "danger";
export type ComponentSize = "sm" | "md" | "lg";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface CardProps extends BaseComponentProps {
  variant?: "default" | "glass" | "bordered" | "gradient";
  hoverEffect?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export interface NotificationSettings {
  diseaseAlerts: boolean;
  weatherAlerts: boolean;
  soilAdvisories: boolean;
}

export interface MongoUserProfile {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  image: string;
  role: string;
  language: string;
  defaultLocation?: string;
  defaultCrop?: string;
  notificationPreferences?: NotificationSettings;
  createdAt?: string;
}

