export function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-2 font-mono text-xs tracking-widest text-primary uppercase ${className}`}>{children}</div>;
}
