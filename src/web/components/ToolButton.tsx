import { MousePointer2, Move, Scaling } from "lucide-react";
import type { ToolMode } from "../types";

type ToolButtonProps = {
  mode: ToolMode;
  activeTool: ToolMode;
  label: string;
  onToolChange: (mode: ToolMode) => void;
};

export function ToolButton({ mode, activeTool, label, onToolChange }: ToolButtonProps) {
  const Icon = mode === "select" ? MousePointer2 : mode === "move" ? Move : Scaling;
  return (
    <button
      className={`tool-button ${activeTool === mode ? "active" : ""}`}
      type="button"
      title={label}
      aria-label={label}
      onClick={() => onToolChange(mode)}
    >
      <Icon size={18} />
    </button>
  );
}
