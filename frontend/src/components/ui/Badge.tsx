import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Variant = 'default' | 'success' | 'warning' | 'danger'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
	const variant = (props as any).variant || 'default'
	return (
		<span
			className={clsx(
				'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
				variant === 'default' && 'bg-gray-100 text-gray-800',
				variant === 'success' && 'bg-green-100 text-green-800',
				variant === 'warning' && 'bg-yellow-100 text-yellow-800',
				variant === 'danger' && 'bg-red-100 text-red-800',
				className
			)}
			{...props}
		/>
	)
}

export default Badge
