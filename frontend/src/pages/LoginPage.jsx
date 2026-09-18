import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Key, 
  Sparkles, 
  Cloud, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Radio,
  FileImage,
  Zap,
  Server,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useAuth, DEFAULT_DEMO_USERS } from '../context/AuthContext';

export const LoginPage = ({ onOpenArchitecture }) => {
  const { 
    signInWithCognito, 
    signUpWithCognito, 
    confirmSignUp, 
    resendConfirmationCode,
    autoConfirmUser,
    forgotPassword,
    confirmForgotPassword,
    switchUser
  } = useAuth();

  // Mode: 'signin' | 'signup' | 'verify' | 'forgot' | 'reset_confirm'
  const [mode, setMode] = useState('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleInstantAutoConfirm = async () => {
    if (!email) {
      setErrorMsg('Please enter your account email.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const res = await autoConfirmUser(email);
      setSuccessMsg(res.message || 'Account successfully activated in Amazon Cognito! Redirecting to Sign In...');
      setTimeout(() => {
        setMode('signin');
        setVerificationCode('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Auto-activation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await signInWithCognito(email, password);
      // AuthContext sets state and redirects
    } catch (err) {
      if (err.code === 'UserNotConfirmedException') {
        setErrorMsg(err.message);
        setMode('verify');
      } else if (err.code === 'NotAuthorizedException') {
        setErrorMsg('Incorrect email or password. Please check your credentials.');
      } else if (err.code === 'UserNotFoundException') {
        setErrorMsg('No campus account found with this email address.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    resetMessages();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUpWithCognito({
        email,
        password,
        name,
        department,
        role
      });

      if (res.userConfirmed) {
        setSuccessMsg('Account registered and confirmed! Signing you in...');
        setTimeout(() => signInWithCognito(email, password), 1000);
      } else {
        setSuccessMsg(`Registration initiated! Enter confirmation code or click "Instant Verify" below.`);
        setMode('verify');
      }
    } catch (err) {
      if (err.code === 'UsernameExistsException') {
        setErrorMsg('An account with this email already exists. Please Sign In.');
      } else if (err.code === 'InvalidPasswordException') {
        setErrorMsg('Password does not meet complexity requirements (minimum 8 characters with upper, lower, numbers & symbols).');
      } else {
        setErrorMsg(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerification = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await confirmSignUp(email, verificationCode);
      setSuccessMsg('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        setMode('signin');
        setVerificationCode('');
      }, 1500);
    } catch (err) {
      if (err.code === 'CodeMismatchException') {
        setErrorMsg('Invalid confirmation code. Please check the 6-digit code in your email or click "Instant Activate" below.');
      } else if (err.code === 'ExpiredCodeException') {
        setErrorMsg('Confirmation code has expired. Please click "Resend Code" or use "Instant Activate".');
      } else {
        setErrorMsg(err.message || 'Verification failed. Please check the code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAdminActivate = async () => {
    if (!email) {
      setErrorMsg('Please enter your account email first.');
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      const res = await autoConfirmUser(email);
      setSuccessMsg(res.message || 'Account successfully activated via AWS Admin API! Redirecting to Sign In...');
      setTimeout(() => {
        setMode('signin');
        setVerificationCode('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Direct activation failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrorMsg('Please provide your campus email address.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      await resendConfirmationCode(email);
      setSuccessMsg(`A fresh 6-digit verification code was dispatched to ${email}.`);
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccessMsg(`Password reset code sent to ${email}. Check your inbox.`);
      setMode('reset_confirm');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate password recovery.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await confirmForgotPassword(email, verificationCode, newPassword);
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setTimeout(() => {
        setMode('signin');
        setPassword(newPassword);
        setVerificationCode('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = (user) => {
    setEmail(user.email);
    setPassword(user.password || 'StudentPass123!');
    setName(user.name);
    setDepartment(user.department);
    setRole(user.role);
    setMode('signin');
    resetMessages();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <span className="font-headline font-black text-lg tracking-tight">FI</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-lg tracking-tight text-white">FindIt VITC</span>
                <span className="text-[10px] uppercase font-label font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary-fixed border border-primary/30">
                  AWS Serverless
                </span>
              </div>
              <p className="text-[11px] text-slate-400">VIT Chennai Lost &amp; Found + Emergency Broadcast Network</p>
            </div>
          </div>

          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-primary/50 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm"
          >
            <Cloud className="w-4 h-4 text-primary-fixed" />
            <span className="hidden sm:inline">AWS Architecture</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary-fixed text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Amazon Cognito Secure Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-black tracking-tight text-white">
              {mode === 'signin' && 'Welcome to FindIt VITC'}
              {mode === 'signup' && 'Create Campus Account'}
              {mode === 'verify' && 'Verify Your Email'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset_confirm' && 'Set New Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin' && 'Sign in to file reports, track items, or broadcast emergency alerts'}
              {mode === 'signup' && 'Register your verified student or staff identity with AWS Cognito'}
              {mode === 'verify' && 'Enter the 6-digit confirmation code sent to your campus email'}
              {mode === 'forgot' && 'We will dispatch a secure verification code to your email'}
              {mode === 'reset_confirm' && 'Enter the reset code and your new password'}
            </p>
          </div>

          {/* Authentication Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
            {/* Mode Switcher Tabs for SignIn / SignUp */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); resetMessages(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    mode === 'signin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); resetMessages(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Campus Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); resetMessages(); }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating with Cognito...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Cognito</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Campus Department / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="student">Student (Campus Access)</option>
                    <option value="admin">Campus Security / Admin (Emergency Dispatch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Campus Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.student@campus.edu"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Password requires $\ge$ 8 chars with upper, lower, numbers & symbols.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Cognito Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. VERIFY EMAIL FORM */}
            {mode === 'verify' && (
              <form onSubmit={handleConfirmVerification} className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    6-Digit Email Confirmation Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-center font-mono tracking-widest text-lg focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Code & Activate</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-300">Didn't receive an email code?</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        AWS Cognito email delivery may be delayed or filtered by spam filters. Click below to activate your account directly via AWS Admin API without waiting.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !email}
                    onClick={handleDirectAdminActivate}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>⚡ 1-Click Instant Activate Account</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetMessages(); }}
                    className="text-slate-400 hover:text-slate-200 transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 4. FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Registered Campus Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
                >
                  {loading ? <span>Sending Reset Code...</span> : <span>Send Reset Code</span>}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetMessages(); }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    Cancel and Return to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 5. CONFIRM PASSWORD RESET FORM */}
            {mode === 'reset_confirm' && (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Reset Code from Email *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-center font-mono tracking-widest text-base focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
                >
                  {loading ? <span>Updating Password...</span> : <span>Set New Password & Sign In</span>}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetMessages(); }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Discreet Demo Helper Accordion for Evaluators */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <button
              type="button"
              onClick={() => setShowDemoHelper(!showDemoHelper)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">Demo Test Profiles / 1-Click Autofill</span>
              </div>
              {showDemoHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemoHelper && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                <p className="text-[11px] text-slate-500">
                  Select an authorized profile to autofill the Cognito login form with valid demo credentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {DEFAULT_DEMO_USERS.map((user) => {
                    const isAdmin = user.role === 'admin' || (user.groups || []).includes('Admin');
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleAutofillDemo(user)}
                        className={`p-2 rounded-xl text-left border transition flex items-center gap-2 group ${
                          isAdmin 
                            ? 'bg-red-950/30 border-red-500/30 hover:border-red-500/60' 
                            : 'bg-blue-950/30 border-blue-500/30 hover:border-blue-500/60'
                        }`}
                      >
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-white block truncate">{user.name.split(' ')[0]}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{user.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-400">FindIt VITC</span> • Amazon Cognito Production Authentication
          </div>
          <div className="flex items-center gap-2">
            <span>Serverless AWS Stack: Cognito • Rekognition • DynamoDB • S3 • SNS • Lambda</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

