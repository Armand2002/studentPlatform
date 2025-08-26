import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant
	size?: Size
	loading?: boolean
	spotlight?: boolean
}

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'

const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-md hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    gradient: 'bg-gradient-to-r from-primary-500 to-secondary text-white hover:from-primary-600 hover:to-secondary/90 focus:ring-primary shadow-lg hover:shadow-xl'
}

const sizes: Record<Size, string> = {
	sm: 'h-9 px-4 text-sm',
	md: 'h-11 px-6 text-base',
	lg: 'h-13 px-8 text-lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', loading = false, spotlight = false, children, ...props }, ref) => {
		return (
			<button 
				ref={ref} 
				className={cn(
					base, 
					variants[variant], 
					sizes[size],
					spotlight && 'spotlight',
					className
				)} 
				{...props}
			>
				{/* Spotlight effect */}
				{spotlight && (
					<div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
					</div>
				)}
				
				{/* Loading spinner */}
				{loading && (
					<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
				)}
				
				{/* Content */}
				<span className="relative z-10">{children}</span>
			</button>
		)
	}
)
Button.displayName = 'Button'

export default Button
