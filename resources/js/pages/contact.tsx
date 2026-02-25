import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowLeft, Clock, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    
    setContactLoading(true);
    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'include',
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setContactLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Back Link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Retour à l'accueil</span>
          </a>

          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="warning" className="mb-6 animate-pulse">
              <Sparkles size={14} /> Contact
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Nous{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                contacter
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Vous avez des questions ? Notre équipe est là pour vous aider. 
              N'hésitez pas à nous reacher, nous répondons sous 2h.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Email */}
              <Card 
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Mail size={24} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-lg">
                      Email
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      support@goassist.bj
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-500">
                      <Clock size={14} className="text-amber-500" />
                      <span>Réponse sous 2h</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card 
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Phone size={24} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-lg">
                      Téléphone
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      +229 01 69 16 21 07
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span>Disponible 24/7</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Address */}
              <Card 
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <MapPin size={24} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-lg">
                      Adresse
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Cotonou, Bénin
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-500">
                      <MapPin size={14} className="text-emerald-500" />
                      <span>Siège social</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* WhatsApp / Quick Contact */}
              <Card 
                className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 text-lg">
                      WhatsApp
                    </h3>
                    <p className="text-white/80 font-medium">
                      +229 01 69 16 21 07
                    </p>
                    <p className="text-sm text-white/70 mt-2">
                      Réponse rapide via WhatsApp
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 lg:p-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Send size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Nous répondrons dans les plus brefs délais
                  </p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <p className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <CheckCircle size={20} />
                      Merci pour votre message ! Nous vous répondrons sous 24h.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-800 dark:text-red-300 font-semibold">
                      Veuillez remplir tous les champs requis.
                    </p>
                  </div>
                )}

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom complet"
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Adresse email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Objet
                  </label>
                  <div className="relative">
                    <Input
                      id="subject"
                      type="text"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      placeholder="Sujet de votre message"
                      className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre problème ou posez votre question..."
                      rows={6}
                      className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="default"
                  disabled={contactLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 py-4 text-lg font-semibold"
                >
                  {contactLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send size={20} />
                      Envoyer le message
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
                Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

