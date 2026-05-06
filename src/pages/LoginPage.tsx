import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Wrench,
  Users,
  BarChart3,
  Briefcase,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useTheme } from '@/theme/useTheme';

const FEATURES = [
  { icon: Users,      text: 'Onboard and manage your worker roster' },
  { icon: Briefcase,  text: 'Bid on consumer-posted jobs at scale' },
  { icon: BarChart3,  text: 'Track revenue, completion rate, and dispatch SLA' },
  { icon: Bell,       text: 'Real-time alerts on payments and disputes' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ username: username.trim(), password, rememberMe: true });
      navigate('/', { replace: true });
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ============================================================
            LEFT — branded marketing panel (lg+ only)
         ============================================================ */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{
          background:
            'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #0f172a 100%)',
        }}
      >
        {/* Decorative blur orbs */}
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"
        />

        {/* Top: brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Wrench className="text-white" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">Deharri</div>
            <div className="text-sm text-white/70" dir="auto">
              دہاڑی &middot; <span className="italic">daily wage</span>
            </div>
          </div>
        </div>

        {/* Middle: tagline + features */}
        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              The agency dashboard for Pakistan&rsquo;s blue-collar service marketplace.
            </h2>
            <p className="mt-3 text-white/80 text-base leading-relaxed">
              Onboard workers, dispatch jobs, and watch the numbers move &mdash;
              all in one place.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-sm text-white/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: footer + city tag */}
        <div className="relative z-10 flex items-end justify-between text-xs text-white/60">
          <div>&copy; {new Date().getFullYear()} Deharri</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Karachi &middot; Lahore &middot; Islamabad &middot; +7 more
          </div>
        </div>
      </div>

      {/* ============================================================
            RIGHT — login form (full width on mobile)
         ============================================================ */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top-right: theme toggle (visible on every screen size) */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-mutedForeground transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm">
            {/* Mobile-only mini brand header (lg+ has the full panel on the left) */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="text-primary" size={20} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  Deharri
                </div>
                <div className="text-xs text-mutedForeground">Agency Dashboard</div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-mutedForeground">
                Sign in to your agency dashboard.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. acme_agency"
                  className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-mutedForeground/70 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-shadow"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-mutedForeground/70 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-shadow"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-600/15 border border-red-600/20 p-3 text-sm text-red-700 dark:text-red-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary text-white py-2.5 text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-xs text-mutedForeground text-center leading-relaxed">
              Don&rsquo;t have an agency yet?
              <br />
              Create one in the{' '}
              <span className="font-medium text-foreground">Deharri mobile app</span>{' '}
              and come back here to manage it.
            </p>
          </div>
        </div>

        {/* Mobile-only footer */}
        <div className="lg:hidden px-4 pb-6 text-center text-xs text-mutedForeground">
          &copy; {new Date().getFullYear()} Deharri &middot; Pakistan
        </div>
      </div>
    </div>
  );
}
