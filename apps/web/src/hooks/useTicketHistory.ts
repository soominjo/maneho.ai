import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import { TicketHistory } from '@repo/shared'

export function useTicketHistory(userId: string | undefined) {
  const [history, setHistory] = useState<TicketHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setHistory([])
      setLoading(false)
      return
    }

    const db = getDb()
    const q = query(
      collection(db, 'ticketHistory'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items: TicketHistory[] = []
        snapshot.forEach(doc => {
          const data = doc.data()
          items.push({
            id: doc.id,
            ...data,
            // Handle Firestore Timestamp to Date conversion
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          } as TicketHistory)
        })
        setHistory(items)
        setLoading(false)
      },
      err => {
        console.error('Error fetching ticket history:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const saveToHistory = async (record: Omit<TicketHistory, 'id' | 'createdAt'>) => {
    try {
      const db = getDb()
      // Firestore rejects `undefined` values — strip optional fields that weren't set
      const clean = Object.fromEntries(Object.entries(record).filter(([, v]) => v !== undefined))
      await addDoc(collection(db, 'ticketHistory'), {
        ...clean,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error saving ticket history:', err)
      throw err
    }
  }

  const deleteFromHistory = async (id: string) => {
    try {
      const db = getDb()
      await deleteDoc(doc(db, 'ticketHistory', id))
    } catch (err) {
      console.error('Error deleting ticket history:', err)
      throw err
    }
  }

  return { history, loading, error, saveToHistory, deleteFromHistory }
}
