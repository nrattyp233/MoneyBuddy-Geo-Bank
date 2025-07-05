interface MoneyBuddyLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function MoneyBuddyLogo({ size = "md", className = "" }: MoneyBuddyLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img
        src="/images/money-buddy-mascot.png"
        alt="Money Buddy"
        className="w-full h-full object-contain rounded-full shadow-lg"
      />
    </div>
  )
}
