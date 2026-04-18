import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, CheckCircle, Scale, Brain, Clock, Award, ChevronDown, ChevronUp, FileText, Gavel, BookOpen, MessageSquare, Search, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';

// Simple Navbar Component
const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 xl:w-9 xl:h-9 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-black">Lxwyer Up</span>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-black hover:text-gray-600 transition-colors">Home</button>
            <button onClick={() => navigate('/premium-about')} className="text-black hover:text-gray-600 transition-colors">About</button>
            <button onClick={() => navigate('/premium-contact')} className="text-black hover:text-gray-600 transition-colors">Contact</button>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Scattered Images Component with Vibrant Colors - Indian Legal Context
const ScatteredImages = () => {
  const images = [
    // LEFT SIDE IMAGES (4 images)
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/s897zzt0_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_42_37%20AM.png',
      alt: 'Indian Lawyer with Book',
      position: 'top-24 left-4',
      size: 'w-44 h-52',
      rotation: -8,
      delay: 0.2
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/hcvutxga_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_44_01%20AM.png',
      alt: 'Lawyer Client Consultation',
      position: 'top-16 left-48',
      size: 'w-44 h-52',
      rotation: 6,
      delay: 0.3
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/a6uxjrba_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_46_59%20AM.png',
      alt: 'Legal Tech Innovation',
      position: 'bottom-28 left-4',
      size: 'w-40 h-48',
      rotation: 12,
      delay: 0.4
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/rrzwyi3v_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_48_28%20AM.png',
      alt: 'Indian Supreme Court',
      position: 'bottom-20 left-44',
      size: 'w-44 h-52',
      rotation: -5,
      delay: 0.5
    },
    // RIGHT SIDE IMAGES (4 images)
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/tafuoi17_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_52_50%20AM.png',
      alt: 'Lawyers Handshake',
      position: 'top-16 right-48',
      size: 'w-44 h-52',
      rotation: 8,
      delay: 0.6
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/b3qq5iee_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2007_53_30%20AM.png',
      alt: 'Senior Lawyers',
      position: 'top-24 right-4',
      size: 'w-44 h-52',
      rotation: -6,
      delay: 0.7
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/l4hc8h43_ChatGPT%20Image%20Jan%2029%2C%202026%20at%2009_33_27%20AM.png',
      alt: 'Video Call Consultation',
      position: 'bottom-20 right-44',
      size: 'w-44 h-52',
      rotation: 10,
      delay: 0.8
    },
    {
      src: 'https://customer-assets.emergentagent.com/job_lxwyerup/artifacts/47z3o5x8_Screenshot%202026-01-29%20at%208.30.07%E2%80%AFAM.png',
      alt: 'Lawyer Dashboard',
      position: 'bottom-28 right-4',
      size: 'w-48 h-56',
      rotation: -4,
      delay: 0.9
    }
  ];

  return (
    <>
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: image.rotation,
            y: [0, -25, 0]
          }}
          transition={{
            opacity: { duration: 0.8, delay: image.delay },
            scale: { duration: 0.8, delay: image.delay },
            rotate: { duration: 0.8, delay: image.delay },
            y: {
              duration: 6 + index,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          className={`absolute ${image.position} ${image.size} z-10 hidden lg:block`}
        >
          <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      ))}
    </>
  );
};

const PremiumHome = () => {
  const navigate = useNavigate();
  const [showAllServices, setShowAllServices] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SimpleNavbar navigate={navigate} />

      {/* Hero Section - Minimalist with Tagline Only */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">
        {/* Scattered Floating Images */}
        <ScatteredImages />

        {/* Center Content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-16 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-blue-600">Justice</span> You Understand, <span className="text-blue-600">Technology</span> You Trust
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/role-selection')}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-lg px-14 py-8 rounded-full font-semibold shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/quick-chat')}
                  variant="outline"
                  className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white text-lg px-14 py-8 rounded-full font-semibold transition-all duration-300"
                >
                  LxwyerAI
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection
        showAllServices={showAllServices}
        setShowAllServices={setShowAllServices}
        fadeInUp={fadeInUp}
        staggerContainer={staggerContainer}
      />

      {/* Features Section */}
      <FeaturesSection fadeInUp={fadeInUp} />

      {/* CTA Section */}
      <CTASection navigate={navigate} fadeInUp={fadeInUp} />

      {/* Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

// Services Section Component
const ServicesSection = ({ showAllServices, setShowAllServices, fadeInUp, staggerContainer }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const mainServices = [
    {
      icon: Brain,
      title: 'AI Legal Assistant',
      description: 'Get instant answers to your legal queries powered by AI trained on Indian law and procedures.'
    },
    {
      icon: Search,
      title: 'Find Lawyers',
      description: 'Connect with verified lawyers across India specializing in your specific legal needs.'
    },
    {
      icon: FileText,
      title: 'Case Management',
      description: 'Track your case progress, documents, and timelines in one secure platform.'
    },
    {
      icon: MessageSquare,
      title: 'Legal Consultation',
      description: 'Book online or offline consultations with experienced legal professionals.'
    }
  ];

  const additionalServices = [
    {
      icon: Gavel,
      title: 'Court Representation',
      description: 'Professional representation in courts across India by experienced advocates.'
    },
    {
      icon: BookOpen,
      title: 'Legal Documentation',
      description: 'Expert assistance in drafting and reviewing legal documents and contracts.'
    },
    {
      icon: UserCheck,
      title: 'Lawyer Verification',
      description: 'All lawyers are verified with bar council credentials and client reviews.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and communications are protected with end-to-end encryption.'
    }
  ];

  const displayServices = showAllServices ? [...mainServices, ...additionalServices] : mainServices.slice(0, 3);

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Services We Offer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive legal solutions designed for modern India
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} isVisible={isInView} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => setShowAllServices(!showAllServices)}
            variant="outline"
            className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-6 rounded-full font-semibold transition-all duration-300"
          >
            {showAllServices ? (
              <>
                Show Less <ChevronUp className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                View All Services <ChevronDown className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

// Service Card Component - Optimized
const ServiceCard = ({ service, index, isVisible }) => {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="w-16 h-16 bg-gray-100 group-hover:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300">
        <Icon className="w-8 h-8 text-gray-800 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
      <p className="text-gray-600 leading-relaxed">{service.description}</p>
      <div className="absolute top-4 right-4 w-2 h-2 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

// Features Section Component
const FeaturesSection = ({ fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
              Experience Legal Services
              <span className="block text-gray-600">
                Designed for India
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We understand the complexities of the Indian legal system. Our platform bridges the gap between citizens and quality legal representation through intelligent technology and verified professionals.
            </p>
            <ul className="space-y-4">
              {[
                'Connect with lawyers in your city',
                'Transparent pricing with no hidden costs',
                'Track your case progress in real-time',
                'Secure document management'
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center text-gray-700"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Indian Court Interior - Modern Justice System"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = ({ navigate, fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Legal Help?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Start your journey towards justice today. Our team is ready to assist you.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate('/role-selection')}
              className="bg-gray-800 hover:bg-gray-900 text-white text-lg px-12 py-7 rounded-full font-semibold shadow-2xl transition-all duration-300"
            >
              Book Your Consultation
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = ({ navigate }) => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 xl:w-9 xl:h-9 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
              <span className="text-xl font-bold">Lxwyer Up</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Justice You Understand, Technology You Trust
            </p>
            <a href="https://www.linkedin.com/company/lxwyerup1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors w-fit shadow-lg">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <span>Follow on LinkedIn</span>
            </a>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => navigate('/premium-about')} className="hover:text-white transition-colors">About</button></li>
              <li><button onClick={() => navigate('/premium-contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Legal Consultation</li>
              <li>Find Lawyers</li>
              <li>AI Assistant</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>avnendram.7@gmail.com</li>
              <li>+91 8318216968</li>
              <li>New Delhi, Delhi</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-300 text-sm">
          <p>&copy; 2026 Lxwyer Up. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PremiumHome;