import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { coston2 } from './chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Flare Counter dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'placeholder-id',
  chains: [coston2],
  ssr: false,
})
