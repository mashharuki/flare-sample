import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#0D0D10' }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Center radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(232,87,63,0.10) 0%, transparent 65%)',
          filter: 'blur(32px)',
        }}
      />
      {/* Bottom ambient light */}
      <div
        className="absolute bottom-0 left-1/2 pointer-events-none"
        style={{
          transform: 'translateX(-50%)',
          width: '400px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(232,87,63,0.06) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
