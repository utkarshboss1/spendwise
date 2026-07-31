import React, { useEffect, useState } from 'react';
import authApi from '../api/authApi';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Common/Loader';
import { useToast } from '../context/ToastContext';
import { User, Mail, DollarSign, Key, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { updateProfileState } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.getProfile();
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
    } catch (error) {
      console.error(error);
      showToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validate = () => {
    const tempErrors = {};
    if (!name || name.trim() === '') {
      tempErrors.name = 'Name is required';
    }
    if (!email || email.trim() === '') {
      tempErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (newPassword) {
      if (!currentPassword) {
        tempErrors.currentPassword = 'Current password is required to set a new password';
      }
      if (newPassword.length < 6) {
        tempErrors.newPassword = 'New password must be at least 6 characters long';
      }
      if (newPassword !== confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await authApi.updateProfile(payload);
      showToast('Profile updated successfully', 'success');
      
      // Update global context state
      updateProfileState(response);

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh totals
      fetchProfile();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const isNegative = profile?.totalBalance < 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Account Profile
        </h1>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal details and view your overall financial stats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Net Balance Card */}
        <div className={`p-6 bg-gradient-to-br ${
          isNegative ? 'from-rose-500 to-pink-600 shadow-rose-500/10' : 'from-primary-505 to-sky-600 shadow-primary-505/10'
        } rounded-2xl shadow-lg flex items-center gap-4 text-white`}>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold opacity-85 uppercase tracking-wider block">
              Net Balance
            </span>
            <span className="text-2xl font-extrabold mt-1 block">
              ₹{profile?.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/10 rounded-2xl shadow-lg flex items-center gap-4 text-white">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold opacity-85 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-extrabold mt-1 block">
              +₹{profile?.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="p-6 bg-gradient-to-br from-rose-500 to-red-650 shadow-rose-500/10 rounded-2xl shadow-lg flex items-center gap-4 text-white">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold opacity-85 uppercase tracking-wider block">
              Total Expenses
            </span>
            <span className="text-2xl font-extrabold mt-1 block">
              -₹{profile?.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* Settings Form Card */}
      <div className="max-w-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-505" />
          Edit Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                    errors.name ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                  }`}
                />
              </div>
              {errors.name && (
                <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                    errors.email ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-darkBorder my-2" />

          {/* Password Changes Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              Change Password (Leave blank to keep current)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                    errors.currentPassword ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                  }`}
                />
                {errors.currentPassword && (
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                    errors.newPassword ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                  }`}
                />
                {errors.newPassword && (
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-505/20 focus:border-primary-505 transition-all ${
                    errors.confirmPassword ? 'border-rose-500' : 'border-gray-200 dark:border-darkBorder'
                  }`}
                />
                {errors.confirmPassword && (
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary-505 hover:bg-primary-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-primary-505/20 hover:shadow-primary-600/30 transition-all hover:-translate-y-0.5 focus:outline-none disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Profile;
