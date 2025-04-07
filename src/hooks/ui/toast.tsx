
import { type ReactNode, createContext, useCallback, useContext, useState } from "react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  toast: (message: string, type: ToastType) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const { toast, dismiss } = context

  return {
    toast: (message: string, type: ToastType) => toast(message, type),
    success: (message: string) => toast(message, "success"),
    error: (message: string) => toast(message, "error"),
    info: (message: string) => toast(message, "info"),
    warning: (message: string) => toast(message, "warning"),
    dismiss,
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      dismiss(id)
    }, 3000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  const bgColor = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-white",
  }

  const iconMap = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  }

  return (
    <div
      className={`px-4 py-3 rounded-md shadow-lg flex items-center ${bgColor[type]} animate-in slide-in-from-right-5 duration-300`}
      role="alert"
    >
      <span className="mr-2 font-bold">{iconMap[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 focus:outline-none" aria-label="Close">
        ✕
      </button>
    </div>
  )
}

