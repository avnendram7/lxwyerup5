import { useNavigate } from 'react-router-dom';
import { Scale, Search, Bot, Filter, Sparkles } from 'lucide-react';
import { CorporateButton } from '../components/CorporateComponents';

export default function FindLawyer() {
  const navigate = useNavigate();

  const options = [
    {
      id: 'manual',
      title: 'Manual Search',
      subtitle: 'Search lawyers by name, location, specialization and more',
      icon: Search,
      features: [
        'Search by lawyer name',
        'Filter by state & city',
        'Filter by specialization',
        'Filter by court',
        '300+ verified lawyers'
      ],
      route: '/find-lawyer/manual'
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      subtitle: 'Get personalized lawyer recommendations based on your case',
      icon: Bot,
      features: [
        'Describe your case',
        'AI analyzes your needs',
        'Get instant recommendations',
        'Personalized matching',
        'Smart case detection'
      ],
      route: '/find-lawyer/ai'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-white hover:text-blue-500 transition-colors"
            >
              <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
              <span className="text-xl font-semibold">Lxwyer Up</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/role-selection?mode=login')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Login
              </button>
              <CorporateButton
                variant="primary"
                onClick={() => navigate('/user-signup')}
              >
                Sign Up
              </CorporateButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-16 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg mb-6">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-blue-500 text-sm font-medium">Find Legal Help</span>
            </div>
            <h1 className="text-5xl font-semibold text-white mb-4">
              How would you like to find a lawyer?
            </h1>
            <p className="text-slate-400 text-lg">
              Choose your preferred method to discover the right legal professional
            </p>
          </div>

          {/* Option Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  onClick={() => navigate(option.route)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-8 cursor-pointer hover:border-slate-700 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-semibold text-white mb-3">{option.title}</h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">{option.subtitle}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-8">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors duration-200">
                    {option.title === 'Manual Search' ? 'Search Now' : 'Start Chat'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm">
              All lawyers are verified • 300+ professionals across Delhi, UP, Haryana & Maharashtra
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
