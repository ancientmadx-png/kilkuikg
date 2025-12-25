import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Activity,
  Shield,
  Building2,
  Wallet,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import InstitutionDashboard from './components/InstitutionDashboard';
import StudentWallet from './components/StudentWallet';
import VerificationPortal from './components/VerificationPortal';
import AdminPanel from './components/AdminPanel';
import OperationsDashboard from './components/OperationsDashboard';
import { PageView } from './types/credential';

interface UserInfo {
  name: string;
  email: string;
  role: PageView;
}

function App() {
  const [currentView, setCurrentView] = useState<PageView>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verify')) {
      setCurrentView('verify');
    }
  }, []);

  const handleLogin = (role: PageView, user: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setUserInfo({ ...user, role });
    setCurrentView(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('selection')} />;
  }

  if (currentView === 'selection' && !isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'operations') {
    return (
      <OperationsDashboard
        onBack={() =>
          isAuthenticated
            ? setCurrentView(userInfo?.role || 'landing')
            : setCurrentView('landing')
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* NAVBAR */}
      <nav className="bg-[#141414] border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setCurrentView('landing')}
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9SDhWvIaGwyyoH9wENFZ4EFEqQCr4UXIVjw&s"
                  alt="ZK LEDGER Logo"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="ml-2 text-xl font-bold text-white">
                  Academic Credentials
                </span>
              </div>

              {isAuthenticated && userInfo && (
                <div className="flex items-center border-l border-[#2A2A2A] pl-4 ml-4">
                  <div className="w-8 h-8 bg-[#FFC700] rounded-full flex items-center justify-center text-black font-semibold text-sm">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium text-white">
                      {userInfo.name}
                    </div>
                    <div className="text-xs text-[#BFBFBF] capitalize">
                      {userInfo.role}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* NAV ACTIONS */}
            <div className="flex space-x-1 items-center">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setCurrentView('operations')}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                      currentView === 'operations'
                        ? 'bg-[#FFC700] text-black'
                        : 'text-[#BFBFBF] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Operations
                  </button>

                  {userInfo?.role === 'admin' && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        currentView === 'admin'
                          ? 'bg-[#FFC700] text-black'
                          : 'text-[#BFBFBF] hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </button>
                  )}

                  {userInfo?.role === 'institution' && (
                    <button
                      onClick={() => setCurrentView('institution')}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        currentView === 'institution'
                          ? 'bg-[#FFC700] text-black'
                          : 'text-[#BFBFBF] hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Institution
                    </button>
                  )}

                  {userInfo?.role === 'student' && (
                    <button
                      onClick={() => setCurrentView('student')}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        currentView === 'student'
                          ? 'bg-[#FFC700] text-black'
                          : 'text-[#BFBFBF] hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Student
                    </button>
                  )}

                  {userInfo?.role === 'verify' && (
                    <button
                      onClick={() => setCurrentView('verify')}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition ${
                        currentView === 'verify'
                          ? 'bg-[#FFC700] text-black'
                          : 'text-[#BFBFBF] hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Verify
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium flex items-center text-red-400 hover:bg-red-500/10 ml-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'admin' && isAuthenticated && userInfo?.role === 'admin' && <AdminPanel />}
        {currentView === 'institution' && isAuthenticated && userInfo?.role === 'institution' && <InstitutionDashboard />}
        {currentView === 'student' && isAuthenticated && userInfo?.role === 'student' && <StudentWallet />}
        {currentView === 'verify' && isAuthenticated && userInfo?.role === 'verify' && <VerificationPortal />}

        {!isAuthenticated && currentView !== 'operations' && currentView !== 'landing' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Access Denied
            </h2>
            <p className="text-[#BFBFBF] mb-6">
              Please log in to access this section
            </p>
            <button
              onClick={() => setCurrentView('selection')}
              className="px-6 py-3 bg-[#FFC700] text-black rounded-lg font-medium hover:opacity-90"
            >
              Go to Login
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#141414] border-t border-[#2A2A2A] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-[#BFBFBF]">
            <p className="mb-2">
              Blockchain-Based Academic Credentials Platform
            </p>
            <p className="text-xs text-[#808080]">
              Powered by Ethereum Sepolia, IPFS, and Soulbound Tokens
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
