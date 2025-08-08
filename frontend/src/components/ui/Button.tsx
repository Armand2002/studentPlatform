import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant
	size?: Size
	loading?: boolean
}

const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
const variants: Record<Variant, string> = {
	primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-blue-400',
	secondary: 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500',
	outline: 'border border-gray-300 hover:bg-gray-50 text-gray-900',
	ghost: 'bg-transparent hover:bg-gray-100',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400'
}
const sizes: Record<Size, string> = {
	sm: 'h-8 px-3 text-sm',
	md: 'h-10 px-4 text-sm',
	lg: 'h-12 px-5 text-base'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
		return (
			<button ref={ref} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
				{loading && (
					<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
				)}
				{children}
			</button>
		)
	}
)
Button.displayName = 'Button'

export default Button
