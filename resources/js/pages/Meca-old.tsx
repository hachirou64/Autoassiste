"use client";

import { Head } from '@inertiajs/react';
import { Car } from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Import Components
import { DashboardTab } from '@/components/meca/dashboard-tab';
import { Header } from '@/components/meca/header';
import { MechanicDashboard } from '@/components/meca/mechanic-dashboard';
import { NewRequestTab } from '@/components/meca/request-tab';
import { SettingsTab } from '@/components/meca/settings-tab';
import { Sidebar } from '@/components/meca/sidebar';
import { TrackingTab } from '@/components/meca/tracking-tab';
import type { UserData, Vehicle, AiDiagnosis, ServiceRequest } from '@/components/meca/types';
import { VehiclesTab } from '@/components/meca/vehicles-tab';

// Import Types

// Icons

// Configuration
const API_KEY = "";
const APP_NAME = "AutoAssist Pro";
const APP_VERSION = "2.0.0";
  {
    number;
    number;
    string;
  };
  {
  number;
  number;
  Mechanic | null;
  Date;
  Date;
};

interface Mechanic {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  specialty: string[];
  location: {
    lat: number;
    lng: number;
  };
  online: boolean;
  earnings: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mechanic' | 'system';
  text: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

// --- Mock Data Generators ---
const generateMockUser = (): UserData => ({
  id: 'user_001',
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '+229 01 23 45 67',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
  subscription: 'gold',
  vehicles: [
    {
      id: 'veh_001',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      plate: 'ABC-1234',
      color: 'Gris Métal',
      fuelType: 'gasoline',
      status: 'excellent',
      lastService: '2024-01-15',
      nextService: '2024-07-15',
      mileage: 45000
    },
    {
      id: 'veh_002',
      brand: 'Renault',
      model: 'Duster',
      year: 2019,
      plate: 'DEF-5678',
      color: 'Blanc',
      fuelType: 'diesel',
      status: 'good',
      lastService: '2024-02-20',
      nextService: '2024-08-20',
      mileage: 75000
    }
  ],
  paymentMethods: [
    {
      id: 'pm_001',
      type: 'card',
      lastFour: '4242',
      isDefault: true
    },
    {
      id: 'pm_002',
      type: 'mobile_money',
      lastFour: '7890',
      isDefault: false
    }
  ],
  preferences: {
    notifications: {
      sms: true,
      email: true,
      push: true
    },
    language: 'fr',
    theme: 'auto'
  }
});

const generateMockMechanics = (): Mechanic[] => [
  {
    id: 'mec_001',
    name: 'Moussa B.',
    rating: 4.9,
    completedJobs: 124,
    specialty: ['Engine', 'Transmission', 'Electrical'],
    location: { lat: 6.369, lng: 2.428 },
    online: true,
    earnings: 24500
  },
  {
    id: 'mec_002',
    name: 'Fatou D.',
    rating: 4.8,
    completedJobs: 89,
    specialty: ['Battery', 'AC System', 'Diagnostics'],
    location: { lat: 6.371, lng: 2.432 },
    online: true,
    earnings: 18900
  },
  {
    id: 'mec_003',
    name: 'Koffi A.',
    rating: 4.7,
    completedJobs: 156,
    specialty: ['Tire', 'Brakes', 'Suspension'],
    location: { lat: 6.365, lng: 2.430 },
    online: false,
    earnings: 31200
  }
];

// --- API Helpers ---
const callGemini = async (prompt: string, isJson = true, model = "gemini-2.5-flash-preview-09-2025") => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: isJson ? { responseMimeType: "application/json" } : {},
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from API');
    }
    
    return isJson ? JSON.parse(content) : content;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

// --- Reusable UI Components ---
const Card = ({ children, className = "", hover = false, onClick = undefined }) => (
  <div 
    className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 ${hover ? 'hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-300 cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Badge = ({ children, variant = "info", size = "md", className = "" }) => {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
    gray: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span className={`inline-flex items-center justify-center rounded-full border font-bold ${sizes[size]} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  onClick 
}) => {
  const baseStyles = "font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30",
    secondary: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    outline: "border-2 border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {!loading && Icon && iconPosition === "left" && <Icon size={20} />}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={20} />}
    </button>
  );
};

const ProgressBar = ({ value, max = 100, label, color = "amber" }) => {
  const colors = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    purple: "bg-purple-500"
  };

  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
          <span className="font-bold text-slate-900 dark:text-white">{value}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color = "amber" }) => {
  const colors = {
    amber: "bg-amber-500 text-white",
    blue: "bg-blue-500 text-white",
    emerald: "bg-emerald-500 text-white",
    purple: "bg-purple-500 text-white"
  };

  return (
    <Card className="p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {change && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-bold ${change > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

// --- Main Views ---

// 1. Enhanced Client Dashboard
const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [userData, setUserData] = useState(generateMockUser());
  const [notifications, setNotifications] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    color: '',
    fuelType: 'gasoline'
  });

  const handleDeepDiagnosis = async () => {
    if (!aiInput.trim()) return;
    
    setIsAnalyzing(true);
    const prompt = `En tant qu'assistant mécanique expert, analyse cette description de problème automobile: "${aiInput}".
    
    Réponds en JSON avec les champs suivants:
    {
      "issue_title": "Nom technique du problème",
      "severity": "Critique|Modéré|Mineur",
      "estimated_cost": "Montant estimé en CFA",
      "safety_steps": ["étape 1", "étape 2", "étape 3"],
      "mechanic_type": "Spécialité requise",
      "recommended_action": "Action immédiate recommandée",
      "time_estimate": "Durée estimée de réparation",
      "risk_level": "Haute|Moyenne|Basse",
      "parts_needed": ["liste des pièces potentielles"]
    }`;
    
    const result = await callGemini(prompt);
    if (result) {
      setDiagnosis(result);
      setAiInput('');
    }
    setIsAnalyzing(false);
  };

  const handleCreateRequest = (type) => {
    const request = {
      id: `req_${Date.now()}`,
      type,
      status: 'pending',
      location: {
        lat: 6.369,
        lng: 2.428,
        address: 'Cotonou, Akpakpa - Quartier JAK'
      },
      estimatedTime: 30,
      estimatedCost: type === 'tire' ? 4500 : type === 'battery' ? 20000 : 15000,
      assignedMechanic: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setActiveRequest(request);
    setActiveTab('tracking');
  };

  const addVehicle = () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.plate) return;
    
    const vehicle = {
      id: `veh_${Date.now()}`,
      ...newVehicle,
      status: 'good',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      mileage: 0
    };
    
    
    setUserData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, vehicle]
    }));
    
    setNewVehicle({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      color: '',
      fuelType: 'gasoline'
    });
    setShowVehicleModal(false);
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'request', icon: Navigation, label: 'Nouvelle Aide' },
    { id: 'tracking', icon: Map, label: 'Suivi', badge: activeRequest ? 1 : null },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: 3 },
    { id: 'history', icon: FileText, label: 'Historique' },
    { id: 'vehicles', icon: Car, label: 'Mes Véhicules' },
    { id: 'payments', icon: CreditCard, label: 'Paiements' },
    { id: 'settings', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <div className={`flex h-full ${darkMode ? 'dark' : ''} bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col py-6 shrink-0 transition-colors duration-300">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Car size={24} />
          </div>
          <span className="font-bold text-xl hidden lg:block dark:text-white">{APP_NAME}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-lg' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden lg:block">{item.label}</span>
              {item.badge && activeTab !== item.id && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 p-0.5">
              <img src={userData.avatar} className="rounded-full bg-slate-200 dark:bg-slate-600" alt="avatar" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold dark:text-white">{userData.name}</p>
              <Badge variant={userData.subscription === 'gold' ? 'warning' : 'info'} size="sm">
                {userData.subscription.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium hidden lg:block">
              {darkMode ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={20} />
            <span className="font-medium hidden lg:block">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-8 shrink-0 transition-colors duration-300">
          <div>
            <h2 className="font-bold text-xl text-slate-800 dark:text-white">Bonjour, {userData.name.split(' ')[0]} !</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Votre abonnement {userData.subscription} est actif
              {userData.subscription === 'gold' && ' 🏆'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une aide..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-amber-500 dark:text-white"
              />
            </div>
            
            <button className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full relative hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Assistances" 
                    value="12" 
                    change={15} 
                    icon={Navigation}
                    color="amber"
                  />
                  <StatCard 
                    title="Dépenses" 
                    value="45.8K" 
                    change={-5} 
                    icon={DollarSign}
                    color="emerald"
                  />
                  <StatCard 
                    title="Garages" 
                    value="8" 
                    change={25} 
                    icon={Building}
                    color="blue"
                  />
                  <StatCard 
                    title="Satisfaction" 
                    value="4.8" 
                    change={2} 
                    icon={Star}
                    color="purple"
                  />
                </div>

                {/* AI Assistant Banner */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <div className="relative z-10 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="max-w-lg">
                        <Badge variant="warning" className="mb-4">
                          <Sparkles size={14} /> IA PRÉMIUM : Diagnostic Expert
                        </Badge>
                        <h3 className="text-3xl font-bold mb-4 leading-tight">
                          Des soucis avec votre véhicule ? Notre IA vous aide en 30 secondes
                        </h3>
                        <p className="text-slate-300 mb-6">
                          Décrivez les symptômes et recevez un diagnostic précis avec estimation de coût
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                          <Brain size={40} className="text-amber-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <textarea
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="Ex: Mon moteur fait un bruit bizarre quand j'accélère, et il y a une fumée bleue..."
                            className="w-full h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            size="lg"
                            icon={isAnalyzing ? Loader2 : Brain}
                            loading={isAnalyzing}
                            onClick={handleDeepDiagnosis}
                            disabled={!aiInput.trim() || isAnalyzing}
                            className="whitespace-nowrap"
                          >
                            {isAnalyzing ? 'Analyse...' : 'Analyser avec IA'}
                          </Button>
                          <Button
                            variant="outline"
                            size="md"
                            icon={Mic}
                            onClick={() => setAiInput(prev => prev + ' (test vocal)')}
                          >
                            Dictée vocale
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI Diagnosis Result */}
                {diagnosis && (
                  <Card className="animate-in fade-in slide-in-from-left-4 border-l-4 border-l-amber-500">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant={
                              diagnosis.severity === 'Critique' ? 'danger' : 
                              diagnosis.severity === 'Modéré' ? 'warning' : 'info'
                            } size="lg">
                              {diagnosis.severity}
                            </Badge>
                            <Badge variant="purple" size="lg">
                              <Clock size={12} /> {diagnosis.time_estimate}
                            </Badge>
                            <Badge variant="gray" size="lg">
                              Risque: {diagnosis.risk_level}
                            </Badge>
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {diagnosis.issue_title}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {diagnosis.recommended_action}
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl min-w-[180px]">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">
                            Estimation de coût
                          </p>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {diagnosis.estimated_cost}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Inclut main d'œuvre
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Safety Steps */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> Étapes de sécurité
                          </p>
                          <ul className="space-y-2">
                            {diagnosis.safety_steps.map((step, i) => (
                              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Parts Needed */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Package size={16} /> Pièces potentielles
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {diagnosis.parts_needed.map((part, i) => (
                              <Badge key={i} variant="gray" size="sm">
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Specialist */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Wrench size={16} /> Expert recommandé
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {diagnosis.mechanic_type}
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Search}
                            className="w-full"
                          >
                            Trouver un expert
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Recent Activities */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Activités récentes</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ChevronRight}
                      iconPosition="right"
                    >
                      Voir tout
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { 
                        id: 1, 
                        type: 'Pneu Crevé', 
                        date: 'Hier, 14:20', 
                        price: '4.500F', 
                        status: 'completed', 
                        mechanic: 'Moussa B.',
                        vehicle: 'Toyota Corolla'
                      },
                      { 
                        id: 2, 
                        type: 'Batterie à plat', 
                        date: '12 Jan 2024', 
                        price: '20.000F', 
                        status: 'completed', 
                        mechanic: 'Fatou D.',
                        vehicle: 'Renault Duster'
                      },
                      { 
                        id: 3, 
                        type: 'Diagnostic électronique', 
                        date: '10 Jan 2024', 
                        price: '8.000F', 
                        status: 'completed', 
                        mechanic: 'Koffi A.',
                        vehicle: 'Toyota Corolla'
                      }
                    ].map(item => (
                      <Card key={item.id} hover className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.type.includes('Pneu') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                              item.type.includes('Batterie') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}>
                              <Wrench size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{item.type}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.date} • {item.mechanic} • {item.vehicle}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-white">{item.price}</p>
                            <Badge variant={item.status === 'completed' ? 'success' : 'warning'} size="sm" className="mt-1">
                              {item.status === 'completed' ? 'Terminé' : 'En cours'}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Vehicle Fleet */}
                <Card>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-slate-800 dark:text-white">Mes véhicules</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => setShowVehicleModal(true)}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {userData.vehicles.map(vehicle => (
                        <div key={vehicle.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-amber-200 dark:hover:border-amber-700 transition-colors">
                          <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <Car size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {vehicle.plate} • {vehicle.color}
                                </p>
                              </div>
                              <Badge variant={
                                vehicle.status === 'excellent' ? 'success' :
                                vehicle.status === 'good' ? 'info' :
                                vehicle.status === 'needs_attention' ? 'warning' : 'danger'
                              } size="sm">
                                {vehicle.status === 'excellent' ? 'Parfait' :
                                 vehicle.status === 'good' ? 'Bon' :
                                 vehicle.status === 'needs_attention' ? 'Attention' : 'Critique'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> Prochaine révision: {vehicle.nextService}
                              </span>
                              <span className="flex items-center gap-1">
                                <Gauge size={12} /> {vehicle.mileage.toLocaleString()} km
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Coverage Map */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white">Couverture en direct</span>
                    <Badge variant="info">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        LIVE
                      </div>
                    </Badge>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
                    
                    {/* Simulated map points */}
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></div>
                    <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    
                    {/* User location */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-full border-2 border-amber-500 flex items-center justify-center animate-pulse">
                          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 w-12 h-12 bg-amber-500/10 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-xs text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span>Votre position</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Mécaniciens disponibles</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPin size={16} className="text-amber-500" />
                    Cotonou, Akpakpa - Quartier JAK
                  </div>
                </Card>

                {/* Subscription Card */}
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/30 border-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="warning" className="bg-white/20 backdrop-blur-sm border-white/30 mb-2">
                          <Award size={12} /> GOLD
                        </Badge>
                        <h4 className="text-xl font-bold">AutoAssist Gold</h4>
                      </div>
                      <div className="text-3xl">🏆</div>
                    </div>
                    <p className="text-sm opacity-90 mb-6">
                      Dépannage illimité, diagnostic IA Premium, et assistance 24/7 inclus pour 12 mois.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="opacity-80" />
                        <span>Assistance prioritaire</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="opacity-80" />
                        <span>Diagnostic IA avancé</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="opacity-80" />
                        <span>Couverture nationale</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mt-6 bg-white text-amber-600 hover:bg-slate-100"
                    >
                      Gérer l'abonnement
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* New Request Tab */}
          {activeTab === 'request' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/20">
                <Navigation size={48} className="text-white" />
              </div>
              
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Besoin d'assistance routière ?
              </h3>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl">
                Sélectionnez le type d'assistance dont vous avez besoin. Nous enverrons l'expert le plus proche de votre position.
              </p>
              
              <div className="w-full space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { type: 'tire', label: 'Pneu crevé', icon: Circle, color: 'amber' },
                    { type: 'battery', label: 'Batterie', icon: Battery, color: 'blue' },
                    { type: 'engine', label: 'Problème moteur', icon: Cpu, color: 'red' },
                    { type: 'fuel', label: 'Carburant', icon: Fuel, color: 'purple' },
                    { type: 'towing', label: 'Remorquage', icon: Truck, color: 'emerald' },
                    { type: 'other', label: 'Autre problème', icon: HelpCircle, color: 'gray' }
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => handleCreateRequest(item.type)}
                      className="group p-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col items-center gap-4"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <item.icon size={32} />
                      </div>
                      <span className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left">
                      <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
                        Assistance d'urgence 24/7
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Appelez notre centre d'appels pour une assistance immédiate
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="lg"
                      icon={PhoneCall}
                      className="whitespace-nowrap"
                    >
                      <span className="font-mono font-bold">Appeler le 1313</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && activeRequest && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Suivi de votre assistance
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Votre mécanicien est en route vers votre position
                  </p>
                </div>
                <Badge variant="info" size="lg">
                  <Clock size={14} /> 15-20 min
                </Badge>
              </div>
              
              <Card className="mb-8">
                <div className="p-8">
                  {/* Progress Steps */}
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2"></div>
                    
                    <div className="flex justify-between relative z-10">
                      {[
                        { status: 'Demande', icon: FileText, active: true },
                        { status: 'Assigné', icon: Users, active: true },
                        { status: 'En route', icon: Navigation, active: true },
                        { status: 'Arrivé', icon: MapPin, active: false },
                        { status: 'Terminé', icon: CheckCircle, active: false }
                      ].map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-4 ${
                            step.active 
                              ? 'bg-amber-500 border-white dark:border-slate-900 shadow-lg shadow-amber-500/50' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}>
                            <step.icon size={20} className={step.active ? 'text-white' : 'text-slate-400'} />
                          </div>
                          <span className={`text-sm font-bold ${step.active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                            {step.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mechanic Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} /> Votre mécanicien
                      </h4>
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa" 
                          className="w-16 h-16 rounded-full border-4 border-amber-500"
                          alt="mechanic"
                        />
                        <div>
                          <p className="font-bold text-xl text-slate-900 dark:text-white">Moussa B.</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">4.9</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">(124 missions)</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Spécialiste moteur et transmission • 5 ans d'expérience
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vehicle Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Car size={20} /> Véhicule concerné
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Car size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-xl text-slate-900 dark:text-white">
                            Toyota Corolla
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            ABC-1234 • Gris Métal
                          </p>
                          <Badge variant="warning" size="sm" className="mt-2">
                            Pneu crevé - avant droit
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Phone}
                      className="flex-1"
                    >
                      Appeler le mécanicien
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={MessageSquare}
                      className="flex-1"
                    >
                      Envoyer un message
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      icon={X}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Live Map */}
              <Card className="overflow-hidden">
                <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                  {/* Simulated map */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
                  
                  {/* User location */}
                  <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full border-4 border-amber-500 flex items-center justify-center animate-pulse">
                        <MapPin size={24} className="text-amber-500" />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">
                        Vous
                      </div>
                    </div>
                  </div>
                  
                  {/* Mechanic moving */}
                  <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                        <Car size={24} className="text-emerald-500" />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">
                        Moussa B. • 8 min
                      </div>
                    </div>
                  </div>
                  
                  {/* Route line */}
                  <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-amber-500/30 -translate-y-1/2">
                    <div className="h-full w-1/2 bg-gradient-to-r from-amber-500 to-transparent rounded-full"></div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Mes véhicules</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Gérez votre flotte de véhicules
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowVehicleModal(true)}
                >
                  Ajouter un véhicule
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.vehicles.map(vehicle => (
                  <Card key={vehicle.id} hover className="overflow-hidden">
                    <div className="relative">
                      {/* Vehicle Image/Placeholder */}
                      <div className="h-48 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        <Car size={64} className="text-slate-300 dark:text-slate-600" />
                        <div className="absolute top-4 right-4">
                          <Badge variant={
                            vehicle.status === 'excellent' ? 'success' :
                            vehicle.status === 'good' ? 'info' :
                            vehicle.status === 'needs_attention' ? 'warning' : 'danger'
                          }>
                            {vehicle.status === 'excellent' ? 'Parfait' :
                             vehicle.status === 'good' ? 'Bon' :
                             vehicle.status === 'needs_attention' ? 'À surveiller' : 'Attention'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                              {vehicle.brand} {vehicle.model}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {vehicle.year} • {vehicle.plate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {vehicle.color}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Vehicle Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Fuel size={16} className="text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">
                                {vehicle.fuelType === 'gasoline' ? 'Essence' :
                                 vehicle.fuelType === 'diesel' ? 'Diesel' :
                                 vehicle.fuelType === 'electric' ? 'Électrique' : 'Hybride'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge size={16} className="text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">
                                {vehicle.mileage.toLocaleString()} km
                              </span>
                            </div>
                          </div>
                          
                          {/* Service Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-400">
                                Prochaine révision
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {vehicle.nextService}
                              </span>
                            </div>
                            <ProgressBar 
                              value={30} 
                              max={100} 
                              color="emerald"
                            />
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-4">
                            <Button variant="ghost" size="sm" icon={Eye} className="flex-1">
                              Détails
                            </Button>
                            <Button variant="ghost" size="sm" icon={Edit} className="flex-1">
                              Modifier
                            </Button>
                            <Button variant="ghost" size="sm" icon={Calendar} className="flex-1">
                              RDV
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Paramètres</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User size={20} /> Profil utilisateur
                      </h4>
                      
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img 
                                src={userData.avatar} 
                                className="w-24 h-24 rounded-2xl border-4 border-slate-100 dark:border-slate-700"
                                alt="avatar"
                              />
                              <button className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition-colors">
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                  Nom complet
                                </label>
                                <input 
                                  type="text" 
                                  value={userData.name}
                                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                  Email
                                </label>
                                <input 
                                  type="email" 
                                  value={userData.email}
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                  disabled
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Numéro de téléphone
                              </label>
                              <input 
                                type="tel" 
                                value={userData.phone}
                                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button variant="primary" icon={Save}>
                            Enregistrer les modifications
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Notifications */}
                  <Card>
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell size={20} /> Notifications
                      </h4>
                      
                      <div className="space-y-4">
                        {Object.entries(userData.preferences.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white capitalize">
                                {key === 'sms' ? 'SMS' : key === 'email' ? 'Email' : 'Notifications push'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Recevoir des notifications par {key}
                              </p>
                            </div>
                            <button
                              onClick={() => setUserData({
                                ...userData,
                                preferences: {
                                  ...userData.preferences,
                                  notifications: {
                                    ...userData.preferences.notifications,
                                    [key]: !value
                                  }
                                }
                              })}
                              className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                                value ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                                value ? 'translate-x-7' : 'translate-x-1'
                              }`}></div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Preferences Sidebar */}
                <div className="space-y-8">
                  {/* Theme */}
                  <Card>
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                        Apparence
                      </h4>
                      
                      <div className="space-y-3">
                        {[
                          { value: 'light', label: 'Mode clair', icon: Sun },
                          { value: 'dark', label: 'Mode sombre', icon: Moon },
                          { value: 'auto', label: 'Automatique', icon: Monitor }
                        ].map(theme => (
                          <button
                            key={theme.value}
                            onClick={() => setDarkMode(theme.value === 'dark')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                              (theme.value === 'dark' && darkMode) || (theme.value === 'light' && !darkMode)
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <theme.icon size={20} />
                            <span className="font-medium">{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                  
                  {/* Language */}
                  <Card>
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                        Langue
                      </h4>
                      
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <span className="font-medium">Français</span>
                          <CheckCircle size={20} />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <span className="font-medium text-slate-700 dark:text-slate-300">English</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Security */}
                  <Card>
                    <div className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                        Sécurité
                      </h4>
                      
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Changer le mot de passe</span>
                          <ChevronRight size={20} className="text-slate-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <span className="font-medium text-slate-700 dark:text-slate-300">Authentification à deux facteurs</span>
                          <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-red-500">
                          <span className="font-medium">Supprimer le compte</span>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Vehicle Modal */}
        {showVehicleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <Card className="max-w-md w-full animate-in zoom-in">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Ajouter un véhicule
                  </h3>
                  <button
                    onClick={() => setShowVehicleModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Marque
                    </label>
                    <input 
                      type="text"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ex: Toyota"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Modèle
                      </label>
                      <input 
                        type="text"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Ex: Corolla"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Année
                      </label>
                      <select
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Immatriculation
                    </label>
                    <input 
                      type="text"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ex: ABC-1234"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Couleur
                      </label>
                      <input 
                        type="text"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Ex: Gris Métal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Carburant
                      </label>
                      <select
                        value={newVehicle.fuelType}
                        onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="gasoline">Essence</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Électrique</option>
                        <option value="hybrid">Hybride</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowVehicleModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={addVehicle}
                      disabled={!newVehicle.brand || !newVehicle.model || !newVehicle.plate}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

// 2. Enhanced Mechanic Dashboard
const MechanicDashboard = () => {
  const [online, setOnline] = useState(true);
  const [activeMission, setActiveMission] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 24500,
    week: 89000,
    month: 345000,
    total: 1245000
  });
  const [stats, setStats] = useState({
    completed: 124,
    rating: 4.9,
    responseTime: 8,
    satisfaction: 96
  });
  const [notifications, setNotifications] = useState(5);

  const missions = [
    {
      id: 'miss_001',
      type: 'Pneu crevé',
      client: 'Dr. Sarr',
      vehicle: 'Toyota Hilux',
      location: 'Dakar, Plateau',
      status: 'completed',
      price: 8000,
      duration: 45,
      rating: 5
    },
    {
      id: 'miss_002',
      type: 'Batterie à plat',
      client: 'Mme. Diop',
      vehicle: 'Renault Clio',
      location: 'Ouakam',
      status: 'in_progress',
      price: 20000,
      duration: 30,
      rating: null
    },
    {
      id: 'miss_003',
      type: 'Diagnostic moteur',
      client: 'M. Ndiaye',
      vehicle: 'Mercedes C200',
      location: 'Mermoz',
      status: 'pending',
      price: 15000,
      duration: null,
      rating: null
    }
  ];

  const handleAcceptMission = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    setActiveMission({...mission, status: 'accepted'});
  };

  const handleCompleteMission = () => {
    if (activeMission) {
      setEarnings(prev => ({
        ...prev,
        today: prev.today + activeMission.price
      }));
      setStats(prev => ({
        ...prev,
        completed: prev.completed + 1
      }));
      setActiveMission(null);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col py-6 backdrop-blur-md">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Wrench size={24} />
          </div>
          <span className="font-bold text-xl hidden lg:block">ProCenter</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Aperçu', active: true },
            { id: 'missions', icon: Briefcase, label: 'Missions', badge: missions.filter(m => m.status === 'pending').length },
            { id: 'earnings', icon: DollarSign, label: 'Revenus' },
            { id: 'clients', icon: Users, label: 'Clients' },
            { id: 'reviews', icon: Star, label: 'Avis' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'tools', icon: Settings, label: 'Outils' }
          ].map(item => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-slate-800/50 group"
            >
              <item.icon size={20} className="text-slate-400 group-hover:text-amber-500" />
              <span className="font-medium hidden lg:block text-slate-300 group-hover:text-white">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto px-4 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
              MB
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold">Moussa B.</p>
              <p className="text-xs text-slate-400">Expert Mécanicien</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-300">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                online 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
              }`}
              onClick={() => setOnline(!online)}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${online ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              {online ? 'DISPONIBLE • Recherche de missions' : 'HORS LIGNE'}
            </div>
            
            <div className="hidden lg:block text-sm text-slate-400">
              <span className="font-bold text-emerald-400">{stats.responseTime} min</span> de temps de réponse moyen
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Aujourd'hui</p>
              <p className="text-xl font-bold text-amber-500">{earnings.today.toLocaleString()}F</p>
            </div>
            
            <button className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors relative">
              <Bell size={20} className="text-slate-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>
            
            <button className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <Settings size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Missions terminées</p>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-amber-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={75} max={100} color="amber" label="Objectif mensuel" />
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Note moyenne</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-white">{stats.rating}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Star size={24} className="text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Basé sur {stats.completed} évaluations</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Satisfaction client</p>
                    <p className="text-3xl font-bold text-white">{stats.satisfaction}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Heart size={24} className="text-blue-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={stats.satisfaction} max={100} color="blue" />
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Revenus totaux</p>
                    <p className="text-3xl font-bold text-emerald-400">{earnings.total.toLocaleString()}F</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">+12% ce mois</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Missions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Mission */}
              {activeMission ? (
                <Card className="border-amber-500/50 border-2 animate-pulse">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <Badge variant="warning" className="mb-3">
                          <Bell size={12} /> MISSION ACTIVE
                        </Badge>
                        <h3 className="text-xl font-bold text-white">{activeMission.type}</h3>
                        <p className="text-slate-400 mt-1">
                          {activeMission.client} • {activeMission.vehicle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">{activeMission.price.toLocaleString()}F</p>
                        <p className="text-sm text-slate-400">Récompense</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                          <p className="text-sm text-slate-400 mb-1">Localisation</p>
                          <p className="font-bold text-white flex items-center gap-2">
                            <MapPin size={16} /> {activeMission.location}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                          <p className="text-sm text-slate-400 mb-1">Distance</p>
                          <p className="font-bold text-white">2.4 km</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/30 rounded-xl p-4">
                        <p className="text-sm text-slate-400 mb-3">Instructions du client</p>
                        <p className="text-white">
                          "Le véhicule est garé devant la pharmacie. La clé est sous le tapis avant droit."
                        </p>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button
                          variant="primary"
                          icon={Phone}
                          className="flex-1"
                        >
                          Appeler le client
                        </Button>
                        <Button
                          variant="success"
                          icon={CheckCircle}
                          className="flex-1"
                          onClick={handleCompleteMission}
                        >
                          Marquer comme terminé
                        </Button>
                        <Button
                          variant="outline"
                          icon={X}
                          onClick={() => setActiveMission(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                /* Missions List */
                <Card>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Missions disponibles</h3>
                      <Badge variant="info">{missions.length} disponibles</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {missions.map(mission => (
                        <div key={mission.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-white">{mission.type}</h4>
                                <Badge variant={
                                  mission.status === 'completed' ? 'success' :
                                  mission.status === 'in_progress' ? 'warning' : 'info'
                                } size="sm">
                                  {mission.status === 'completed' ? 'Terminé' :
                                   mission.status === 'in_progress' ? 'En cours' : 'En attente'}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400 mb-3">
                                {mission.client} • {mission.vehicle} • {mission.location}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-300 flex items-center gap-1">
                                  <DollarSign size={14} /> {mission.price.toLocaleString()}F
                                </span>
                                {mission.duration && (
                                  <span className="text-slate-300 flex items-center gap-1">
                                    <Clock size={14} /> {mission.duration} min
                                  </span>
                                )}
                                {mission.rating && (
                                  <span className="text-amber-400 flex items-center gap-1">
                                    <Star size={14} /> {mission.rating}.0
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {mission.status === 'pending' && online && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={CheckCircle}
                                  onClick={() => handleAcceptMission(mission.id)}
                                >
                                  Accepter
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Eye}
                              >
                                Détails
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Earnings Chart */}
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Revenus hebdomadaires</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[12000, 18000, 15000, 22000, 19000, 24000, 24500].map((amount, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${(amount / 25000) * 100}%` }}
                        ></div>
                        <span className="text-xs text-slate-400 mt-2">
                          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index]}
                        </span>
                        <span className="text-xs font-bold text-white mt-1">
                          {amount.toLocaleString()}F
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              {/* Online Status Card */}
              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      online ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {online ? (
                        <div className="relative">
                          <Radar size={32} className="text-amber-400 animate-spin" />
                          <div className="absolute inset-0 w-16 h-16 bg-amber-500/10 rounded-2xl animate-ping"></div>
                        </div>
                      ) : (
                        <Zap size={32} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {online ? 'Mode Radar Actif' : 'Mode Veille'}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {online ? 'Recherche de missions dans votre zone' : 'Activez pour recevoir des missions'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant={online ? 'outline' : 'primary'}
                    size="lg"
                    icon={online ? Moon : Sun}
                    onClick={() => setOnline(!online)}
                    className="w-full"
                  >
                    {online ? 'Mettre en veille' : 'Activer le radar'}
                  </Button>
                  
                  {online && (
                    <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">Zone de couverture</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">Dakar - 15km</span>
                        <Badge variant="success">Optimal</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Tools & Resources */}
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Outils rapides</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center gap-2">
                      <Calculator size={24} className="text-amber-400" />
                      <span className="text-sm font-medium text-white">Estimateur</span>
                    </button>
                    <button className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center gap-2">
                      <FileText size={24} className="text-blue-400" />
                      <span className="text-sm font-medium text-white">Factures</span>
                    </button>
                    <button className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center gap-2">
                      <Map size={24} className="text-emerald-400" />
                      <span className="text-sm font-medium text-white">Carte</span>
                    </button>
                    <button className="p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center gap-2">
                      <MessageSquare size={24} className="text-purple-400" />
                      <span className="text-sm font-medium text-white">Messages</span>
                    </button>
                  </div>
                </div>
              </Card>
              
              {/* Top Clients */}
              <Card children={undefined} onClick={undefined}>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Top Clients</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Dr. Sarr', visits: 8, total: 64000 },
                      { name: 'Mme. Diop', visits: 5, total: 45000 },
                      { name: 'M. Ndiaye', visits: 4, total: 32000 }
                    ].map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{client.name}</p>
                            <p className="text-xs text-slate-400">{client.visits} interventions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">{client.total.toLocaleString()}F</p>
                          <Badge variant="success" size="sm">Fidèle</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Landing Page
const LandingPage = ({ onRoleSelect }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const slides = [
    {
      title: "Dépannage intelligent, partout.",
      description: "L'assistance routière réinventée avec l'intelligence artificielle. Détection de pannes, dépannage en 15 min, et transparence totale sur les prix.",
      image: "🚗",
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "IA Expert Mécanique",
      description: "Notre intelligence artificielle analyse vos problèmes et vous guide vers la meilleure solution avec estimation de coût en temps réel.",
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
    { icon: Zap, title: "Rapide", description: "Intervention en moins de 30 minutes" },
    { icon: Shield, title: "Sécurisé", description: "Paiements sécurisés et garantie" },
    { icon: Brain, title: "Intelligent", description: "Diagnostic IA avancé" },
    { icon: DollarSign, title: "Transparent", description: "Prix fixes, pas de surprise" }
  ];

  const stats = [
    { value: "50K+", label: "Clients satisfaits" },
    { value: "500+", label: "Mécaniciens certifiés" },
    { value: "24/7", label: "Assistance disponible" },
    { value: "15min", label: "Temps moyen d'intervention" }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Car size={24} />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
                AutoAssist<span className="text-amber-500">.</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">Tarifs</a>
              <a href="#pro" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">Devenir Pro</a>
              <a href="#contact" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">Contact</a>
            </div>
            
            <Button
              variant="primary"
              onClick={() => onRoleSelect('client')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <Badge variant="warning" className="mb-6 animate-pulse">
                <Sparkles size={14} /> Solution #1 d'assistance en Afrique
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Dépannage intelligent,{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  partout.
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
                L'assistance routière réinventée avec l'intelligence artificielle. 
                Détection de pannes, dépannage en 15 min, et transparence totale sur les prix.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Navigation}
                  onClick={() => onRoleSelect('client')}
                  className="text-lg px-8 py-4"
                >
                  J'ai besoin d'aide
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={Wrench}
                  onClick={() => onRoleSelect('pro')}
                  className="text-lg px-8 py-4"
                >
                  Je suis dépanneur
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
                  {/* Simulated app preview */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Car size={24} className="text-amber-400" />
                        <span className="font-bold">AutoAssist Pro</span>
                      </div>
                      <Badge variant="warning">LIVE</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Navigation size={24} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="font-bold">Moussa B.</p>
                            <p className="text-sm text-slate-300">À 8 min • Expert Moteur</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400">4.500F</p>
                        </div>
                      </div>
                      
                      <div className="h-32 bg-black/20 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-amber-500/20 rounded-full border-2 border-amber-500 flex items-center justify-center mx-auto mb-3">
                            <Car size={24} className="text-amber-400" />
                          </div>
                          <p className="text-sm text-slate-300">Suivi en direct</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Pourquoi choisir AutoAssist ?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Une solution complète pour tous vos besoins d'assistance routière
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="p-6 text-center" children={undefined} onClick={undefined}>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Prêt à révolutionner votre expérience d'assistance ?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs satisfaits
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                variant="primary"
                size="lg"
                loading={loading}
                onClick={handleNewsletter}
                className="whitespace-nowrap" children={undefined} icon={undefined}              >
                S'inscrire gratuitement
              </Button>
            </div>
            
            <p className="text-sm text-slate-400 mt-4">
              Aucun spam. Désinscription à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Car size={24} />
                </div>
                <span className="font-black text-2xl">
                  AutoAssist<span className="text-amber-500">.</span>
                </span>
              </div>
              <p className="text-slate-400">
                L'assistance routière intelligente pour l'Afrique
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">CGU</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Carrières</a>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} AutoAssist. Tous droits réservés.</p>
            <p className="mt-2">Made with ❤️ for Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App Component
export default ClientDashboard;