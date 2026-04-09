export const COUNTER_ADDRESS = '0xfDFaDffE28d17935A48ffB1Ab3076dBc8CadE623' as `0x${string}`

export const COUNTER_ABI = [
  {
    name: 'getCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'increment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'incrementBy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'decrement',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'reset',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'Incremented',
    type: 'event',
    inputs: [{ name: 'newCount', type: 'uint256', indexed: false }],
  },
  {
    name: 'Decremented',
    type: 'event',
    inputs: [{ name: 'newCount', type: 'uint256', indexed: false }],
  },
  {
    name: 'Reset',
    type: 'event',
    inputs: [],
  },
] as const
