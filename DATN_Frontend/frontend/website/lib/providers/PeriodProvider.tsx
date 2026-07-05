'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { IListPeriod, periodApi } from '../api/periodApi'

interface PeriodContextProps {
  periods: IListPeriod[]
  selectedPeriod: IListPeriod | undefined
  setSelectedPeriod: (period: IListPeriod | undefined) => void
  loading: boolean
  studentsTab: 'TTTN' | 'DATN'
  setStudentsTab: (tab: 'TTTN' | 'DATN') => void
  gradingTab: 'TTTN' | 'DATN'
  setGradingTab: (tab: 'TTTN' | 'DATN') => void
}

const PeriodContext = createContext<PeriodContextProps | undefined>(undefined)

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [periods, setPeriods] = useState<IListPeriod[]>([])
  const [selectedPeriod, setSelectedPeriodState] = useState<IListPeriod | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [studentsTab, setStudentsTab] = useState<'TTTN' | 'DATN'>('TTTN')
  const [gradingTab, setGradingTab] = useState<'TTTN' | 'DATN'>('TTTN')

  useEffect(() => {
    let mounted = true
    
    // Retrieve from localStorage on client mount (avoids hydration mismatch)
    const saved = localStorage.getItem('selected_period')
    const currentSaved: IListPeriod | undefined = saved ? JSON.parse(saved) : undefined
    if (currentSaved) {
      setSelectedPeriodState(currentSaved)
    }

    async function load() {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        if (path.startsWith('/login') || path.startsWith('/signup')) {
          if (mounted) setLoading(false)
          return
        }
      }
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

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    let lastEventId = '';
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      const url = `${backendUrl}/v1/realtime/stream` + (lastEventId ? `?last_event_id=${lastEventId}` : '');
      eventSource = new EventSource(url);

      eventSource.addEventListener('connected', (e: MessageEvent) => {
        try {
          const res = JSON.parse(e.data);
          console.log('Realtime SSE connected:', res);
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('notification', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          console.log('Realtime notification:', data);
          
          if (data.type === 'topic_proposed' || data.type === 'topic_updated' || data.type === 'topic_deleted') {
            window.dispatchEvent(new CustomEvent('realtime-topic-updated'));
          } else if (
            data.type === 'group_status_updated' ||
            data.type === 'student_registered_topic' ||
            data.type === 'student_cancelled_registration' ||
            data.type === 'group_member_joined'
          ) {
            window.dispatchEvent(new CustomEvent('realtime-group-updated'));
            window.dispatchEvent(new CustomEvent('realtime-topic-updated'));
          } else if (data.type === 'assignment_published') {
            window.dispatchEvent(new CustomEvent('realtime-assignment-published', { detail: data }));
          } else if (data.type === 'score_updated' || data.type === 'tttn_score_updated') {
            window.dispatchEvent(new CustomEvent('realtime-score-updated', { detail: data }));
          }
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('slot_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          console.log('Realtime slot/group updated:', data);
          
          if (data.type === 'topic_updated' || data.type === 'topic_deleted' || data.type === 'topic_proposed') {
            window.dispatchEvent(new CustomEvent('realtime-topic-updated'));
          }
          if (
            data.type?.startsWith('group_') || 
            data.type === 'student_registered_topic' || 
            data.type === 'student_cancelled_registration' || 
            data.type === 'group_member_joined' || 
            data.type === 'topic_updated' || 
            data.type === 'topic_deleted'
          ) {
            window.dispatchEvent(new CustomEvent('realtime-group-updated'));
            window.dispatchEvent(new CustomEvent('realtime-topic-updated'));
          }
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.onerror = () => {
        // Silently let EventSource handle native reconnects
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

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
    <PeriodContext.Provider value={{ periods, selectedPeriod, setSelectedPeriod, loading, studentsTab, setStudentsTab, gradingTab, setGradingTab }}>
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
