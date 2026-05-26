import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type AccordionSectionProps = {
  title: string;
  open: boolean;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  onToggle: () => void;
};

export function AccordionSection({ title, open, meta, actions, children, onToggle }: AccordionSectionProps) {
  return (
    <section className={`accordion-section ${open ? "open" : ""}`}>
      <div className="accordion-header">
        <button className="accordion-trigger" type="button" aria-expanded={open} onClick={onToggle}>
          <ChevronRight size={15} />
          <span>{title}</span>
        </button>
        {meta ? <span className="accordion-meta">{meta}</span> : null}
        {actions ? <div className="accordion-actions">{actions}</div> : null}
      </div>
      {open ? <div className="accordion-content">{children}</div> : null}
    </section>
  );
}
