import { Box } from "lucide-react";

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon" aria-hidden="true">
        <Box size={18} />
      </span>
      <span>Block Master Kit</span>
    </div>
  );
}
