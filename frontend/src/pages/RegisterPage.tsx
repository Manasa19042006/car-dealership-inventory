import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, ApiError } from '../services/apiClient';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

interface FormValues { name: string; email: string; password: string; confirmPassword: string; }
interface FormErrors { name?: string; email?: string; password?: string; confirmPassword?: string; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (v: FormValues): FormErrors => {
  const e: FormErrors = {};
  if (!v.name.trim()) e.name = 'Name is required.';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address.';
  if (!v.password) e.password = 'Password is required.';
  else if (v.password.length < 8) e.password = 'Minimum 8 characters.';
  else if (!/[A-Z]/.test(v.password)) e.password = 'Need at least one uppercase letter.';
  else if (!/[a-z]/.test(v.password)) e.password = 'Need at least one lowercase letter.';
  else if (!/[0-9]/.test(v.password)) e.password = 'Need at least one number.';
  if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (v.password !== v.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
};

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : score === 3 ? 'text-blue-500' : 'text-green-600'}`}>
        {label} password
      </p>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setValues(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setApiError('');
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await authApi.register({ name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password });
      const loginRes = await authApi.login({ email: values.email.trim().toLowerCase(), password: values.password });
      login(loginRes.data.user, loginRes.data.token!);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unexpected error. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = (field: keyof FormErrors): string =>
    `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
     transition-colors disabled:bg-gray-50
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="text-8xl mb-6">🚗</div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">Join the Dealership</h1>
          <p className="text-blue-300 text-lg">Create your account and start browsing our vehicle inventory today.</p>
          <div className="mt-10 space-y-3">
            {[
              ['✓', 'Browse our full vehicle inventory'],
              ['✓', 'Purchase vehicles with one click'],
              ['✓', 'Track stock in real time'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-sm text-blue-100">
                <span className="text-green-400 font-bold">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🚗</span>
            <h2 className="text-2xl font-bold text-white mt-2">Car Dealership</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
              <p className="text-gray-500 text-sm mt-1">Join the Car Dealership Inventory System</p>
            </div>

            {apiError && <Alert type="error" message={apiError} className="mb-5" />}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input id="name" name="name" type="text" placeholder="John Doe"
                  value={values.name} onChange={handleChange} autoComplete="name" disabled={loading}
                  className={inputClass('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  value={values.email} onChange={handleChange} autoComplete="email" disabled={loading}
                  className={inputClass('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPwd ? 'text' : 'password'}
                    placeholder="Min 8 chars, upper, lower, number"
                    value={values.password} onChange={handleChange}
                    autoComplete="new-password" disabled={loading}
                    className={`${inputClass('password')} pr-12`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPwd ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <PasswordStrength password={values.password} />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword"
                  type={showPwd ? 'text' : 'password'} placeholder="Repeat your password"
                  value={values.confirmPassword} onChange={handleChange}
                  autoComplete="new-password" disabled={loading}
                  className={inputClass('confirmPassword')} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {loading ? <><Spinner size="sm" className="text-white" />Creating account…</> : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
