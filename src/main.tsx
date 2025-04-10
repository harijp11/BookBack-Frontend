import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { ToastProvider } from './hooks/ui/toast.tsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './leaflet-config.ts';
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
        <App />
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)