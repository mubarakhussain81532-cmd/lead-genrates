import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChartNoAxesCombined,
  FileSpreadsheet,
  GraduationCap,
  Handshake,
  Headset,
  HeartPulse,
  Hotel,
  MailCheck,
  Megaphone,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

export const serviceIconNames = [
  "Building2",
  "ChartNoAxesCombined",
  "FileSpreadsheet",
  "GraduationCap",
  "Handshake",
  "Headset",
  "HeartPulse",
  "Hotel",
  "MailCheck",
  "Megaphone",
  "Network",
  "SearchCheck",
  "ShieldCheck",
  "Sparkles",
  "Target",
  "Workflow",
] as const;

const serviceIcons: Record<(typeof serviceIconNames)[number], LucideIcon> = {
  Building2,
  ChartNoAxesCombined,
  FileSpreadsheet,
  GraduationCap,
  Handshake,
  Headset,
  HeartPulse,
  Hotel,
  MailCheck,
  Megaphone,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
};

export function getServiceIcon(name: string): LucideIcon {
  return serviceIcons[name as keyof typeof serviceIcons] ?? Network;
}
