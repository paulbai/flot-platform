'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  accentColor?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--flot)] text-[var(--void)] hover:bg-[var(--flot-dim)] font-semibold',
  secondary:
    'bg-transparent border border-[var(--ash)] text-[var(--paper)] hover:border-[var(--cloud)] hover:text-white',
  ghost:
    'bg-transparent text-[var(--cloud)] hover:text-[var(--paper)] hover:bg-white/5',
  accent:
    'text-[var(--void)] font-semibold',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[var(--text-xs)]',
  md: 'px-6 py-3 text-[var(--text-sm)]',
  lg: 'px-8 py-4 text-[var(--text-md)]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', accentColor, className = '', style, children, ...props }, ref) => {
    const accentStyle = variant === 'accent' && accentColor
      ? { backgroundColor: accentColor, ...style }
      : style;

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-sm
          font-body tracking-wide uppercase
          transition-all duration-mid ease-out-expo
          disabled:opacity-40 disabled:cursor-not-allowed
          cursor-pointer
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        style={accentStyle}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
