import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, User, Building2, ArrowRight, UserCircle, LogIn, ArrowLeft } from 'lucide-react';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>
          
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0F2944] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function LawFirmRoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLoginMode = searchParams.get('mode') === 'login';
  
  const roles = [
    {
      id: 'lawyer',
      title: 'I am a Lawyer',
      subtitle: 'Working at a law firm? Access your tasks, cases, and performance dashboard.',
      icon: Scale,
      features: ['View assigned tasks', 'Track case progress', 'Performance metrics', 'Client communication'],
      route: '/firm-lawyer-application',
      loginRoute: '/lawfirm-lawyer-login',
      testId: 'lawfirm-lawyer-card'
    },
    {
      id: 'manager',
      title: 'I am a Manager',
      subtitle: 'Manage your law firm, onboard lawyers, track performance and reports.',
      icon: Building2,
      features: ['Register your firm', 'Manage lawyers', 'View all reports', 'Track firm revenue'],
      route: '/lawfirm-application',
      loginRoute: '/login',
      testId: 'lawfirm-manager-card'
    },
    {
      id: 'client',
      title: 'I am a Client',
      subtitle: 'Join a law firm as a client. Track your case progress and communicate with your lawyer.',
      icon: UserCircle,
      features: ['Apply to join a firm', 'Track case progress', 'View assigned lawyer', 'Receive updates'],
      route: '/firm-client-application',
      loginRoute: '/firm-client-login',
      testId: 'lawfirm-client-card'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0F2944]/10 border border-[#0F2944]/20 rounded-lg mb-6">
              <Building2 className="w-5 h-5 text-[#0F2944]" />
              <span className="text-[#0F2944] text-sm font-medium">Law Firm Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0F2944] mb-4">
              {isLoginMode ? 'Welcome Back' : 'Select Your Role'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isLoginMode ? 'Choose your account type to login' : 'Choose how you want to interact with law firms'}
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  data-testid={role.testId}
                  onClick={() => navigate(isLoginMode ? role.loginRoute : role.route)}
                  className="bg-white border border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-[#0F2944] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-[#0F2944] rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-bold text-[#0F2944] mb-3">{role.title}</h2>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{role.subtitle}</p>

                  {/* Features */}
                  {!isLoginMode && (
                    <div className="space-y-2 mb-6">
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-[#0F2944] rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Button */}
                  <button className="w-full py-3 px-6 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors duration-200">
                    {isLoginMode ? (
                      <>
                        <LogIn className="w-5 h-5" />
                        LOGIN
                      </>
                    ) : (
                      <>
                        GET STARTED
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Toggle Links */}
          <div className="text-center mt-12">
            {isLoginMode ? (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/lawfirm-role')}
                  className="text-[#0F2944] hover:underline font-medium transition-colors"
                >
                  Get Started
                </button>
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Already registered?
                </p>
                <button 
                  onClick={() => navigate('/lawfirm-role?mode=login')}
                  className="text-[#0F2944] hover:underline font-medium transition-colors"
                >
                  Login to existing account
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
