import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { COUNTER_ABI, COUNTER_ADDRESS } from '../contracts/counter'
import { useCounter } from './useCounter'

export function useCounterWrite() {
  const queryClient = useQueryClient()
  const { queryKey } = useCounter()
  const { writeContract, data: txHash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  })

  // Immediately refetch count as soon as tx is confirmed on-chain
  useEffect(() => {
    if (isSuccess) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }, [isSuccess, queryClient, queryKey])

  const increment = () =>
    writeContract({
      abi: COUNTER_ABI,
      address: COUNTER_ADDRESS,
      functionName: 'increment',
    })

  const incrementBy = (amount: bigint) =>
    writeContract({
      abi: COUNTER_ABI,
      address: COUNTER_ADDRESS,
      functionName: 'incrementBy',
      args: [amount],
    })

  const decrement = () =>
    writeContract({
      abi: COUNTER_ABI,
      address: COUNTER_ADDRESS,
      functionName: 'decrement',
    })

  const reset = () =>
    writeContract({
      abi: COUNTER_ABI,
      address: COUNTER_ADDRESS,
      functionName: 'reset',
    })

  return {
    increment,
    incrementBy,
    decrement,
    reset,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
