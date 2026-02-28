import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-drac-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-drac-cyan/20">
            <span className="text-3xl font-bold text-drac-cyan">D</span>
          </div>
          <h1 className="text-2xl font-bold text-drac-fg">DebriDAV</h1>
          <p className="mt-1 text-sm text-drac-comment">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-drac-current bg-drac-darker p-6">
          {error && (
            <div className="rounded-lg border border-drac-red/30 bg-drac-red/10 px-4 py-2.5 text-sm text-drac-red">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-drac-fg">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-drac-fg">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
