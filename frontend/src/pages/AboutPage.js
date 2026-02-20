import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Eye, Shield, Users, Zap, Heart, Scale } from 'lucide-react';
import { NavbarWave } from '../components/NavbarWave';
import { GradientOrbs } from '../components/GradientOrbs';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Footer } from '../components/Footer';

const AboutPage = () => {
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
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden font-['Outfit']">
      <GradientOrbs />
      <NavbarWave />

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
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Making Legal Services
            <br />
            <span className="text-slate-600 dark:text-slate-400">Accessible to All Indians</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light"
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
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl m-4 rounded-3xl animate-float">
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
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
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                To democratize access to legal services in India by leveraging technology to connect citizens with qualified lawyers, provide transparent pricing, and simplify complex legal processes through AI-powered assistance.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
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
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Why We Exist
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
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
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                <problem.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{problem.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{problem.description}</p>
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
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Our Approach
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
              className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-8 rounded-3xl border border-slate-100 dark:border-slate-700"
            >
              <div className="text-6xl font-bold text-blue-100 dark:text-blue-900/50 mb-4">{approach.number}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{approach.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{approach.description}</p>
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
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Built on Trust & Credibility
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Professional, verified, and committed to excellence
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-xl group"
          >
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Indian High Court Interior - Courtroom"
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <p className="text-lg font-semibold text-white">Indian High Court Interior</p>
                <p className="text-sm text-slate-200">Where justice is served</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-xl group"
          >
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Legal Consultation Room"
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <p className="text-lg font-semibold text-white">Legal Consultation</p>
                <p className="text-sm text-slate-200">Professional legal guidance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// About CTA Component
const AboutCTA = ({ navigate, fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background shine effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 relative z-10">
            Join Us in Transforming Legal Access
          </h2>
          <p className="text-xl text-blue-100 mb-10 relative z-10">
            Whether you're seeking legal help or want to join our network of lawyers, we're here for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button
              onClick={() => navigate('/role-selection')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-7 rounded-full font-semibold shadow-xl transition-transform hover:scale-105"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/premium-contact')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-10 py-7 rounded-full font-semibold transition-all"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPage;
