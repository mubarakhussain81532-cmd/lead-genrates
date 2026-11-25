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

export type ServiceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconName: string;
  slug: string;
};

export const services: ServiceItem[] = [
  {
    title: "B2B Marketing Database",
    description:
      "Reach the right organizations with structured company and decision-maker information.",
    icon: Network,
    iconName: "Network",
    slug: "b2b-marketing-database",
  },
  {
    title: "Lead Generation",
    description:
      "Build focused prospect lists around your market, ideal customer, and campaign goals.",
    icon: Target,
    iconName: "Target",
    slug: "lead-generation",
  },
  {
    title: "Data Conversion",
    description:
      "Turn documents and legacy files into organized, usable digital records.",
    icon: FileSpreadsheet,
    iconName: "FileSpreadsheet",
    slug: "data-conversion",
  },
  {
    title: "Data Enhancement",
    description:
      "Refresh existing business records with careful checks and consistent formatting.",
    icon: Sparkles,
    iconName: "Sparkles",
    slug: "data-enhancement",
  },
  {
    title: "Back Office Support",
    description:
      "Add dependable operational capacity to repeatable, detail-oriented workflows.",
    icon: Headset,
    iconName: "Headset",
    slug: "back-office-support",
  },
  {
    title: "Sales Process Support",
    description:
      "Keep prospecting, qualification, and sales administration moving smoothly.",
    icon: ChartNoAxesCombined,
    iconName: "ChartNoAxesCombined",
    slug: "sales-process-support",
  },
  {
    title: "Inbound & Outbound Campaigns",
    description:
      "Support consistent customer conversations across inbound and outbound programs.",
    icon: Megaphone,
    iconName: "Megaphone",
    slug: "campaign-support",
  },
];

export type DatabaseProduct = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
};

export const databaseProducts: DatabaseProduct[] = [
  {
    title: "CEO & MD Database",
    eyebrow: "Leadership",
    description:
      "Company-level leadership records organized for relevant B2B outreach.",
    icon: Building2,
    tags: ["Company profile", "Leadership contacts", "India-wide"],
  },
  {
    title: "MSME Database",
    eyebrow: "Business directory",
    description:
      "A practical view of small and medium businesses for focused market research.",
    icon: Network,
    tags: ["Industry filters", "Location filters", "Structured records"],
  },
  {
    title: "HNI Database",
    eyebrow: "Audience research",
    description:
      "Consent-aware audience segments for premium campaigns, scoped to your brief.",
    icon: Sparkles,
    tags: ["Brief-led", "Privacy-aware", "Custom scope"],
  },
  {
    title: "School Database",
    eyebrow: "Education",
    description:
      "School and education-institution information for relevant B2B programs.",
    icon: GraduationCap,
    tags: ["Institution details", "Region filters", "Decision roles"],
  },
  {
    title: "Hospital Database",
    eyebrow: "Healthcare",
    description:
      "Healthcare organization records to support research and business outreach.",
    icon: HeartPulse,
    tags: ["Organization-level", "Specialty filters", "Structured records"],
  },
  {
    title: "Hotel Database",
    eyebrow: "Hospitality",
    description:
      "Hospitality business information organized by property type and location.",
    icon: Hotel,
    tags: ["Property details", "Location filters", "Business contacts"],
  },
  {
    title: "Manufacturing Database",
    eyebrow: "Industrial",
    description:
      "Manufacturing company records tailored to your product and target market.",
    icon: Workflow,
    tags: ["Industry filters", "Company details", "Custom research"],
  },
];

export const industries = [
  { title: "Technology", icon: Network },
  { title: "Healthcare", icon: HeartPulse },
  { title: "Education", icon: GraduationCap },
  { title: "Manufacturing", icon: Workflow },
  { title: "Hospitality", icon: Hotel },
  { title: "Professional Services", icon: Handshake },
];

export const processSteps = [
  {
    number: "01",
    title: "Define the audience",
    description:
      "We align on your ideal organizations, roles, geography, and intended use.",
    icon: Target,
  },
  {
    number: "02",
    title: "Research the market",
    description:
      "A focused research plan is prepared around the criteria in your brief.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Structure the records",
    description:
      "Information is organized into a clear, practical format for your team.",
    icon: FileSpreadsheet,
  },
  {
    number: "04",
    title: "Review for quality",
    description:
      "Records are checked for consistency, completeness, and agreed fields.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Deliver and support",
    description:
      "Your data is delivered in a usable format, with support for follow-up.",
    icon: MailCheck,
  },
];

export const faqs = [
  {
    question: "Can a database be tailored to a specific industry or region?",
    answer:
      "Yes. Share the industries, locations, organization types, and roles you have in mind. We scope research to the requirements and intended use you provide.",
  },
  {
    question: "How is information prepared before delivery?",
    answer:
      "The agreed fields are researched, structured, and reviewed for consistency and completeness. The scope and verification approach are confirmed before work begins.",
  },
  {
    question: "What file formats are available?",
    answer:
      "Records can be prepared in practical spreadsheet formats for review and import. If your team has a specific CRM template, include it in your brief.",
  },
  {
    question: "How do I request a sample or quote?",
    answer:
      "Use the contact page to describe your audience, geography, and preferred fields. The team can then confirm what is feasible and provide the next steps.",
  },
  {
    question: "Can you help clean an existing database?",
    answer:
      "Yes. Data conversion and enhancement work can be scoped around the files you have and the cleanup or formatting your team needs.",
  },
];

export const companyStats = [
  { value: "07", label: "focused service lines" },
  { value: "05", label: "quality-led delivery steps" },
  { value: "Pan-India", label: "research coverage" },
  { value: "1:1", label: "requirement-first planning" },
];

export const testimonials = [
  {
    quote:
      "A clear brief and a well-structured list make it much easier for a sales team to focus its outreach.",
    name: "Illustrative client perspective",
    role: "Sales operations",
  },
  {
    quote:
      "Getting information in a consistent format helps our team spend less time preparing files and more time acting on them.",
    name: "Illustrative client perspective",
    role: "Marketing team",
  },
  {
    quote:
      "The best research starts with listening carefully to who you need to reach and why.",
    name: "Illustrative client perspective",
    role: "Business development",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Databases", href: "/databases" },
  { label: "Contact Us", href: "/contact" },
];
