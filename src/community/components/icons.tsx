import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M2 12C3.9 8.4 7.5 6 12 6s8.1 2.4 10 6c-1.9 3.6-5.5 6-10 6S3.9 15.6 2 12Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 20s-7-4.5-9.2-8.8C1.2 8 2.8 4.5 6.4 4.2c2-.2 3.7.8 4.6 2.3.9-1.5 2.6-2.5 4.6-2.3 3.6.3 5.2 3.8 3.6 7-2.2 4.3-9.2 8.8-9.2 8.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3 22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

export function MessageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 5h16v10H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
