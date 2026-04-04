import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { NavbarWave } from '../components/NavbarWave';
import { GradientOrbs } from '../components/GradientOrbs';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Footer } from '../components/Footer';
import { useLang } from '../context/LanguageContext';

const TEXT = {
  en: {
    phoneLabel: 'Phone Number',
    namePlace: 'Rahul Sharma',
    emailPlace: 'rahul@example.com',
    phonePlace: '+91 9876543210',
    msgPlace: 'Tell us about your legal needs...',
    getInTouch: 'Get in Touch',
    reachOut: 'Reach out to us through any of these channels',
    officeHours: 'Office Hours',
    monFri: 'Monday - Friday: 9:00 AM - 6:00 PM',
    sat: 'Saturday: 10:00 AM - 4:00 PM',
    sun: 'Sunday: Closed',
    urgentAI: 'For urgent matters, our AI assistant is available 24/7',
    notSure: 'Not Sure Where to Start?',
    bookFreeSub: 'Book a free consultation and let our experts guide you through your legal options',
    bookFreeBtn: 'Book Free Consultation',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
  },
  hi: {
    phoneLabel: 'फ़ोन नंबर',
    namePlace: 'राहुल शर्मा',
    emailPlace: 'rahul@example.com',
    phonePlace: '+91 9876543210',
    msgPlace: 'अपनी कानूनी ज़रूरतों के बारे में हमें बताएं...',
    getInTouch: 'संपर्क करें',
    reachOut: 'इनमें से किसी भी माध्यम से हमसे जुड़ें',
    officeHours: 'कार्यालय समय',
    monFri: 'सोमवार - शुक्रवार: सुबह 9:00 - शाम 6:00',
    sat: 'शनिवार: सुबह 10:00 - शाम 4:00',
    sun: 'रविवार: बंद',
    urgentAI: 'तात्कालिक मामलों के लिए, हमारा AI सहायक 24/7 उपलब्ध है',
    notSure: 'समझ नहीं आ रहा कहाँ से शुरू करें?',
    bookFreeSub: 'मुफ़्त परामर्श बुक करें और हमारे विशेषज्ञों को आपके विकल्पों के बारे में मार्गदर्शन करने दें',
    bookFreeBtn: 'मुफ़्त परामर्श बुक करें',
    email: 'ईमेल',
    phone: 'फ़ोन',
    location: 'स्थान',
  }
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-['Outfit']">
      <GradientOrbs />
      <NavbarWave />

      {/* Hero Section */}
      <ContactHero fadeInUp={fadeInUp} />

      {/* Contact Form & Details */}
      <ContactFormSection
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        fadeInUp={fadeInUp}
      />



      {/* Final CTA */}
      <FinalCTA fadeInUp={fadeInUp} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Contact Hero Component
const ContactHero = ({ fadeInUp }) => {
  const { t } = useLang();
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            {t('contact_title')}
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('contact_sub')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// Contact Form Section Component
const ContactFormSection = ({ formData, handleChange, handleSubmit, isSubmitting, fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t, lang } = useLang();
  const d = TEXT[lang] || TEXT.en;

  const contactInfo = [
    {
      icon: Mail,
      title: d.email,
      value: 'avnendram.7@gmail.com',
      link: 'mailto:avnendram.7@gmail.com'
    },
    {
      icon: Phone,
      title: d.phone,
      value: '+91 8318216968',
      link: 'tel:+918318216968'
    },
    {
      icon: MapPin,
      title: d.location,
      value: 'Sonipat, Haryana, India',
      link: null
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl animate-float"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('contact_title')}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              {t('contact_sub')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('contact_name')}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-white focus:outline-none transition-all duration-300 placeholder:text-slate-400"
                  placeholder={d.namePlace}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('contact_email')}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-white focus:outline-none transition-all duration-300 placeholder:text-slate-400"
                  placeholder={d.emailPlace}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {d.phoneLabel}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-white focus:outline-none transition-all duration-300 placeholder:text-slate-400"
                  placeholder={d.phonePlace}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('contact_message')}
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-white focus:outline-none transition-all duration-300 resize-none placeholder:text-slate-400"
                  placeholder={d.msgPlace}
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-blue-600/30 transition-all duration-300 group"
                >
                  {isSubmitting ? (
                    '...'
                  ) : (
                    <>
                      {t('contact_send')}
                      <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{d.getInTouch}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {d.reachOut}
            </p>

            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{info.title}</h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-300">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Office Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-4">{d.officeHours}</h3>
              <div className="space-y-2 text-slate-300">
                <p>{d.monFri}</p>
                <p>{d.sat}</p>
                <p>{d.sun}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-slate-400">
                  {d.urgentAI}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};



// Final CTA Component
const FinalCTA = ({ fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background shine effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-white/10">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative z-10">
            {d.notSure}
          </h2>
          <p className="text-xl text-slate-300 mb-8 relative z-10">
            {d.bookFreeSub}
          </p>
          <Button
            onClick={() => window.location.href = '/register'}
            className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-6 rounded-full font-semibold shadow-lg hover:scale-105 transition-all duration-300 relative z-10"
          >
            {d.bookFreeBtn}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactPage;
