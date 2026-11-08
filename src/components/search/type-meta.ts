import { Briefcase, FileText, Gamepad2, Globe, Layers, type LucideIcon } from "lucide-react";
import type { SearchType } from "@/lib/search-core";

export const TYPE_META: Record<SearchType, { label: string; plural: string; icon: LucideIcon }> = {
  Blog: { label: "Blog post", plural: "Blog posts", icon: FileText },
  Service: { label: "Service", plural: "Services", icon: Layers },
  Page: { label: "Page", plural: "Pages", icon: Globe },
  Work: { label: "Client", plural: "Work", icon: Briefcase },
  Game: { label: "Game", plural: "Games", icon: Gamepad2 },
};
