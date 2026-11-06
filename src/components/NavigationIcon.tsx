"use client";

import React from "react";
import {
  Target,
  FileText,
  BookOpen,
  BookMarked,
  Trophy,
  Zap,
  Clock,
  Keyboard,
  Newspaper,
  GraduationCap,
  Wrench,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Link as LinkIcon,
  Layers,
  Compass,
  CircleHelp,
  Send,
  Star,
  ExternalLink,
  Flame,
  Award,
  Bookmark,
  Bell,
  Code,
  Folder,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const AVAILABLE_NAV_ICONS = [
  { name: "Target", label: "Target (Exams)", component: Target },
  { name: "FileText", label: "File Text (PYQ / Papers)", component: FileText },
  { name: "BookOpen", label: "Book Open (Notes)", component: BookOpen },
  { name: "BookMarked", label: "Book Marked (Books)", component: BookMarked },
  { name: "Trophy", label: "Trophy (Mocks / Rank)", component: Trophy },
  { name: "Zap", label: "Zap (Practice / Quiz)", component: Zap },
  { name: "Clock", label: "Clock (Speed Test)", component: Clock },
  { name: "Keyboard", label: "Keyboard (Typing)", component: Keyboard },
  { name: "Newspaper", label: "Newspaper (Blog / News)", component: Newspaper },
  { name: "GraduationCap", label: "Graduation Cap (Study Material)", component: GraduationCap },
  { name: "Wrench", label: "Wrench (Tools)", component: Wrench },
  { name: "Calendar", label: "Calendar (Dates / Age)", component: Calendar },
  { name: "Image", label: "Image (Photos / Resizer)", component: ImageIcon },
  { name: "Sparkles", label: "Sparkles (Premium / Special)", component: Sparkles },
  { name: "Globe", label: "Globe (Web / General)", component: Globe },
  { name: "Link", label: "Link (External / URL)", component: LinkIcon },
  { name: "Layers", label: "Layers (Categories / Syllabus)", component: Layers },
  { name: "Compass", label: "Compass (Explore)", component: Compass },
  { name: "Flame", label: "Flame (Trending / Hot)", component: Flame },
  { name: "Award", label: "Award (Results)", component: Award },
  { name: "Bookmark", label: "Bookmark (Saved)", component: Bookmark },
  { name: "Bell", label: "Bell (Updates / Alerts)", component: Bell },
  { name: "Folder", label: "Folder (Directory)", component: Folder },
  { name: "Send", label: "Telegram / Share", component: Send },
];

export function getNavIconComponent(iconName?: string) {
  if (!iconName) return LinkIcon;
  const match = AVAILABLE_NAV_ICONS.find(
    (i) => i.name.toLowerCase() === iconName.toLowerCase()
  );
  return match ? match.component : LinkIcon;
}

export default function NavigationIcon({
  name,
  className = "h-4 w-4",
}: {
  name?: string;
  className?: string;
}) {
  const IconComponent = getNavIconComponent(name);
  return <IconComponent className={className} />;
}
