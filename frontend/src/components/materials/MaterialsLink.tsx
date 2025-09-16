"use client"
import { FolderIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface MaterialsLinkProps {
  readonly variant?: 'header' | 'sidebar' | 'widget' | 'button'
  readonly className?: string
  readonly showIcon?: boolean
  readonly showText?: boolean
}

export default function MaterialsLink({ 
  variant = 'button', 
  className,
  showIcon = false,
  showText = true
}: MaterialsLinkProps) {
  const googleDriveUrl = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL || 'https://drive.google.com/drive/folders/1Sqs2GpEk8eVTjcvfQcA5rOxmxIujxNdI?usp=drive_link'
  const linkText = process.env.NEXT_PUBLIC_MATERIALS_LINK_TEXT || '📚 Materiali Didattici'

  const handleClick = () => {
    window.open(googleDriveUrl, '_blank', 'noopener,noreferrer')
  }

  const variantStyles = {
    header: "inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors font-medium",
    sidebar: "flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-primary hover:bg-background-secondary rounded-md transition-colors",
    widget: "flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg hover:from-primary/10 hover:to-primary/15 transition-all cursor-pointer",
    button: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
  }

  const iconSizes = {
    header: "h-4 w-4",
    sidebar: "h-5 w-5", 
    widget: "h-6 w-6",
    button: "h-4 w-4"
  }

  return (
    <button
      onClick={handleClick}
      className={cn(variantStyles[variant], className)}
      title="Apri materiali didattici in Google Drive"
    >
      <div className="flex items-center gap-2">
        {showIcon && <FolderIcon className={cn("text-primary", iconSizes[variant])} />}
        {showText && (
          <span className={variant === 'widget' ? 'text-foreground font-medium' : ''}>
            {linkText}
          </span>
        )}
      </div>
      
      {variant === 'widget' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">
            Google Drive
          </span>
        </div>
      )}
    </button>
  )
}
