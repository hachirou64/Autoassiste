import React, { useState, useEffect } from 'react';
import {
  Zap, ShieldCheck, Brain, DollarSign, Clock, MapPin, Sparkles,
  Car, Navigation, Wrench, MessageSquare, Phone, Star, CheckCircle,
  Sun, Moon, Menu, X, Home, Mail, Briefcase, Users, BarChart3,
  User, Send, Building, Clock as ClockIcon, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Page d'accueil complète
const HomePage = ({ onRoleSelect }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const slides = [
    {
      title: "Dépannage intelligent, partout.",
      description: "L'assistance routière réinventée: Détection de pannes, dépannage en 15 min, et transparence totale sur les prix.",
      image: "🚗",
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Expertise Mécanique",
      description: "Notre équipe d'experts analyse vos problèmes et vous guide vers la meilleure solution avec estimation de coût en temps réel.",
      image: "🤖",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Réseau de Professionnels",
      description: "Plus de 500 mécaniciens certifiés disponibles 24/7 dans toutes les grandes villes d'Afrique.",
      image: "👨‍🔧",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const features = [
    { 
      icon: Zap, 
      title: "Rapide", 
      description: "Intervention en moins de 30 minutes",
      color: "amber"
    },
    { 
      icon: ShieldCheck, 
      title: "Sécurisé", 
      description: "Paiements sécurisés et garantie",
      color: "blue"
    },
    {
      icon: Brain,
      title: "Intelligent",
      description: "Diagnostic expert avancé",
      color: "purple"
    },
    { 
      icon: DollarSign, 
      title: "Transparent", 
      description: "Prix fixes, pas de surprise",
      color: "emerald"
    },
    { 
      icon: Clock, 
      title: "24/7", 
      description: "Assistance disponible jour et nuit",
      color: "red"
    },
    { 
      icon: MapPin, 
      title: "Partout", 
      description: "Couverture nationale étendue",
      color: "orange"
    }
  ];

  const stats = [
    { value: "5", label: "Clients satisfaits" },
    { value: "5", label: "Mécaniciens certifiés" },
    { value: "24/7", label: "Assistance disponible" },
    { value: "15min", label: "Temps moyen d'intervention" }
  ];

  const testimonials = [
    {
      name: "Moussa B.",
      role: "Mécanicien partenaire",
      content: "GoAssist m'a permis de doubler mes revenus. Les missions sont régulières et les clients sont satisfaits.",
      rating: 5,
      avatar: "MB"
    },
    {
      name: "Fatou D.",
      role: "Cliente premium",
      content: "Une intervention en 12 minutes pour un pneu crevé ! Le mécanicien était professionnel et le prix transparent.",
      rating: 5,
      avatar: "FD"
    },
    {
      name: "Koffi A.",
      role: "Mécanicien expert",
      content: "L'application est intuitive et les paiements sont instantanés. Je recommande à tous mes collègues.",
      rating: 5,
      avatar: "KA"
    }
  ];

const pricingPlans = [
    {
      name: "Basique",
      price: "Gratuit",
      description: "Parfait pour les besoins occasionnels",
      features: [
        "1 assistance gratuite/mois",
        "Diagnostic standard",
        "Paiement à l'usage",
        "Support par email"
      ],
      color: "gray"
    },
    {
      name: "Premium",
      price: "5.000F/mois",
      description: "Pour les conducteurs réguliers",
      features: [
        "3 assistances incluses",
        "Diagnostic IA avancé",
        "Assistance prioritaire",
        "Support 24/7",
        "Réductions partenaires"
      ],
      color: "amber",
      popular: true
    },
    {
      name: "Pro",
      price: "15.000F/mois",
      description: "Pour les professionnels",
      features: [
        "Assistance illimitée",
        "Diagnostic expert",
        "Assistance VIP 24/7",
        "Couverture nationale",
        "Service de remorquage",
        "Assurance incluse"
      ],
      color: "emerald"
    }
  ];

  const handleNewsletter = async () => {
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setEmail('');
    alert('Merci pour votre inscription !');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
    setContactLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setContactLoading(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    alert('Merci pour votre message ! Nous vous répondrons sous 24h.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-900 transition-colors duration-300`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Car size={24} />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
                GoAssist<span className="text-amber-500">.</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                Comment ça marche
              </a>
              
              <a href="#pro" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                Devenir Pro
              </a>
              <a href="/contact" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                Contact
              </a>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/choose-register'}
                  size="lg"
                  className="border-amber-400 text-amber-500 hover:bg-amber-500 hover:text-white"
                >
                  S'inscrire
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/login'}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-amber-400"
                >
                  Se connecter
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-4">
              <div className="px-4 py-6 space-y-4">
                <a 
                  href="#features" 
                  className="block px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a 
                  href="#how-it-works" 
                  className="block px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Comment ça marche
                </a>
                
                <a 
                  href="#pro" 
                  className="block px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Devenir Pro
                </a>
                <a 
                  href="/contact" 
                  className="block px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <Button
                  variant="primary"
                  onClick={() => window.location.href = '/login'}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-amber-400"
                >
                  Se connecter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/choose-register'}
                  size="lg"
                  className="border-amber-400 text-amber-500 hover:bg-amber-500 hover:text-white"
                >
                  S'inscrire
                </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-20 lg:pt-12 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left Column */}
            <div className="lg:w-1/2">
              <Badge variant="warning" className="mb-6 animate-pulse">
                <Sparkles size={14} /> Solution #1 d'assistance en Afrique
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Dépannage intelligent,{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  partout.
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl leading-relaxed">
                L'assistance routière réinventée: 
                Détection de pannes, dépannage en 15 min, et transparence totale sur les prix.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  variant="destructive"
                  size="lg"
                  icon={Navigation}
                  onClick={() => {
                    // Rediriger vers la page de connexion
                    // Le middleware Laravel vérifiera l'authentification
                    // et redirigera vers le dashboard approprié après connexion
                    window.location.href = '/login';
                  }}
                  className="text-lg px-8 py-4"
                >
                  J'ai besoin d'aide
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={Wrench}
                  onClick={() => {
                    // Rediriger vers la page de connexion
                    // Après connexion, l'utilisateur sera redirigé vers le dashboard approprié
                    window.location.href = '/login';
                  }}
                  className="text-lg px-8 py-4"
                >
                  Je suis dépanneur
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - App Preview */}
            <div className="lg:w-1/2 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <Card className="relative overflow-hidden border-0 shadow-2xl">
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                    {/* App Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                          <Car size={24} className="text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-white">GoAssist Pro</span>
                          <p className="text-xs text-slate-400">Mode LIVE activé</p>
                        </div>
                      </div>
                      <Badge variant="warning">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          ACTIF
                        </div>
                      </Badge>
                    </div>
                    
                    {/* Active Mission Preview */}
                    <div className="space-y-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                              <Navigation size={24} className="text-amber-400" />
                            </div>
                            <div>
                              <p className="font-bold text-white">Moussa B.</p>
                              <p className="text-sm text-slate-400">À 8 min • Expert Moteur</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">4.500F</p>
                            <p className="text-xs text-slate-400">Pneu crevé</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Live Map Preview */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        
                        {/* User Location */}
                        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2">
                          <div className="relative">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-full border-2 border-amber-500 flex items-center justify-center animate-pulse">
                              <MapPin size={20} className="text-amber-400" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">
                              Vous
                            </div>
                          </div>
                        </div>
                        
                        {/* Mechanic Location */}
                        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2">
                          <div className="relative">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                              <Car size={20} className="text-emerald-400" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">
                              En route • 8 min
                            </div>
                          </div>
                        </div>
                        
                        {/* Route Line */}
                        <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-amber-500/30 -translate-y-1/2">
                          <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 to-transparent rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-1">
                          <Phone size={18} className="text-amber-400" />
                          <span className="text-xs text-slate-300">Appeler</span>
                        </button>
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-1">
                          <MessageSquare size={18} className="text-blue-400" />
                          <span className="text-xs text-slate-300">Message</span>
                        </button>
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-1">
                          <MapPin size={18} className="text-emerald-400" />
                          <span className="text-xs text-slate-300">Suivre</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-40 left-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 lg:mb-20">
            <Badge variant="info" className="mb-6 animate-pulse">
              <Sparkles size={16} className="mr-2" /> INNOVATION
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Une expérience d'assistance{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                complète
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Tout ce dont vous avez besoin pour une assistance routière sans souci, à portée de main
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 lg:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color === 'amber' ? 'from-amber-500 to-orange-500' : feature.color === 'blue' ? 'from-blue-500 to-cyan-500' : feature.color === 'purple' ? 'from-purple-500 to-pink-500' : feature.color === 'emerald' ? 'from-emerald-500 to-teal-500' : feature.color === 'red' ? 'from-red-500 to-rose-500' : 'from-orange-500 to-amber-500'} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center`}>
                    <CheckCircle size={16} className={`text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 lg:mb-20">
            <Badge variant="warning" className="mb-6">
              <Sparkles size={16} className="mr-2" /> SIMPLICITÉ
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
              Comment{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                ça marche ?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              En 3 étapes simples, obtenir l'assistance dont vous avez besoin en quelques minutes seulement
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 via-orange-500/50 to-blue-500/50 rounded-full"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
              {[
                {
                  step: "01",
                  title: "Signalez votre problème",
                  description: "Indiquez les symptômes rencontrés ou sélectionnez directement le type d'assistance.",
                  icon: MessageSquare,
                  color: "amber"
                },
                {
                  step: "02",
                  title: "Trouvez un expert",
                  description: "Nous localisons le mécanicien le plus proche et compétent pour votre problème.",
                  icon: MapPin,
                  color: "blue"
                },
                {
                  step: "03",
                  title: "Suivez en direct",
                  description: "Visualisez l'arrivée de l'expert en temps réel et communiquez directement avec lui.",
                  icon: Navigation,
                  color: "emerald"
                }
              ].map((step, index) => (
                <div key={index} className="relative group">
                  <Card className="p-8 lg:p-10 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="relative mb-8">
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color === 'amber' ? 'from-amber-500 to-orange-500' : step.color === 'blue' ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500'} flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}>
                        <step.icon size={40} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-4 border-slate-900">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">
                      {step.title}
                    </h3>
                    <p className="text-slate-300 text-center text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                  
                  {/* Step Arrow */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Découvrez ce que disent nos utilisateurs et partenaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 lg:p-8" hover>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{testimonial.content}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Section */}
      <section id="pro" className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <Badge variant="warning" className="mb-6">
                <Briefcase size={14} /> PROFESSIONNELS
              </Badge>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Devenez partenaire GoAssist
              </h2>
              
              <p className="text-lg lg:text-xl text-slate-300 mb-8">
                Rejoignez notre réseau de mécaniciens certifiés et développez votre activité avec nous.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Revenus garantis</h4>
                    <p className="text-slate-300">
                      Missions régulières et paiements instantanés
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Clients qualifiés</h4>
                    <p className="text-slate-300">
                      Accès à une clientèle de qualité avec paiement assuré
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Outils professionnels</h4>
                    <p className="text-slate-300">
                      Application dédiée avec suivi, facturation et analytics
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={() => {
                  // Rediriger vers la page de connexion
                  // Après connexion, l'utilisateur sera redirigé vers le dashboard approprié
                  window.location.href = '/login';
                }}
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                Devenir partenaire
              </Button>
            </div>
            
            <div className="lg:w-1/2">
              <Card className="border-0 bg-white/10 backdrop-blur-sm">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Wrench size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Moussa B.</h4>
                      <p className="text-slate-300">Expert Mécanicien depuis 2022</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-400 mb-1">
                        124
                      </div>
                      <div className="text-sm text-slate-300">
                        Missions complétées
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-amber-400 mb-1">
                        4.9
                      </div>
                      <div className="text-sm text-slate-300">
                        Note moyenne
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        245K
                      </div>
                      <div className="text-sm text-slate-300">
                        Revenus mensuels
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        98%
                      </div>
                      <div className="text-sm text-slate-300">
                        Satisfaction
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 italic text-center">
                    "GoAssist m'a permis de doubler mon activité en 6 mois. Les outils sont parfaits et le support est excellent."
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

     
      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Car size={24} />
                </div>
                <span className="font-black text-2xl">
                  GoAssist<span className="text-amber-500">.</span>
                </span>
              </div>
              <p className="text-slate-400 mb-6">
                L'assistance routière intelligente pour l'Afrique. Rapide, fiable et transparent.
              </p>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Phone size={20} className="text-slate-300" />
                </button>
                <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <MessageSquare size={20} className="text-slate-300" />
                </button>
                <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Mail size={20} className="text-slate-300" />
                </button>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6">Liens rapides</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-amber-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-amber-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#pro" className="text-slate-400 hover:text-amber-400 transition-colors">Devenir Pro</a></li>
                 <li><a href="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-6">Légal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">CGU</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone size={16} />
                  <span>+229 01 69 16 21 07</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail size={16} />
                  <span>support@goassist.bj</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <MapPin size={16} />
                  <span>Cotonou, Bénin</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} GoAssist. Tous droits réservés.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Conçu avec ❤️ pour l'Afrique
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-400"
          aria-label="Retour en haut"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

// Main App Component (updated)
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState(null);

  const handleRoleSelect = (role: string) => {
    setUserRole(role);
    if (role === 'client') {
      setCurrentView('client-dashboard');
    } else if (role === 'pro') {
      setCurrentView('mechanic-dashboard');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setUserRole(null);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {currentView === 'home' && (
        <HomePage onRoleSelect={handleRoleSelect} />
      )}
      {currentView === 'client-dashboard' && (
        <div className="h-full">
          <ClientDashboard />
          <button
            onClick={handleBackToHome}
            className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
          >
            <Home size={24} />
          </button>
        </div>
      )}
      {currentView === 'mechanic-dashboard' && (
        <div className="h-full">
          <MechanicDashboard />
          <button
            onClick={handleBackToHome}
            className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
          >
            <Home size={24} />
          </button>
        </div>
      )}
    </div>
  );
}