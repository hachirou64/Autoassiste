"use client";

import { Head } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';

// Import Components
import { DashboardTab } from '@/components/meca/dashboard-tab';
import { Header } from '@/components/meca/header';
import { NewRequestTab } from '@/components/meca/request-tab';
import { SettingsTab } from '@/components/meca/settings-tab';
import { Sidebar } from '@/components/meca/sidebar';
import { TrackingTab } from '@/components/meca/tracking-tab';

// Import Types
import type { UserData, Vehicle, AiDiagnosis, ServiceRequest } from '@/components/meca/types';
import { VehiclesTab } from '@/components/meca/vehicles-tab';

// Configuration
const API_KEY = "";
const APP_NAME = "AutoAssist Pro";
const APP_VERSION = "2.0.0";

// Mock Data
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
    { id: 'pm_001', type: 'card', lastFour: '4242', isDefault: true },
    { id: 'pm_002', type: 'mobile_money', lastFour: '7890', isDefault: false }
  ],
  preferences: {
    notifications: { sms: true, email: true, push: true },
    language: 'fr',
    theme: 'auto'
  }
});

// Main Client Dashboard Component
const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState<UserData>(generateMockUser());
  const [notifications, setNotifications] = useState(3);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AiDiagnosis | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    color: '',
    fuelType: 'gasoline'
  });

  // Handlers
  const handleDeepDiagnosis = useCallback(async () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);

    // Simulate API call
    setTimeout(() => {
      const mockDiagnosis: AiDiagnosis = {
        issue_title: 'Problème de moteur détecté',
        severity: 'Modéré',
        risk_level: 'Moyen',
        time_estimate: '45-60 min',
        estimated_cost: '25.000-35.000F',
        recommended_action: 'Votre véhicule nécessite un diagnostic complet du moteur par un expert qualifié.',
        safety_steps: [
          'Éteignez le moteur immédiatement',
          'Laissez refroidir pendant 15-20 minutes',
          'Vérifiez le niveau d\'huile et coolant',
          'N\'utilisez pas le véhicule avant le diagnostic'
        ],
        parts_needed: ['Bougies d\'allumage', 'Filtre à air', 'Liquide de refroidissement'],
        mechanic_type: 'Mécanicien moteur spécialisé'
      };
      setDiagnosis(mockDiagnosis);
      setIsAnalyzing(false);
    }, 2000);
  }, [aiInput]);

  const handleCreateRequest = (type: string) => {
    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      type: type as any,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTime: 20,
      location: 'Dakar, Plateau'
    };
    setActiveRequest(newRequest);
    setActiveTab('tracking');
  };

  const addVehicle = () => {
    if (newVehicle.brand && newVehicle.model && newVehicle.plate) {
      const vehicle: Vehicle = {
        id: `veh_${Date.now()}`,
        ...newVehicle,
        year: Number(newVehicle.year),
        status: 'good',
        lastService: new Date().toISOString().split('T')[0],
        nextService: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mileage: 0
      };
      setUserData(prev => ({ ...prev, vehicles: [...prev.vehicles, vehicle] }));
      setShowVehicleModal(false);
      setNewVehicle({ brand: '', model: '', year: new Date().getFullYear(), plate: '', color: '', fuelType: 'gasoline' });
    }
  };

  return (
    <>
      <Head title="AutoAssist Pro - Tableau de Bord" />

      <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300`}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userData={userData}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          activeRequest={!!activeRequest}
          notifications={notifications}
          setShowVehicleModal={setShowVehicleModal}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            userName={userData.name}
            subscription={userData.subscription}
            notifications={notifications}
            onSettingsClick={() => setActiveTab('settings')}
          />

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'dashboard' && (
              <DashboardTab
                userData={userData}
                aiInput={aiInput}
                setAiInput={setAiInput}
                isAnalyzing={isAnalyzing}
                handleDeepDiagnosis={handleDeepDiagnosis}
                diagnosis={diagnosis}
                setShowVehicleModal={setShowVehicleModal}
              />
            )}

            {activeTab === 'request' && (
              <NewRequestTab onCreateRequest={handleCreateRequest} />
            )}

            {activeTab === 'tracking' && activeRequest && (
              <TrackingTab request={activeRequest} />
            )}

            {activeTab === 'vehicles' && (
              <VehiclesTab
                vehicles={userData.vehicles}
                onAddVehicle={() => setShowVehicleModal(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                userData={userData}
                setUserData={setUserData}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            )}
          </div>
        </main>
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Ajouter un véhicule
              </h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                ✕
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
                  onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
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
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
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
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
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
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
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
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
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
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}
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
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addVehicle}
                  disabled={!newVehicle.brand || !newVehicle.model || !newVehicle.plate}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientDashboard;
