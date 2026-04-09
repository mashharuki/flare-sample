import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      style={{
        maxWidth: '440px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: `
          0 32px 80px rgba(0,0,0,0.5),
          0 0 0 1px rgba(255,255,255,0.04) inset,
          0 1px 0 rgba(255,255,255,0.08) inset
        `,
      }}
    >
      {children}
    </motion.div>
  )
}
