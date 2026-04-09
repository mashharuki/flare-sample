import { motion, AnimatePresence } from 'framer-motion'
import { useCounter } from '../../hooks/useCounter'

export function CounterDisplay() {
  const { count } = useCounter()
  const displayValue = count !== undefined ? count.toString() : '—'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '40px 32px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          margin: 0,
        }}
      >
        Current Count
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={displayValue}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
            fontSize: 'clamp(72px, 14vw, 96px)',
            lineHeight: 1,
            color: 'white',
            textShadow: '0 0 48px rgba(232,87,63,0.45), 0 0 80px rgba(232,87,63,0.15)',
            letterSpacing: '-2px',
          }}
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: count !== undefined ? '#4ade80' : 'rgba(255,255,255,0.2)',
            boxShadow: count !== undefined ? '0 0 8px rgba(74,222,128,0.5)' : 'none',
          }}
        />
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          {count !== undefined ? 'Live on Coston2' : 'Loading...'}
        </span>
      </div>
    </div>
  )
}
