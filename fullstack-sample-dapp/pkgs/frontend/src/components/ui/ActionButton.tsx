import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ActionButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: Variant
  fullWidth?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #E8573F, #C04530)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 16px rgba(232,87,63,0.3)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: 'rgba(252,165,165,0.9)',
    border: '1px solid rgba(239,68,68,0.25)',
    boxShadow: 'none',
  },
}

export function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
}: ActionButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { opacity: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 20px',
        borderRadius: '12px',
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontWeight: 500,
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s ease',
        outline: 'none',
      }}
    >
      {children}
    </motion.button>
  )
}
