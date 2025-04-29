// src/hooks/usePurseMutations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPurseDetails, createPaymentIntent } from "@/services/purse/purseService"

export const usePurseQuery = () => {
  return useQuery({
    queryKey: ['purseDetails'],
    queryFn: async () => {
      const data = await fetchPurseDetails()
      return data?.purse
    }
  })
}

export const useAddMoneyMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const paymentIntent = await createPaymentIntent(amount, 'usd')
      if (!paymentIntent) {
        throw new Error("Failed to create PaymentIntent")
      }
      return paymentIntent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purseDetails'] })
    }
  })
}

export const useConfirmPaymentMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      stripe, 
      cardElement, 
      clientSecret 
    }: { 
      stripe: any; 
      cardElement: any; 
      clientSecret: string 
    }) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      return paymentIntent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purseDetails'] })
    }
  })
}