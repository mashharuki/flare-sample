import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { coston2 } from '../../config/chains'

export function Header() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, chainId: coston2.id })

  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #E8573F, #C04530)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 13H2L8 2Z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '-0.3px',
          }}
        >
          Flare{' '}
          <span style={{ color: '#E8573F' }}>Counter</span>
        </span>
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Coston2
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {address && balance && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#4ade80' }}
            />
            <span
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {parseFloat(formatEther(balance.value)).toFixed(4)}{' '}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>C2FLR</span>
            </span>
          </div>
        )}
        <ConnectButton />
      </div>
    </header>
  )
}
