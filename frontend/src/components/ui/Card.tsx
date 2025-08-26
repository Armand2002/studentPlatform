import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'filled' | 'glass' | 'gradient'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: Variant
	spotlight?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className, variant = 'default', spotlight = false, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'rounded-xl transition-all duration-200',
					// Base variants
					variant === 'default' && 'border border-border bg-card shadow-card hover:shadow-lg',
					variant === 'outline' && 'border-2 border-primary/20 bg-transparent hover:border-primary/40',
					variant === 'filled' && 'border-transparent bg-muted hover:bg-muted/80',
					variant === 'glass' && 'glass border border-white/20 backdrop-blur-md hover:shadow-glass',
					variant === 'gradient' && 'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:from-primary/10 hover:to-secondary/10',
					// Spotlight effect
					spotlight && 'spotlight overflow-hidden',
					className
				)}
				{...props}
			/>
		)
	}
)
Card.displayName = 'Card'

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex flex-col space-y-2 p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
	return <h3 className={cn('text-xl font-semibold leading-tight tracking-tight text-foreground', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('text-sm text-muted-foreground leading-relaxed', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

export default Card
