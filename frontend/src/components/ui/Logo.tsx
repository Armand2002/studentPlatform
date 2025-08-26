import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export default function Logo({ 
  className, 
  size = 'md',
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl', 
    lg: 'text-3xl'
  };

  const variantClasses = {
    default: 'text-foreground',
    white: 'text-white'
  };

  return (
    <Link 
      href="/" 
      className={cn(
        'inline-flex items-center font-bold transition-colors hover:opacity-80',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Tutoring Platform"
    >
      <div className="flex items-center space-x-2">
        {/* Icon/Logo */}
        <div className={cn(
          'rounded-lg bg-gradient-to-br from-primary-500 to-secondary flex items-center justify-center text-white font-bold',
          size === 'sm' && 'w-8 h-8 text-sm',
          size === 'md' && 'w-10 h-10 text-lg',
          size === 'lg' && 'w-12 h-12 text-xl'
        )}>
          T
        </div>
        
        {/* Text */}
        <span>
          Tutoring<span className="text-secondary">Pro</span>
        </span>
      </div>
    </Link>
  );
}
