import { PrivyClientConfig } from '@privy-io/react-auth'
import {base, berachain, polygon, arbitrum, story, mantle, monadTestnet} from 'viem/chains';


export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#676FFF',
    logo: '/next.svg', // Using your existing logo
  },
  loginMethods: ['wallet'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  defaultChain: monadTestnet,
  supportedChains: [base, berachain, polygon, arbitrum, story, mantle,monadTestnet]

}