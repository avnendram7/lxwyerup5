import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Eye, Shield, Users, Zap, Heart, Scale, Award } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const PremiumAbout = () => {
  const navigate = useNavigate();

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
      <Navbar />

      {/* Hero Section */}
      <AboutHero fadeInUp={fadeInUp} />

      {/* Mission & Vision */}
      <MissionVision fadeInUp={fadeInUp} />

      {/* Why We Exist */}
      <WhyWeExist fadeInUp={fadeInUp} staggerContainer={staggerContainer} />

      {/* Our Approach */}
      <OurApproach fadeInUp={fadeInUp} />

      {/* Trust & Credibility */}
      <TrustSection fadeInUp={fadeInUp} />

      {/* CTA */}
      <AboutCTA navigate={navigate} fadeInUp={fadeInUp} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// About Hero Component
const AboutHero = ({ fadeInUp }) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-white pt-24">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Making Legal Services
            <br />
            <span className="text-gray-600">Accessible to All Indians</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We believe every Indian deserves quality legal representation, regardless of location or economic status
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// Mission & Vision Component
const MissionVision = ({ fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Indian High Court Interior"
                className="w-full h-[500px] object-cover brightness-110 contrast-110 saturate-120"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
          >
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#0F2944] rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0F2944]">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To democratize access to legal services in India by leveraging technology to connect citizens with qualified lawyers, provide transparent pricing, and simplify complex legal processes through AI-powered assistance.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#0F2944] rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0F2944]">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                A future where every Indian has immediate access to affordable, quality legal assistance—transforming the legal system into a transparent, efficient, and citizen-friendly service powered by cutting-edge technology.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Why We Exist Component
const WhyWeExist = ({ fadeInUp, staggerContainer }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const problems = [
    {
      icon: Users,
      title: 'Finding Lawyers is Difficult',
      description: 'Most Indians struggle to find qualified lawyers in their area who specialize in their specific legal needs.'
    },
    {
      icon: Shield,
      title: 'Lack of Transparency',
      description: 'Hidden fees and unclear timelines create mistrust and financial stress for clients seeking legal help.'
    },
    {
      icon: Zap,
      title: 'Complex Legal Language',
      description: 'Legal jargon and complex procedures intimidate citizens and prevent them from seeking justice.'
    },
    {
      icon: Heart,
      title: 'Limited Accessibility',
      description: 'Quality legal services are concentrated in major cities, leaving rural and semi-urban areas underserved.'
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0F2944] mb-4">
            Why We Exist
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The traditional legal system in India faces significant challenges that prevent ordinary citizens from accessing justice
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-[#0F2944] rounded-xl flex items-center justify-center mb-6">
                <problem.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F2944] mb-3">{problem.title}</h3>
              <p className="text-gray-600">{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Our Approach Component
const OurApproach = ({ fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const approaches = [
    {
      number: '01',
      title: 'Technology-Driven',
      description: 'AI-powered matching algorithms connect you with the right lawyer for your specific needs in seconds.'
    },
    {
      number: '02',
      title: 'Client-First Philosophy',
      description: 'Transparent pricing, regular updates, and easy communication keep you informed at every step.'
    },
    {
      number: '03',
      title: 'Ethical & Verified',
      description: 'Every lawyer on our platform is verified, with credentials checked and client reviews visible.'
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0F2944] mb-4">
            Our Approach
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Combining technology, ethics, and client-centric values to revolutionize legal services
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-[#0F2944]/10 mb-4">{approach.number}</div>
              <h3 className="text-2xl font-bold text-[#0F2944] mb-4">{approach.title}</h3>
              <p className="text-gray-600 leading-relaxed">{approach.description}</p>
              {index < approaches.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-6 w-12 h-0.5 bg-[#0F2944]/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trust Section Component
const TrustSection = ({ fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0F2944] mb-4">
            Built on Trust & Credibility
          </h2>
          <p className="text-xl text-gray-600">
            Professional, verified, and committed to excellence
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Indian High Court Interior - Courtroom"
              className="w-full h-[400px] object-cover brightness-115 contrast-115 saturate-130"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-800/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-800">Indian High Court Interior</p>
                <p className="text-xs text-gray-600">Where justice is served</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Indian Legal Consultation Room"
              className="w-full h-[400px] object-cover brightness-115 contrast-115 saturate-130"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-800/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-800">Legal Consultation</p>
                <p className="text-xs text-gray-600">Professional legal guidance</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Removed fake stats section */}
      </div>
    </section>
  );
};

// About CTA Component
const AboutCTA = ({ navigate, fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F2944] via-[#1a3a5c] to-[#0F2944]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Join Us in Transforming Legal Access
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Whether you're seeking legal help or want to join our network of lawyers, we're here for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/register')}
              className="bg-white text-[#0F2944] hover:bg-blue-50 text-lg px-10 py-7 rounded-full font-semibold shadow-xl"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0F2944] text-lg px-10 py-7 rounded-full font-semibold"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-[#0F2944] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
          <span className="text-xl font-bold">Lxwyer Up</span>
        </div>
        <p className="text-blue-200 text-sm mb-6">
          Justice You Understand, Technology You Trust
        </p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          className="border-t border-white/10 pt-6 text-blue-200 text-sm"
        >
          <p>&copy; {new Date().getFullYear()} Lxwyer Up. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default PremiumAbout;
