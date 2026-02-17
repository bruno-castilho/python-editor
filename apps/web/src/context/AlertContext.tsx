'use client'
import { createContext, type ReactNode, useState } from 'react'

type Severity = 'error' | 'info' | 'success' | 'warning'

interface AlertContextType {
  severity: Severity
  message: string
  open: boolean
  error: (msg: string) => void
  info: (msg: string) => void
  success: (msg: string) => void
  warning: (msg: string) => void
  onClose: () => void
}

export const AlertContext = createContext({} as AlertContextType)

interface AlertContextProviderProps {
  children: ReactNode
}

export function AlertContextProvider({ children }: AlertContextProviderProps) {
  const [severity, setSeverity] = useState<Severity>('success')
  const [message, setMessage] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  function error(msg: string) {
    setSeverity('error')
    setMessage(msg)
    setOpen(true)
  }

  function info(msg: string) {
    setSeverity('info')
    setMessage(msg)
    setOpen(true)
  }

  function success(msg: string) {
    setSeverity('success')
    setMessage(msg)
    setOpen(true)
  }

  function warning(msg: string) {
    setSeverity('warning')
    setMessage(msg)
    setOpen(true)
  }

  function onClose() {
    setOpen(false)
  }

  return (
    <AlertContext.Provider
      value={{
        open,
        severity,
        message,
        error,
        info,
        warning,
        success,
        onClose,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}
