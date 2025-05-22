import { UserAxiosInstance } from "@/APIs/user_axios";
import { AxiosError } from "axios";

export interface Response{
  success:boolean,
  message:string
}

export interface IPurseTransaction {
    tsId: string;                      
    type: 'credit' | 'debit';        
    amount: number;                
    status: 'pending' | 'completed' | 'failed';
    description?: string;            
    createdAt: Date;               
  }


  export interface PaymentIntentResponse extends Response {
    clientSecret: string;
    paymentIntentId: string;
    tsId: string;
  }

  export interface WebhookResponse extends Response {
    result: {
      status: string;
      paymentIntentId?: string;
      walletId?: string;
      amount?: number;
      tsId?: string;
    };
  }


export interface CombinedResponse extends Response{
    _id: string;                     
    userId: string;                  
    balance: number;                 
    transactions: IPurseTransaction[];
    hold_amount:number
    createdAt: Date;                 
    updatedAt: Date; 
}

export interface PurseResponse{
  purse:{
     _id: string;                     
    userId: string;                  
    balance: number;                 
    transactions: IPurseTransaction[];
    hold_amount:number
    createdAt: Date;                 
    updatedAt: Date; 
}
}
export const fetchPurseDetails = async ():Promise<PurseResponse | undefined> => {
  try {
    const response = await UserAxiosInstance.get(`/user/purse`);
    return response.data;
  } catch (error) {
      if(error instanceof AxiosError){
    console.error("Error fetching purse details:", error.response?.data || error.message);
      }
  }
};

export const createPaymentIntent = async (amount: number, currency: string): Promise<PaymentIntentResponse | undefined> => {
  try {
    const response = await UserAxiosInstance.post('/user/purse/payment-intent', {
      amount, // Amount in cents (e.g., 1000 = $10.00)
      currency,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error creating PaymentIntent:", error.response?.data || error.message);
    }
  }
};

export const testWebhook = async (event: string): Promise<WebhookResponse | undefined> => {
  try {
    const response = await UserAxiosInstance.post('/webhook', event, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature', // For testing only
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error testing webhook:", error.response?.data || error.message);
    }
  }
};