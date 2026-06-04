import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

interface SortIconProps {
  order: false | "asc" | "desc";
}

export default function SortIcon({ order }: SortIconProps) {
  switch (order) {
    case false:
      return <ArrowDownUp size={14} className="#1F1F1F" />;
    case "asc":
      return <ArrowUp size={14} className="#1F1F1F" />;
    case "desc":
      return <ArrowDown size={14} className="#1F1F1F" />;
    default:
      return "";
  }
}
