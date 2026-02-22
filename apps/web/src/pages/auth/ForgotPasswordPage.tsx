import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true)
    try {
      await resetPassword(data.email)
      setSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm text-foreground">
                  Password reset link has been sent to your email. Check your inbox and follow the
                  instructions.
                </p>
              </div>
              <Link to="/login" className="text-primary font-medium hover:underline inline-block">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
