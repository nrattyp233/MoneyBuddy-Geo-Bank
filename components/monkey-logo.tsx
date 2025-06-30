interface MonkeyLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function MonkeyLogo({ size = "md", className = "" }: MonkeyLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Monkey face */}
        <circle cx="50" cy="50" r="35" fill="url(#monkeyGradient)" />

        {/* Ears */}
        <circle cx="25" cy="35" r="12" fill="url(#monkeyGradient)" />
        <circle cx="75" cy="35" r="12" fill="url(#monkeyGradient)" />
        <circle cx="25" cy="35" r="8" fill="#F59E0B" />
        <circle cx="75" cy="35" r="8" fill="#F59E0B" />

        {/* Eyes */}
        <circle cx="40" cy="45" r="6" fill="white" />
        <circle cx="60" cy="45" r="6" fill="white" />
        <circle cx="40" cy="45" r="3" fill="black" />
        <circle cx="60" cy="45" r="3" fill="black" />

        {/* Nose area */}
        <ellipse cx="50" cy="55" rx="8" ry="6" fill="#F59E0B" />

        {/* Nostrils */}
        <circle cx="47" cy="55" r="1.5" fill="black" />
        <circle cx="53" cy="55" r="1.5" fill="black" />

        {/* Mouth */}
        <path d="M 42 65 Q 50 70 58 65" stroke="black" strokeWidth="2" fill="none" />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="monkeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
