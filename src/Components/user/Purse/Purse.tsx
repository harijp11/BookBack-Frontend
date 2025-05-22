"use client"

import { useState } from "react"
import { type IPurseTransaction } from "@/services/purse/purseService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Skeleton } from "@/Components/ui/skeleton"
import { format } from "date-fns"
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Wallet, Calendar, PlusCircle, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { usePurseQuery, useAddMoneyMutation, useConfirmPaymentMutation } from '@/hooks/user/purse/usePurseMutation'
import { PaymentResult } from "./paymentResult"

const stripePromise = loadStripe('pk_test_51RIAruRtuCub2T27DnxxEqDHZNN1Y9y3mKkkSGS6ppflKtMBH202fZBlkPdlJtnrhDNkXOn2I5lsRRckG4MAvYR600K0Oosioa')
 const Purse = () => {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  
 
  const { 
    data: purseData, 
    isLoading, 
    error: queryError 
  } = usePurseQuery()
  
  const addMoneyMutation = useAddMoneyMutation()
  
  const handleAddMoney = () => {
    setIsAddMoneyOpen(true)
  }

  if (isLoading) {
    return <PurseSkeleton />
  }

  if (queryError || !purseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-3xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium">Failed to load purse details</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {queryError instanceof Error ? queryError.message : "Please try again later"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure transactions is never undefined by defaulting to an empty array
  const transactions = purseData.transactions || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Purse</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Current Balance</CardTitle>
            <CardDescription>Your available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <div className="text-4xl font-bold"> ₹{purseData?.balance.toFixed(2) || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {purseData?.updatedAt ? format(new Date(purseData.updatedAt), "PPP") : "N/A"}
              </p>
              {purseData?.hold_amount > 0 && (
                <div className="mt-4 flex items-center text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="text-sm font-medium">
                    Hold Amount: ₹{purseData.hold_amount} (Balance cannot go below this)
                  </p>
                </div>
              )}
              <Button
                className="mt-4"
                onClick={handleAddMoney}
                variant="default"
                disabled={addMoneyMutation.isPending}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credit">Credits</TabsTrigger>
                <TabsTrigger value="debit">Debits</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TransactionList transactions={transactions} />
              </TabsContent>

              <TabsContent value="credit">
                <TransactionList transactions={transactions.filter((t:{type:"debit" | "credit"}) => t.type === "credit")} />
              </TabsContent>

              <TabsContent value="debit">
                <TransactionList transactions={transactions.filter((t:{type:"debit" | "credit"}) => t.type === "debit")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Money Modal */}
      <Elements stripe={stripePromise}>
        <AddMoneyModal
          isOpen={isAddMoneyOpen}
          onClose={() => {
            setIsAddMoneyOpen(false)
            setPaymentAmount("")
          }}
          amount={paymentAmount}
          setAmount={setPaymentAmount}
          isLoading={addMoneyMutation.isPending}
          error={addMoneyMutation.error instanceof Error ? addMoneyMutation.error.message : null}
        />
      </Elements>
    </div>
  )
}

function AddMoneyModal({
  isOpen,
  onClose,
  amount,
  setAmount,
  error,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  amount: string
  setAmount: (value: string) => void
  error: string | null
  isLoading: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [paymentError, setPaymentError] = useState<string | null>(null)
  
  const addMoneyMutation = useAddMoneyMutation()
  const confirmPaymentMutation = useConfirmPaymentMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) return
    
    try {
      setPaymentStatus("processing")
      setPaymentError(null)
      
      const amountInCents = Number(amount) * 100 // Convert to cents
      if (amountInCents <= 0) {
        throw new Error("Amount must be greater than zero")
      }

      // Step 1: Create payment intent
      const paymentIntent = await addMoneyMutation.mutateAsync({ 
        amount: amountInCents 
      })

      // Step 2: Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      await confirmPaymentMutation.mutateAsync({
        stripe,
        cardElement,
        clientSecret: paymentIntent.clientSecret
      })

      // Payment successful
      setPaymentStatus("success")
    } catch (err) {
      // Payment failed
      setPaymentStatus("error")
      setPaymentError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error(err)
    }
  }

  const handleDismiss = () => {
    if (paymentStatus === "success") {
      // Reset and close on success
      onClose()
      setAmount("")
      setPaymentStatus("idle")
    } else if (paymentStatus === "error") {
      // Just reset status on error so they can try again
      setPaymentStatus("idle")
    }
  }

  // Combined loading state
  const isProcessing = isLoading || addMoneyMutation.isPending || confirmPaymentMutation.isPending || paymentStatus === "processing"
  
  // Combined error state
  const combinedError = error || 
    paymentError ||
    (addMoneyMutation.error instanceof Error ? addMoneyMutation.error.message : null) ||
    (confirmPaymentMutation.error instanceof Error ? confirmPaymentMutation.error.message : null)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        setPaymentStatus("idle")
        setPaymentError(null)
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        {paymentStatus === "success" || paymentStatus === "error" ? (
          <PaymentResult 
            isSuccess={paymentStatus === "success"}
            amount={amount}
            errorMessage={combinedError ?? undefined}
            onDismiss={handleDismiss}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add Money to Purse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (Rupee)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="card">Card Details</Label>
                  <CardElement
                    id="card"
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#000',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                    // disabled={isProcessing}
                  />
                </div>
                {combinedError &&(
                  <p className="text-sm text-red-500">{combinedError}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing || !stripe || !elements}>
                  {isProcessing ? "Processing..." : "Add Money"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TransactionList({ transactions }: { transactions: IPurseTransaction[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 5
  
  // Sort transactions by creation date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })
  
  // Calculate pagination values
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage)
  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  
  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)))
  }
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {currentTransactions.map((transaction) => (
          <TransactionItem key={transaction?.tsId} transaction={transaction} />
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to display page numbers around current page
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionItem({ transaction }: { transaction: IPurseTransaction }) {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case "completed":
        return "Completed"
      case "pending":
        return "Pending"
      case "failed":
        return "Failed"
      default:
        return transaction.status
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="mr-4">
        {transaction.type === "credit" ? (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
            <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">
              {transaction.type === "credit" ? "Received" : "Sent"}
              {transaction.description && `: ${transaction.description}`}
            </p>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {transaction.createdAt ? format(new Date(transaction.createdAt), "PPp") : "Unknown date"}
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold ${transaction.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {transaction.type === "credit" ? "+" : "-"} ₹{transaction.amount.toFixed(2)}
            </p>
            <Badge variant="outline" className={`mt-1 ${getStatusColor()}`}>
              <span className="flex items-center">
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </span>
            </Badge>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">ID:</span> {transaction.tsId}
        </div>
      </div>
    </div>
  )
}

function PurseSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>

        <div className="lg:col-span-2">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default Purse