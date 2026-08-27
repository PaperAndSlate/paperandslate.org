import type { ReactNode } from "react";
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
    </header>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}

export function Stack({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stack ${className}`.trim()}>{children}</div>;
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="info-card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
