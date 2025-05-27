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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  const themeConfig = {
    success: {
      bg: "bg-white/10 backdrop-blur-xl border border-emerald-200/30 backdrop-brightness-125",
      textColor: "text-emerald-500 font-semibold",
      icon: "✓",
      iconColor: "text-emerald-600",
      closeColor: "text-emerald-500 hover:text-emerald-900",
      shadow: "shadow-emerald-100/50"
    },
    error: {
      bg: "bg-white/10 backdrop-blur-xl border border-red-200/30",
      textColor: "text-red-500 font-semibold",
      icon: "✕",
      iconColor: "text-red-600",
      closeColor: "text-red-500 hover:text-red-900",
      shadow: "shadow-red-100/50"
    },
    info: {
      bg: "bg-white/10 backdrop-blur-xl border border-blue-200/30",
      textColor: "text-blue-500 font-semibold",
      icon: "ℹ",
      iconColor: "text-blue-600",
      closeColor: "text-blue-500 hover:text-blue-900",
      shadow: "shadow-blue-100/50"
    },
    warning: {
      bg: "bg-white/10 backdrop-blur-xl border border-amber-200/30",
      textColor: "text-amber-500 font-semibold",
      icon: "⚠",
      iconColor: "text-amber-600",
      closeColor: "text-amber-500 hover:text-amber-900",
      shadow: "shadow-amber-100/50"
    },
  }

  const config = themeConfig[type]

  return (
    <div
      className={`
        ${config.bg} ${config.shadow}
        px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg 
        flex items-center
        animate-in slide-in-from-right-5 duration-500 ease-out
        hover:scale-[1.02] transition-all duration-200
        min-h-[60px] max-w-full
        border-l-4 border-l-current
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3 sm:mr-4">
        <span className={`text-xl sm:text-2xl drop-shadow-sm font-bold ${config.iconColor}`}>
          {config.icon}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm sm:text-base leading-relaxed break-words ${config.textColor}`}>
          {message}
        </p>
      </div>
      
      <button 
        onClick={onClose} 
        className={`
          flex-shrink-0 ml-3 sm:ml-4 p-1.5 sm:p-2 rounded-full
          hover:bg-black/5 active:bg-black/10
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-current/20
          group
          ${config.closeColor}
        `} 
        aria-label="Close notification"
      >
        <span className="text-base sm:text-lg font-bold leading-none transition-colors duration-200">
          ✕
        </span>
      </button>
    </div>
  )
}