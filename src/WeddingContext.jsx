import { createContext, useContext, useMemo } from 'react'
import { getWedding } from './data/variants'

const WeddingContext = createContext(null)

export function WeddingProvider({ variantId, children }) {
  const value = useMemo(() => {
    const wedding = getWedding(variantId)
    return { wedding, variantId: wedding.id || variantId }
  }, [variantId])

  return (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  )
}

export function useWedding() {
  const ctx = useContext(WeddingContext)
  if (!ctx) {
    throw new Error('useWedding phải nằm trong WeddingProvider')
  }
  return ctx
}
