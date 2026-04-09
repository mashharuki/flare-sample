import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './config/wagmi'
import { AppShell } from './components/layout/AppShell'
import { Header } from './components/layout/Header'
import { GlassCard } from './components/ui/GlassCard'
import { CounterDisplay } from './components/counter/CounterDisplay'
import { CounterControls } from './components/counter/CounterControls'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#E8573F',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          <AppShell>
            <Header />
            <main
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 65px)',
                padding: '48px 16px',
                gap: '24px',
              }}
            >
              {/* Eyebrow */}
              <div
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(232,87,63,0.8)',
                  background: 'rgba(232,87,63,0.08)',
                  border: '1px solid rgba(232,87,63,0.2)',
                  padding: '5px 14px',
                  borderRadius: '100px',
                }}
              >
                Flare Network · Coston2 Testnet
              </div>

              <GlassCard>
                <CounterDisplay />
                <CounterControls />
              </GlassCard>

              {/* Footer info */}
              <p
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  margin: 0,
                  letterSpacing: '0.05em',
                }}
              >
                Contract:{' '}
                <a
                  href="https://coston2-explorer.flare.network/address/0xfDFaDffE28d17935A48ffB1Ab3076dBc8CadE623"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}
                >
                  0xfDFa...E623
                </a>
              </p>
            </main>
          </AppShell>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
