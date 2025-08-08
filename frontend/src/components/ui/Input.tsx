import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean
}

const base = 'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400'

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={clsx(base, invalid ? 'border-red-500' : 'border-gray-300', className)}
			{...props}
		/>
	)
})
Input.displayName = 'Input'

export default Input
