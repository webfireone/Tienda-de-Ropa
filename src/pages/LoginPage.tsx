import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react"

const PASSWORD_RULES = [
  { label: "Mínimo 6 caracteres", test: (v: string) => v.length >= 6 },
  { label: "Al menos una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Al menos un número", test: (v: string) => /[0-9]/.test(v) },
]

function getPasswordStrength(password: string): { label: string; color: string; pct: string } {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length
  if (password.length === 0) return { label: "", color: "", pct: "0%" }
  if (passed === 0) return { label: "Muy débil", color: "bg-red-500", pct: "10%" }
  if (passed === 1) return { label: "Débil", color: "bg-orange-500", pct: "33%" }
  if (passed === 2) return { label: "Media", color: "bg-yellow-500", pct: "66%" }
  return { label: "Fuerte", color: "bg-green-500", pct: "100%" }
}

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, checkEmailExists, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  const handleEmailBlur = useCallback(async () => {
    if (!isRegister || !email.trim() || !email.includes("@")) return
    setCheckingEmail(true)
    setEmailExists(null)
    try {
      const exists = await checkEmailExists(email)
      setEmailExists(exists)
    } catch {
      setEmailExists(null)
    }
    setCheckingEmail(false)
  }, [isRegister, email, checkEmailExists])

  const handleResetPassword = async () => {
    if (!email.trim()) return
    setSendingReset(true)
    setError("")
    try {
      await resetPassword(email)
      setResetSent(true)
      setEmailExists(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo")
    }
    setSendingReset(false)
  }

  const validate = (): boolean => {
    const errs: string[] = []
    if (isRegister) {
      if (!name.trim()) errs.push("El nombre es obligatorio")
      if (password.length < 6) errs.push("La contraseña debe tener al menos 6 caracteres")
      if (!/[A-Z]/.test(password)) errs.push("La contraseña debe tener al menos una mayúscula")
      if (!/[0-9]/.test(password)) errs.push("La contraseña debe tener al menos un número")
      if (password !== confirmPassword) errs.push("Las contraseñas no coinciden")
    }
    setFieldErrors(errs)
    return errs.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    try {
      if (isRegister) {
        await signUp(name.trim(), email, password)
      } else {
        await signIn(email, password)
      }
      navigate("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    }
  }

  const handleGoogle = async () => {
    setError("")
    try {
      await signInWithGoogle()
      navigate("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/10">
        {/* Left Panel — Image + Brand */}
        <div className="hidden md:flex md:w-1/2 relative flex-col">
          <div className="absolute inset-0">
            <img
              src="/inicio/inicio-8.jpg"
              alt="Glamours"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
          <div className="relative z-10 mt-auto p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Glamours</span>
            </div>
            <p className="text-lg font-light leading-relaxed text-white/90">
              Glamours te da la Bienvenida
            </p>
            <p className="text-sm text-white/60 mt-2 max-w-xs">
              Descubrí la colección que realza tu estilo único.
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full md:w-1/2 bg-card p-8 flex flex-col justify-center">
          {/* Mobile brand */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Glamours</span>
              <p className="text-xs text-muted-foreground">te da la bienvenida</p>
            </div>
          </div>

          <h1 className="text-2xl font-display mb-1">
            {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isRegister ? "Registrate para comprar" : "Ingresá a tu cuenta"}
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-900/30 border border-rose-800 text-sm text-rose-300 mb-4">
              {error}
            </div>
          )}

          {fieldErrors.length > 0 && (
            <div className="space-y-1 mb-4">
              {fieldErrors.map((err, i) => (
                <p key={i} className="text-xs text-rose-400">• {err}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailExists(null); setResetSent(false) }}
                  onBlur={handleEmailBlur}
                  className="pl-10"
                  required
                />
                {checkingEmail && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                )}
              </div>
              {isRegister && resetSent && (
                <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-800 text-sm text-emerald-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Te enviamos un link para restablecer tu contraseña. Revisá tu correo.</span>
                </div>
              )}
              {isRegister && emailExists === true && !resetSent && (
                <div className="p-3 rounded-xl bg-amber-900/30 border border-amber-800 text-sm text-amber-300 space-y-2">
                  <p className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Este email ya está registrado. ¿Olvidaste tu contraseña?</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleResetPassword}
                    disabled={sendingReset}
                  >
                    {sendingReset ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Restablecer contraseña
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isRegister && password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getPasswordStrength(password).color}`}
                        style={{ width: getPasswordStrength(password).pct }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{getPasswordStrength(password).label}</span>
                  </div>
                  <div className="space-y-0.5">
                    {PASSWORD_RULES.map((rule, i) => (
                      <p key={i} className={`flex items-center gap-1.5 text-[11px] ${rule.test(password) ? "text-green-400" : "text-muted-foreground"}`}>
                        <ShieldCheck className={`h-3 w-3 ${rule.test(password) ? "text-green-400" : "text-muted-foreground/50"}`} />
                        {rule.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isRegister ? "Crear Cuenta" : "Ingresar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isRegister ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError("") }}
              className="text-primary hover:underline font-medium"
            >
              {isRegister ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleGoogle}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>
        </div>
      </div>
    </div>
  )
}
