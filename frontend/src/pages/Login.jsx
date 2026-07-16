import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, Wallet } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Logged in successfully', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 animate-slide-in">
        
        {/* Brand Logo & Headline */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-505 rounded-2xl text-white shadow-lg shadow-primary-505/20">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-505 to-sky-600 bg-clip-text text-transparent">
            Welcome back to SpendWise
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Login to monitor and manage your expenses
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                  errors.email ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500 font-semibold mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-darkBg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                  errors.password ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500 font-semibold mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-505 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-primary-505/20 hover:shadow-primary-600/30 transition-all"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* Toggle link */}
        <div className="text-center pt-2">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-505 dark:text-primary-400 hover:underline font-bold"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
