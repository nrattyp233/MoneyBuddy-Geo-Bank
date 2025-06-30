"use client"

import type React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface MoneyBuddyLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export function MoneyBuddyLogo({ size = 64, className, ...props }: MoneyBuddyLogoProps) {
  return (
    <div
      {...props}
      style={{ width: size, height: size }}
      className={cn("relative rounded-full overflow-hidden shadow-lg", className)}
    >
      <Image
        src="/images/money-buddy-mascot.png"
        alt="Money Buddy mascot"
        fill
        sizes={`${size}px`}
        priority
        className="object-cover"
      />
    </div>
  )
}
