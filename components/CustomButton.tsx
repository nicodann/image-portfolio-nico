import { ButtonHTMLAttributes } from "react";

export default function CustomButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-transparent border border-neutral-400 text-neutral-300 hover:bg-neutral-400 hover:text-black text-sm tracking-widest uppercase px-5 h-9 rounded-full transition-colors duration-200 ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
