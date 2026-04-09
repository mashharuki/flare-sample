import { useReadContract, useWatchContractEvent } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { COUNTER_ABI, COUNTER_ADDRESS } from '../contracts/counter'

export function useCounter() {
  const queryClient = useQueryClient()

  const { data: count, queryKey } = useReadContract({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    functionName: 'getCount',
    query: {
      // Fallback polling: refetch every 3s in case events are missed
      refetchInterval: 3000,
    },
  })

  const { data: owner } = useReadContract({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    functionName: 'owner',
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey })

  // Event-driven updates: immediately refetch when any counter event is emitted
  useWatchContractEvent({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    eventName: 'Incremented',
    onLogs: invalidate,
    poll: true,
    pollingInterval: 1000,
  })

  useWatchContractEvent({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    eventName: 'Decremented',
    onLogs: invalidate,
    poll: true,
    pollingInterval: 1000,
  })

  useWatchContractEvent({
    abi: COUNTER_ABI,
    address: COUNTER_ADDRESS,
    eventName: 'Reset',
    onLogs: invalidate,
    poll: true,
    pollingInterval: 1000,
  })

  return { count, owner, queryKey }
}
