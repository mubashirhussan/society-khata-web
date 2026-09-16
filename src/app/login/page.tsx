'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Building2, Lock, Mail, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setCredentials, setUser } from '@/store/authSlice'
import { useLoginMutation, useRegisterMutation, useUploadTenantLogoMutation } from '@/features/authApi'
import { getApiError } from '@/lib/utils'
import { getHomeRoute } from '@/lib/permissions'
import { PasswordInput } from '@/components/FormInputs'
import ImagePicker from '@/components/ImagePicker'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { token, hydrated, user } = useSelector((s: RootState) => s.auth)
  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [register, { isLoading: registering }] = useRegisterMutation()
  const [uploadTenantLogo] = useUploadTenantLogoMutation()

  const [isSignUp, setIsSignUp] = useState(false)
  const [tenantName, setTenantName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hydrated && token) {
      router.replace(getHomeRoute(user?.permissions, user?.isPlatformManager))
    }
  }, [hydrated, token, user?.permissions, user?.isPlatformManager, router])

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const loading = loggingIn || registering

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const result = isSignUp
        ? await register({
            tenantName: tenantName.trim(),
            email: email.trim(),
            password,
            fullName: fullName.trim() || undefined,
          }).unwrap()
        : await login({ email: email.trim(), password }).unwrap()

      dispatch(setCredentials(result))

      let nextUser = result.user
      if (isSignUp && logo) {
        try {
          const updatedUser = await uploadTenantLogo(logo).unwrap()
          dispatch(setUser(updatedUser))
          nextUser = updatedUser
        } catch {
          // Account created; logo can be updated later from the sidebar.
        }
      }

      router.replace(getHomeRoute(nextUser.permissions, nextUser.isPlatformManager))
    } catch (err) {
      setError(getApiError(err, isSignUp ? 'Registration failed' : 'Login failed'))
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Society Khata</h1>
            <p className="text-sm text-slate-500 mt-1">سوسائٹی کھاتہ</p>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isSignUp ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Office Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isSignUp ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Society Name <span className="font-urdu">سوسائٹی کا نام</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Azlan City"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="font-urdu">نام</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <ImagePicker
                    label="Society Logo (optional)"
                    urdu="سوسائٹی لوگو"
                    value={logo}
                    previewUrl={logoPreview}
                    allowCamera={false}
                    onChange={(file, preview) => {
                      if (logoPreview) URL.revokeObjectURL(logoPreview)
                      setLogo(file)
                      setLogoPreview(preview)
                    }}
                    onError={(message) => setError(message || null)}
                    hint="Shown in the sidebar · JPG, PNG, WebP · Max 5 MB"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="font-urdu">ای میل</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="office@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password <span className="font-urdu">پاس ورڈ</span>
              </label>
              <PasswordInput
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                startIcon={
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                }
                className="w-full pl-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <span className="font-urdu">اکاؤنٹ کی ضرورت ہے؟</span>{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  <span className="font-urdu">بنائیں</span>
                </button>
              </>
            )}
          </p>

          {isSignUp && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Creating an account registers a new society and Admin user.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
