import { createConfig } from '@privy-io/wagmi';
import { base, berachain, polygon, arbitrum, story, mantle } from 'viem/chains';
import { http } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [base, berachain, polygon, arbitrum, story, mantle],
  transports: {
    [base.id]: http(),
    [berachain.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [story.id]: http(),
    [mantle.id]: http(),
  },
});
