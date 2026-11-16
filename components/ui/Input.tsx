import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-gold/60 focus:bg-white/[0.07]";

export interface FieldProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={cn(fieldClasses, error && "border-burgundy/60", className)} {...props} />
      {error && <span className="text-xs text-burgundy">{error}</span>}
    </div>
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <textarea ref={ref} id={id} className={cn(fieldClasses, "min-h-28 resize-y", error && "border-burgundy/60", className)} {...props} />
      {error && <span className="text-xs text-burgundy">{error}</span>}
    </div>
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <select ref={ref} id={id} className={cn(fieldClasses, "cursor-pointer", className)} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-burgundy">{error}</span>}
    </div>
  ),
);
Select.displayName = "Select";
