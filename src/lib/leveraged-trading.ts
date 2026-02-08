export const LEVERAGED_TRADING_ABI = [
  {
    type: 'function',
    name: 'getPosition',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'symbol', type: 'string', internalType: 'string' },
    ],
    outputs: [
      { name: 'usdAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'entryPrice', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'openLong',
    inputs: [
      { name: 'symbol', type: 'string', internalType: 'string' },
      { name: 'usdAmount18', type: 'uint256', internalType: 'uint256' },
      { name: 'entryPrice18', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'closeLong',
    inputs: [
      { name: 'symbol', type: 'string', internalType: 'string' },
      { name: 'exitPrice18', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'symbolToId',
    inputs: [{ name: 'symbol', type: 'string', internalType: 'string' }],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'pure',
  },
] as const;

export const MOCK_USDC_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const;

export const LEVERAGED_TRADING_ADDRESS =
  (process.env.NEXT_PUBLIC_LEVERAGED_TRADING_ADDRESS as `0x${string}`) ||
  ('0x0000000000000000000000000000000000000000' as `0x${string}`);

export const MOCK_USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS as `0x${string}`) ||
  ('0x0000000000000000000000000000000000000000' as `0x${string}`);
