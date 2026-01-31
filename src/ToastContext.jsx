import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const ToastCtx = createContext({ push: (msg, opts) => {}, dismiss: (id) => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const idRef = useRef(1)

  const push = useCallback((message, opts = {}) => {
    if (!message) return null
    const id = idRef.current++
    const toast = {
      id,
      message,
      type: opts.type || 'info',
      ms: typeof opts.ms === 'number' ? opts.ms : 4000
    }
    setToasts((s) => [toast, ...s])
    const t = setTimeout(() => {
      setToasts((s) => s.filter((it) => it.id !== id))
      timers.current.delete(id)
    }, toast.ms)
    timers.current.set(id, t)
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((s) => s.filter((it) => it.id !== id))
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
  }, [])

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
    }
  }, [])

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

function ToastItem({ toast, onDismiss }) {
  const color = toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
  return (
    <div className={`rounded shadow-lg text-white px-4 py-2 mb-2 flex items-start justify-between max-w-sm ${color}`} role="status">
      <div className="flex-1 text-sm pr-3">{toast.message}</div>
      <button aria-label="dismiss" onClick={() => onDismiss(toast.id)} className="ml-2 opacity-80">✕</button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="fixed left-6 bottom-6 z-50 flex flex-col items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastProvider
