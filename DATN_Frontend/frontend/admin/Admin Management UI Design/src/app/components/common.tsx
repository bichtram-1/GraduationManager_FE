import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReactNode } from "react";

export type StatusType = "success" | "warning" | "danger" | "disabled" | "info";

export function Badge({ type = "info", children }: { type?: StatusType; children: ReactNode }) {
  const map: Record<StatusType, string> = {
    success: "bg-green-100 text-[#4CAF50] border-green-200",
    warning: "bg-orange-100 text-[#FFC107] border-orange-200",
    danger: "bg-red-100 text-[#F44336] border-red-200",
    disabled: "bg-gray-100 text-[#9E9E9E] border-gray-200",
    info: "bg-blue-100 text-[#2196F3] border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${map[type]}`}>
      {children}
    </span>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <div className="text-[15px]">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            placeholder="Tìm kiếm..."
            className="pl-9 pr-3 py-2 w-72 rounded-md border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-[#2196F3]"
          />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="text-xl">{title}</div>
        {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>{children}</div>
  );
}

export function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-[#2196F3] text-white hover:bg-blue-600",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-[#F44336] text-white hover:bg-red-600",
    success: "bg-[#4CAF50] text-white hover:bg-green-600",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function TableToolbar({ placeholder = "Tìm kiếm...", children }: { placeholder?: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder={placeholder}
          className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
        />
      </div>
      {children}
    </div>
  );
}

export function Pagination({ page = 1, total = 1 }: { page?: number; total?: number }) {
  return (
    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
      <div>Hiển thị 1-20 / tổng {total * 20} bản ghi</div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40" disabled={page === 1}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(total, 5) }).map((_, i) => (
          <button
            key={i}
            className={`min-w-8 h-8 px-2 rounded ${
              i + 1 === page ? "bg-[#2196F3] text-white" : "hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button className="p-1.5 rounded hover:bg-gray-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="text-base font-medium">{title}</div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1.5 text-gray-700">
        {label} {required && <span className="text-[#F44336]">*</span>}
      </label>
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 rounded-md border border-gray-300 text-sm outline-none focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]/30";
