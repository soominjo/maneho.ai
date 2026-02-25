import { createContext, useState, useEffect, ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth'
import { getAuthInstance, getDb, getGoogleProvider, getGithubProvider } from '../lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export interface User {
  uid: string
  email: string | null
  name: string | null
}

export interface DailyQuota {
  used: number
  limit: number
  date: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  quota: DailyQuota
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  incrementQuota: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  refreshUser: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [quota, setQuota] = useState<DailyQuota>({
    used: 0,
    limit: 20,
    date: new Date().toISOString().split('T')[0],
  })

  // Initialize auth state
  useEffect(() => {
    const auth = getAuthInstance()
    const db = getDb()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        })

        // Fetch quota from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const today = new Date().toISOString().split('T')[0]

          if (userData.dailyQuota?.date === today) {
            setQuota(userData.dailyQuota)
          } else {
            // Reset quota for new day
            const newQuota = { used: 0, limit: 20, date: today }
            setQuota(newQuota)
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              { dailyQuota: newQuota },
              { merge: true }
            )
          }
        }
      } else {
        setUser(null)
        setQuota({ used: 0, limit: 20, date: new Date().toISOString().split('T')[0] })
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const auth = getAuthInstance()
      const db = getDb()
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with name
      await updateProfile(result.user, { displayName: name })

      // Create Firestore user document
      const today = new Date().toISOString().split('T')[0]
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        dailyQuota: { used: 0, limit: 20, date: today },
        createdAt: new Date().toISOString(),
      })

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        name,
      })
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const auth = getAuthInstance()
      await signInWithEmailAndPassword(auth, email, password)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthUser = async (firebaseUser: FirebaseUser, provider: string) => {
    const db = getDb()
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)
    const today = new Date().toISOString().split('T')[0]

    if (!userDoc.exists()) {
      // New OAuth user - create Firestore document
      const newUserData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || null,
        authProvider: provider,
        dailyQuota: { used: 0, limit: 20, date: today },
        acceptedTermsAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      await setDoc(userDocRef, newUserData)
      setQuota({ used: 0, limit: 20, date: today })
    } else {
      // Existing user - fetch and reset quota if new day
      const userData = userDoc.data()
      if (userData.dailyQuota?.date === today) {
        setQuota(userData.dailyQuota)
      } else {
        const resetQuota = { used: 0, limit: 20, date: today }
        setQuota(resetQuota)
        await setDoc(userDocRef, { dailyQuota: resetQuota }, { merge: true })
      }
    }

    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
    })
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const auth = getAuthInstance()
      const provider = getGoogleProvider()
      const result = await signInWithPopup(auth, provider)
      await handleOAuthUser(result.user, 'google')
    } catch (error: unknown) {
      const errorMessages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
        'auth/account-exists-with-different-credential':
          'An account with this email already exists. Please use email/password or the original provider.',
        'auth/popup-blocked': 'Popup blocked. Please enable popups for this site.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
      }
      const message =
        (error instanceof Object && 'code' in error
          ? errorMessages[(error as Record<string, string>).code]
          : null) || 'Sign-in failed. Please try again.'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGithub = async () => {
    setLoading(true)
    try {
      const auth = getAuthInstance()
      const provider = getGithubProvider()
      const result = await signInWithPopup(auth, provider)
      await handleOAuthUser(result.user, 'github')
    } catch (error: unknown) {
      const errorMessages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
        'auth/account-exists-with-different-credential':
          'An account with this email already exists. Please use email/password or the original provider.',
        'auth/popup-blocked': 'Popup blocked. Please enable popups for this site.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
      }
      const message =
        (error instanceof Object && 'code' in error
          ? errorMessages[(error as Record<string, string>).code]
          : null) || 'Sign-in failed. Please try again.'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const auth = getAuthInstance()
      await firebaseSignOut(auth)
      setUser(null)
      setQuota({ used: 0, limit: 20, date: new Date().toISOString().split('T')[0] })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    const auth = getAuthInstance()
    await sendPasswordResetEmail(auth, email)
  }

  const incrementQuota = async () => {
    if (!user || quota.used >= quota.limit) return

    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    const newQuota: DailyQuota = { ...quota, used: quota.used + 1, date: today }
    setQuota(newQuota)

    await setDoc(doc(db, 'users', user.uid), { dailyQuota: newQuota }, { merge: true })
  }

  const refreshUser = () => {
    const auth = getAuthInstance()
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    quota,
    signUp,
    signIn,
    signOut,
    resetPassword,
    incrementQuota,
    signInWithGoogle,
    signInWithGithub,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
