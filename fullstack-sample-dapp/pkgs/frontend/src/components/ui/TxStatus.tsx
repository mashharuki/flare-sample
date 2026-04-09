import { motion, AnimatePresence } from 'framer-motion'
import type { BaseError } from 'viem'

interface TxStatusProps {
  txHash?: `0x${string}`
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error: Error | null
}

export function TxStatus({ txHash, isPending, isConfirming, isSuccess, error }: TxStatusProps) {
  const show = isPending || isConfirming || isSuccess || !!error

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isPending && (
              <>
                <span style={{ color: '#fbbf24' }}>◉</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Waiting for wallet confirmation...
                </span>
              </>
            )}
            {isConfirming && txHash && (
              <>
                <span style={{ color: '#60a5fa', animation: 'pulse 1.5s infinite' }}>◉</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Confirming...{' '}
                  <a
                    href={`https://coston2-explorer.flare.network/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60a5fa', textDecoration: 'underline' }}
                  >
                    {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </a>
                </span>
              </>
            )}
            {isSuccess && !isConfirming && (
              <>
                <span style={{ color: '#4ade80' }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Transaction confirmed!
                </span>
              </>
            )}
            {error && (
              <>
                <span style={{ color: '#f87171' }}>✗</span>
                <span style={{ color: '#f87171', wordBreak: 'break-word' }}>
                  {(error as BaseError).shortMessage ?? error.message}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
