'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { IListPeriod, periodApi } from '../api/periodApi'

interface PeriodContextProps {
  periods: IListPeriod[]
  selectedPeriod: IListPeriod | undefined
  setSelectedPeriod: (period: IListPeriod | undefined) => void
  loading: boolean
}

const PeriodContext = createContext<PeriodContextProps | undefined>(undefined)

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [periods, setPeriods] = useState<IListPeriod[]>([])
  const [selectedPeriod, setSelectedPeriodState] = useState<IListPeriod | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Retrieve from localStorage on client mount (avoids hydration mismatch)
    const saved = localStorage.getItem('selected_period')
    const currentSaved: IListPeriod | undefined = saved ? JSON.parse(saved) : undefined
    if (currentSaved) {
      setSelectedPeriodState(currentSaved)
    }

    async function load() {
      try {
        const data = await periodApi.getListPeriod()
        if (!mounted) return
        const rows = data?.rows ?? []
        setPeriods(rows)

        // If no period selected, choose the first open/published one, or just the first one
        if (!currentSaved && rows.length > 0) {
          const defaultPeriod = rows.find((p) => p.status === 'open' || p.status === 'published') || rows[0]
          setSelectedPeriodState(defaultPeriod)
          localStorage.setItem('selected_period', JSON.stringify(defaultPeriod))
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('periodChanged'))
        } else if (currentSaved) {
          // Sync state with localstorage just in case
          const current = rows.find((p) => p.id === currentSaved.id) || currentSaved
          setSelectedPeriodState(current)
        }
      } catch (err) {
        console.error('Failed to load periods:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const setSelectedPeriod = (period: IListPeriod | undefined) => {
    setSelectedPeriodState(period)
    if (period) {
      localStorage.setItem('selected_period', JSON.stringify(period))
    } else {
      localStorage.removeItem('selected_period')
    }
    // Dispatch custom event to notify components that are listening
    window.dispatchEvent(new Event('periodChanged'))
  }

  return (
    <PeriodContext.Provider value={{ periods, selectedPeriod, setSelectedPeriod, loading }}>
      {children}
    </PeriodContext.Provider>
  )
}

export const usePeriod = () => {
  const context = useContext(PeriodContext)
  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider')
  }
  return context
}
