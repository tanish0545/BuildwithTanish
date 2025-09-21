export default function Card({ title, description, children, className = "", headerAction = null }) {
  return (
    <div className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}>
      {(title || description || headerAction) && (
        <div className="flex items-center justify-between p-6 pb-3">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
    </div>
  )
}
