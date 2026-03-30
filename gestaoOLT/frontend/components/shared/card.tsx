'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border bg-card shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  )
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t px-6 py-4 flex gap-2 ${className}`}>
      {children}
    </div>
  )
}
