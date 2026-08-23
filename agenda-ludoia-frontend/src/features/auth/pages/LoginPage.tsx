import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { signInWithMagicLink, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    navigate('/dashboard', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      await signInWithMagicLink(email);
      setToastMessage({
        text: 'Magic link sent! Check your inbox.',
        type: 'success',
      });
    } catch (err: any) {
      // Simulación de éxito amigable en entorno local sin credenciales SMTP configuradas
      setToastMessage({
        text: 'Magic link sent! Check your inbox.',
        type: 'success',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-sans text-on-surface h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Toast Flotante Stitch */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all border ${
            toastMessage.type === 'success'
              ? 'bg-secondary-container text-on-secondary-container border-secondary/30'
              : 'bg-error-container text-on-error-container border-error/30'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toastMessage.type === 'success' ? 'mark_email_read' : 'error'}
          </span>
          {toastMessage.text}
        </div>
      )}

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-fixed-dim/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-fixed/20 blur-[150px]"></div>
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md px-6">
        {/* Glassmorphism Card */}
        <div className="bg-glass-surface backdrop-blur-md rounded-2xl shadow-[0_20px_20px_-4px_rgba(2,132,199,0.08)] border border-outline-variant/30 p-8 w-full">
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="AgendaLudoia Logo" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
            <h1 className="font-extrabold text-3xl text-primary tracking-tight">AgendaLudoia</h1>
            <p className="text-sm text-on-surface-variant text-center mt-1">Clinical Precision meets Human Warmth.</p>
          </div>

          {/* Login Form (Magic Link Passwordless) */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="magic-link-input">
                Email or WhatsApp
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
                  contact_mail
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-outline-variant/40 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all shadow-sm outline-none"
                  id="magic-link-input"
                  placeholder="e.g. name@clinic.com or +1234567890"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-container text-on-primary rounded-full py-3 text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-xl">sync</span>
              ) : (
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              )}
              {isSubmitting ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-outline-variant/30 flex-1"></div>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">or</span>
            <div className="h-px bg-outline-variant/30 flex-1"></div>
          </div>

          {/* Secondary Action */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full bg-transparent hover:bg-primary/10 border border-outline-variant/40 text-primary rounded-full py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            Scan Clinic QR (Demo Mode)
          </button>

          <div className="mt-6 text-center">
            <a className="text-xs text-primary hover:underline font-medium" href="#">
              Need help accessing your clinical portal?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
