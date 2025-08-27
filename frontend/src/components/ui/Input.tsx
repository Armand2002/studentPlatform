import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean
}

const base = 'block w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors'

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={cn(
				base, 
				invalid ? 'border-red-500 focus:ring-red-500' : 'border-border', 
				className
			)}
			{...props}
		/>
	)
})
Input.displayName = 'Input'

export default Input
