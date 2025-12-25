import { useState } from 'react';
import { Lock, Mail, User, GraduationCap, AlertCircle, Shield, Building2, Briefcase, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageView } from '../types/credential';

interface LoginPageProps {
  onLogin: (role: PageView, userInfo: { name: string; email: string }) => void;
  onBack: () => void;
}

const mockUsers = {
  admin: {
    email: 'admin@acadchain.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin' as PageView
  },
  institution: {
    email: 'institution@university.edu',
    password: 'inst123',
    name: 'University Registrar',
    role: 'institution' as PageView
  },
  student: {
    email: 'student@university.edu',
    password: 'student123',
    name: 'John Doe',
    role: 'student' as PageView
  },
  verify: {
    email: 'verifier@employer.com',
    password: 'verify123',
    name: 'HR Manager',
    role: 'verify' as PageView
  }
};

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<PageView | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    onLogin(selectedRole, { name: email, email });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    onLogin(selectedRole, { name, email });
  };

  const handleQuickLogin = (userType: keyof typeof mockUsers) => {
    const user = mockUsers[userType];
    onLogin(user.role, { name: user.name, email: user.email });
  };

  const roleOptions = [
    {
      role: 'admin' as PageView,
      title: 'Admin',
      description: 'Platform administrator',
      icon: Shield,
      color: 'from-red-500 to-pink-600'
    },
    {
      role: 'student' as PageView,
      title: 'Student',
      description: 'View and share credentials',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      role: 'institution' as PageView,
      title: 'Institution',
      description: 'Issue credentials',
      icon: Building2,
      color: 'from-green-500 to-emerald-600'
    },
    {
      role: 'verify' as PageView,
      title: 'Employer',
      description: 'Verify credentials',
      icon: Briefcase,
      color: 'from-orange-500 to-amber-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-40 left-10 w-80 h-80 bg-yellow-500/40 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-amber-400/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-600/35 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 relative z-10">
        <motion.div className="bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-yellow-500/30 shadow-yellow-500/20" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="flex items-center justify-center mb-6" variants={itemVariants}>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg shadow-yellow-500/50">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9SDhWvIaGwyyoH9wENFZ4EFEqQCr4UXIVjw&s"
                alt="ZK LEDGER Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
          </motion.div>

          {!selectedRole ? (
            <motion.div variants={containerVariants}>
              <motion.h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent text-center mb-2" variants={itemVariants}>
                Select Your Role
              </motion.h2>
              <motion.p className="text-yellow-100/80 text-center mb-8" variants={itemVariants}>
                Choose your role to continue
              </motion.p>

              <motion.div className="grid grid-cols-2 gap-4 mb-6" variants={containerVariants}>
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.role}
                      onClick={() => setSelectedRole(option.role)}
                      className="group relative overflow-hidden bg-black/40 backdrop-blur-md border border-yellow-500/40 hover:border-yellow-400/80 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variants={itemVariants}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center mb-3 mx-auto shadow-lg shadow-yellow-500/50">
                          <Icon className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-1">{option.title}</h3>
                        <p className="text-sm text-yellow-100/70">{option.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div className="mt-6 text-center" variants={itemVariants}>
                <button
                  onClick={onBack}
                  className="text-yellow-400/70 hover:text-yellow-300 text-sm font-medium transition-colors"
                >
                  Back to Home
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants}>
              <motion.div className="flex items-center justify-between mb-6" variants={itemVariants}>
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setEmail('');
                    setPassword('');
                    setName('');
                    setError('');
                  }}
                  className="flex items-center text-yellow-400/70 hover:text-yellow-300 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Change Role
                </button>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const selected = roleOptions.find(r => r.role === selectedRole);
                    if (!selected) return null;
                    const Icon = selected.icon;
                    return (
                      <>
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                          <Icon className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-sm font-semibold text-yellow-400">{selected.title}</span>
                      </>
                    );
                  })()}
                </div>
              </motion.div>

              <motion.h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent text-center mb-2" variants={itemVariants}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </motion.h2>
              <motion.p className="text-yellow-100/80 text-center mb-8" variants={itemVariants}>
                {isSignUp ? 'Sign up to access your credentials' : 'Sign in to access the platform'}
              </motion.p>

              {error && (
                <motion.div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start" variants={itemVariants}>
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              <motion.form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5" variants={containerVariants}>
                {isSignUp && (
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-yellow-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500/70" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-yellow-500/40 rounded-lg text-yellow-100 placeholder-yellow-500/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all backdrop-blur-md"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-yellow-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500/70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-black/40 border border-yellow-500/40 rounded-lg text-yellow-100 placeholder-yellow-500/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all backdrop-blur-md"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-yellow-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-black/40 border border-yellow-500/40 rounded-lg text-yellow-100 placeholder-yellow-500/50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all backdrop-blur-md"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500/70 hover:text-yellow-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black py-3 rounded-lg font-semibold hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg shadow-yellow-500/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </motion.button>
              </motion.form>

              <motion.div className="mt-6 text-center" variants={itemVariants}>
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        <motion.div className="bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-yellow-500/30 shadow-yellow-500/20 text-yellow-100" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <motion.h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Demo Credentials
          </motion.h3>
          <motion.p className="text-yellow-100/80 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Use these credentials to explore different roles in the platform
          </motion.p>

          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, staggerChildren: 0.1 }}>
            {[
              { title: 'Administrator', email: 'admin@acadchain.com', password: 'admin123', key: 'admin' },
              { title: 'Institution', email: 'institution@university.edu', password: 'inst123', key: 'institution' },
              { title: 'Student', email: 'student@university.edu', password: 'student123', key: 'student' },
              { title: 'Employer', email: 'verifier@employer.com', password: 'verify123', key: 'verify' }
            ].map((cred) => (
              <motion.div
                key={cred.key}
                className="bg-black/40 backdrop-blur-md border border-yellow-500/40 rounded-lg p-4 hover:bg-black/60 hover:border-yellow-400/70 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg text-yellow-400">{cred.title}</h4>
                  <motion.button
                    onClick={() => handleQuickLogin(cred.key as keyof typeof mockUsers)}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded text-sm font-medium hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg shadow-yellow-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Quick Login
                  </motion.button>
                </div>
                <p className="text-sm text-yellow-100/70 mb-2">
                  Email: <span className="font-mono bg-black/40 px-2 py-1 rounded text-yellow-200 border border-yellow-500/20">{cred.email}</span>
                </p>
                <p className="text-sm text-yellow-100/70">
                  Password: <span className="font-mono bg-black/40 px-2 py-1 rounded text-yellow-200 border border-yellow-500/20">{cred.password}</span>
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="mt-6 p-4 bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-sm text-yellow-100/80">
              <strong className="text-yellow-400">Note:</strong> This is a demo system. You can also sign up with any email to explore the student portal.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
