import { HTMLAttributes } from "react";

export default function GlassTable({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl backdrop-blur-xl bg-white/5 border border-white/20">
      <table className={`w-full border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function GlassTableHead({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-white/5" {...props}>
      {children}
    </thead>
  );
}

export function GlassTableBody({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody {...props}>
      {children}
    </tbody>
  );
}

export function GlassTableRow({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-white/10 transition-all duration-200 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}
