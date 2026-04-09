import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCounter } from '../../hooks/useCounter'
import { useCounterWrite } from '../../hooks/useCounterWrite'
import { ActionButton } from '../ui/ActionButton'
import { IncrementByInput } from './IncrementByInput'
import { TxStatus } from '../ui/TxStatus'

export function CounterControls() {
  const { address, isConnected } = useAccount()
  const { owner } = useCounter()
  const {
    increment,
    incrementBy,
    decrement,
    reset,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useCounterWrite()
  const [incrementByAmount, setIncrementByAmount] = useState('')

  const isOwner =
    address &&
    owner &&
    address.toLowerCase() === (owner as string).toLowerCase()

  const busy = isPending || isConfirming

  const handleIncrementBy = () => {
    const n = parseInt(incrementByAmount, 10)
    if (!isNaN(n) && n > 0) {
      incrementBy(BigInt(n))
      setIncrementByAmount('')
    }
  }

  return (
    <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Label */}
      <p
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          margin: 0,
        }}
      >
        Actions
      </p>

      {/* Primary actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <ActionButton
          onClick={increment}
          disabled={!isConnected || busy}
          variant="primary"
        >
          ＋ Increment
        </ActionButton>
        <ActionButton
          onClick={decrement}
          disabled={!isConnected || busy}
          variant="secondary"
        >
          − Decrement
        </ActionButton>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Increment by */}
      <div>
        <p
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            margin: '0 0 8px',
          }}
        >
          Increment by amount
        </p>
        <IncrementByInput
          value={incrementByAmount}
          onChange={setIncrementByAmount}
          onSubmit={handleIncrementBy}
          disabled={!isConnected || busy}
        />
      </div>

      {/* Owner-only reset */}
      {isOwner && (
        <>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <p
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'rgba(239,68,68,0.5)',
                margin: '0 0 8px',
              }}
            >
              Owner only
            </p>
            <ActionButton
              onClick={reset}
              disabled={busy}
              variant="danger"
            >
              Reset to Zero
            </ActionButton>
          </div>
        </>
      )}

      {/* Not connected message */}
      {!isConnected && (
        <p
          style={{
            textAlign: 'center',
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
          }}
        >
          Connect your wallet to interact
        </p>
      )}

      {/* Transaction status */}
      <TxStatus
        txHash={txHash}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
      />
    </div>
  )
}
