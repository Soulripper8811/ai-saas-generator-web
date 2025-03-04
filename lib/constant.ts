export const MAX_FREE_COUNT = 50;

import {
  ArrowRight,
  CodeIcon,
  ImageIcon,
  MessageSquare,
  MusicIcon,
  ScanEye,
  VideoIcon,
} from "lucide-react";
export const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Music Generation",
    icon: MusicIcon,
    href: "/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
  },
  {
    label: "Image Analysis",
    icon: ScanEye,
    href: "/imageanalysis",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
  },
  {
    label: "Code Generation",
    icon: CodeIcon,
    href: "/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },
];
