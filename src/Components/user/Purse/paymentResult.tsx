// src/components/PaymentResult.tsx
import { XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"

interface PaymentResultProps {
  isSuccess: boolean
  amount?: string
  errorMessage?: string
  onDismiss: () => void
}

export function PaymentResult({ 
  isSuccess, 
  amount, 
  errorMessage, 
  onDismiss 
}: PaymentResultProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className={isSuccess ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}>
        <div className="flex justify-center">
          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
          )}
        </div>
        <CardTitle className="text-center mt-4">
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isSuccess ? (
          <div className="text-center">
            <p className="text-lg font-medium">
              ${amount} has been added to your purse.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your transaction was processed successfully and your balance has been updated.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-medium">
              Your payment could not be processed.
            </p>
            {errorMessage && (
              <p className="text-sm text-red-500 mt-2">
                Error: {errorMessage}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Please check your payment details and try again, or contact support if the issue persists.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button onClick={onDismiss}>
          {isSuccess ? "Continue" : "Try Again"}
        </Button>
      </CardFooter>
    </Card>
  )
}