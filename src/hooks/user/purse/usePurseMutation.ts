// src/hooks/usePurseMutations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPurseDetails, createPaymentIntent } from "@/services/purse/purseService"
import { Stripe, StripeCardElement } from '@stripe/stripe-js'

export const usePurseQuery = () => {
  return useQuery({
    queryKey: ['purseDetails'],
    queryFn: async () => {
      const data = await fetchPurseDetails()
      console.log('fetchPurseDetails response:', data) // Add logging for debugging
      return data?.purse
    }
  })
}

export const useAddMoneyMutation = () => {
  
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const paymentIntent = await createPaymentIntent(amount, 'inr') // Changed to 'inr'
      if (!paymentIntent) {
        throw new Error("Failed to create PaymentIntent")
      }
      console.log('PaymentIntent created:', paymentIntent) // Add logging
      return paymentIntent
    }
    // Remove onSuccess invalidation to avoid premature refetch
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
      stripe: Stripe; 
      cardElement: StripeCardElement; 
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
      console.log('Payment confirmed:', paymentIntent) // Add logging
      return paymentIntent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purseDetails'] })
    }
  })
}