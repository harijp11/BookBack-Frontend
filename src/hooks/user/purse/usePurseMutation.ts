// src/hooks/usePurseMutations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPurseDetails, createPaymentIntent } from "@/services/purse/purseService"
import { Stripe, StripeCardElement } from '@stripe/stripe-js'

export const usePurseQuery = () => {
  return useQuery({
    queryKey: ['purseDetails'],
    queryFn: async () => {
      const data = await fetchPurseDetails()
      console.log('fetchPurseDetails response:', JSON.stringify(data, null, 2))
      return data?.purse
    },
  })
}

export const useAddMoneyMutation = () => {
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      console.log('Creating payment intent with amount:', amount, 'currency: inr')
      const paymentIntent = await createPaymentIntent(amount, 'inr')
      if (!paymentIntent) {
        throw new Error("Failed to create PaymentIntent")
      }
      console.log('PaymentIntent created:', JSON.stringify(paymentIntent, null, 2))
      return paymentIntent
    },
    onError: (error) => {
      console.error('useAddMoneyMutation error:', error)
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
      stripe: Stripe; 
      cardElement: StripeCardElement; 
      clientSecret: string 
    }) => {
      console.log('Confirming payment with clientSecret:', clientSecret)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })
      
      if (error) {
        console.error('Stripe confirmCardPayment error:', error)
        throw new Error(error.message)
      }
      console.log('Payment confirmed:', JSON.stringify(paymentIntent, null, 2))
      return paymentIntent
    },
    onSuccess: () => {
      console.log('Invalidating purseDetails after successful payment confirmation')
      queryClient.invalidateQueries({ queryKey: ['purseDetails'] })
    },
    onError: (error) => {
      console.error('useConfirmPaymentMutation error:', error)
    }
  })
}