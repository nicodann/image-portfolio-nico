export default function SiteHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      // h-[230px]
      // lg:h-[112px]
      className={`
        py-8 
        overflow-hidden 
        ${className && className}
      `}
    >
      {children}
    </header>
  );
}
