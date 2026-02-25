import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { User, Mail, Phone, MapPin, Lock, Save, X, Shield, Zap, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'
import { LayoutWrapper } from '../components/LayoutWrapper'
import { useAuth } from '../hooks/useAuth'
import { getAuthInstance, getDb } from '../lib/firebase'
import { toast } from 'sonner'

interface ExtendedProfile {
  phone: string
  address: string
  createdAt: string
  authProvider: string
}

function Field({
  icon,
  label,
  value,
  isEditing,
  children,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  isEditing: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      {isEditing ? (
        children
      ) : (
        <p className="text-sm text-foreground pl-5">
          {value || <span className="italic text-muted-foreground">Not set</span>}
        </p>
      )}
    </div>
  )
}

export function ProfilePage() {
  const { user, quota, refreshUser } = useAuth()
  const [profile, setProfile] = useState<ExtendedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const db = getDb()
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const data = snap.data()
          const ext: ExtendedProfile = {
            phone: data.phone || '',
            address: data.address || '',
            createdAt: data.createdAt || '',
            authProvider: data.authProvider || 'email',
          }
          setProfile(ext)
          setName(user.name || '')
          setPhone(ext.phone)
          setAddress(ext.address)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (iso: string) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    } catch {
      return ''
    }
  }

  const handleSave = async () => {
    if (!user) return
    if (!name.trim()) {
      toast.error('Full name is required')
      return
    }
    setSaving(true)
    try {
      const db = getDb()
      await setDoc(
        doc(db, 'users', user.uid),
        { name: name.trim(), phone: phone.trim(), address: address.trim() },
        { merge: true }
      )
      const auth = getAuthInstance()
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() })
      }
      // Update local profile state
      setProfile(prev => (prev ? { ...prev } : prev))
      refreshUser()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user?.name || '')
    setPhone(profile?.phone || '')
    setAddress(profile?.address || '')
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    try {
      const auth = getAuthInstance()
      const firebaseUser = auth.currentUser
      if (!firebaseUser?.email) throw new Error('Not authenticated')
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)
      await updatePassword(firebaseUser, newPassword)
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect')
      } else {
        toast.error('Failed to change password')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const isEmailProvider = !profile?.authProvider || profile.authProvider === 'email'

  if (loading) {
    return (
      <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-2xl space-y-4">
          <div className="h-7 w-44 bg-muted rounded-md animate-pulse" />
          <div className="h-28 bg-muted rounded-md animate-pulse" />
          <div className="h-64 bg-muted rounded-md animate-pulse" />
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper className="py-6 sm:py-8 lg:py-10">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>

        {/* ── Profile Header ── */}
        <Card className="shadow-none border border-border">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              {/* Avatar with initials */}
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{getInitials()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                {profile?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Member since {formatDate(profile.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Personal Information ── */}
        <Card className="shadow-none border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Personal Information</CardTitle>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <Field
              icon={<User className="w-3.5 h-3.5" />}
              label="Full Name"
              value={user?.name}
              isEditing={isEditing}
            >
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </Field>

            {/* Email (read-only) */}
            <Field
              icon={<Mail className="w-3.5 h-3.5" />}
              label="Email Address"
              value={user?.email}
              isEditing={false}
            >
              {null}
            </Field>
            {isEditing && (
              <p className="-mt-2 text-xs text-muted-foreground pl-5">
                Email address cannot be changed here.
              </p>
            )}

            {/* Phone */}
            <Field
              icon={<Phone className="w-3.5 h-3.5" />}
              label="Phone Number"
              value={profile?.phone}
              isEditing={isEditing}
            >
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </Field>

            {/* Address */}
            <Field
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Address"
              value={profile?.address}
              isEditing={isEditing}
            >
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Your address"
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
              />
            </Field>

            {/* Save / Cancel */}
            {isEditing && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Security (email/password users only) ── */}
        {isEmailProvider && (
          <Card className="shadow-none border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Security
                </CardTitle>
                {!showPasswordForm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                    className="gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Change Password
                  </Button>
                )}
              </div>
            </CardHeader>

            {showPasswordForm && (
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {changingPassword ? 'Saving...' : 'Update Password'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* ── Usage Stats ── */}
        <Card className="shadow-none border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Credits Today</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {quota.used} / {quota.limit}
                </span>
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      quota.used / quota.limit >= 0.8 ? 'bg-amber-500' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            {profile?.authProvider && profile.authProvider !== 'email' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sign-in Method</span>
                <span className="text-sm font-medium text-foreground capitalize">
                  {profile.authProvider}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits Reset</span>
              <span className="text-sm text-muted-foreground">Daily at midnight</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
