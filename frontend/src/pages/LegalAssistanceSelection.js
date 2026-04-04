import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, Scale, Sparkles, Search, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-[#0F2944] hover:text-[#0F2944]/80"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/role-selection')}
              className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LegalAssistanceSelection = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: User,
      title: 'I Want a Lawyer',
      description: 'Connect with verified independent lawyers across India',
      features: [
        'Browse verified lawyers by specialization',
        'Direct consultation with lawyers',
        'Flexible pricing and consultation options'
      ],
      primaryAction: {
        label: 'Find with AI Assistant',
        path: '/ai-lawyer-chat',
        icon: Sparkles
      },
      secondaryAction: {
        label: 'Browse Manually',
        path: '/browse-lawyers',
        icon: Search
      },
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Building2,
      title: 'I Want a Law Firm',
      description: 'Join established law firms with comprehensive legal services',
      features: [
        'Access to team of specialized lawyers',
        'Comprehensive case management',
        'Established reputation and resources'
      ],
      primaryAction: {
        label: 'Find with AI Assistant',
        path: '/ai-firm-finder',
        icon: Sparkles
      },
      secondaryAction: {
        label: 'Browse Law Firms',
        path: '/browse-firms',
        icon: Search
      },
      gradient: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0F2944]/10 rounded-2xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-[#0F2944]" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0F2944] mb-4">
              Get Started with Legal Assistance
            </h1>
            <p className="text-lg text-gray-600">
              Choose how you want to find legal help
            </p>
          </motion.div>

          {/* Options */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {options.map((option, index) => {
              const Icon = option.icon;
              const PrimaryIcon = option.primaryAction.icon;
              const SecondaryIcon = option.secondaryAction.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <div className="flex flex-col">
                    <div className="w-16 h-16 bg-[#0F2944]/10 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-[#0F2944]" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#0F2944] mb-3">
                      {option.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      {option.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0F2944] mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-3 mt-auto">
                      <Button
                        onClick={() => navigate(option.primaryAction.path)}
                        className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white py-6 rounded-xl font-semibold transition-all duration-300 group`}
                      >
                        <PrimaryIcon className="mr-2 w-5 h-5" />
                        {option.primaryAction.label}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      <Button
                        onClick={() => navigate(option.secondaryAction.path)}
                        variant="outline"
                        className="w-full border-2 border-gray-300 text-[#0F2944] hover:bg-gray-50 py-6 rounded-xl font-semibold transition-all duration-300 group"
                      >
                        <SecondaryIcon className="mr-2 w-5 h-5" />
                        {option.secondaryAction.label}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-600">
              Not sure which option to choose? Our AI assistant can help you decide!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistanceSelection;