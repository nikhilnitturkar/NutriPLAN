import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Search,
  Target,
  Calculator,
  X,
  ArrowLeft,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import CalorieCalculator from './CalorieCalculator';

const DietPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const showModal = urlParams.get('showModal');
  const selectedClientId = urlParams.get('clientId');

  const [dietPlans, setDietPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [calculatedCalories, setCalculatedCalories] = useState(null);
  const [exportingPlan, setExportingPlan] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Get clientId from URL parameters
  useEffect(() => {
    if (showModal === 'true') {
      setShowCreateModal(true);
      if (selectedClientId) {
        const client = clients.find(c => c._id === selectedClientId);
        if (client) {
          setSelectedClient(client);
          setCurrentStep(2);
        }
      }
    }
  }, [showModal, selectedClientId, clients]);

  const fetchDietPlans = async () => {
    try {
      const response = await api.get('/api/diets');
      setDietPlans(response.data);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      toast.error('Failed to load diet plans');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      try {
        await api.delete(`/api/diets/${id}`);
        toast.success('Diet plan deleted successfully!');
        fetchDietPlans();
      } catch (error) {
        console.error('Error deleting diet plan:', error);
        toast.error('Failed to delete diet plan');
      }
    }
  };

  const handleExport = async (plan) => {
    try {
      setExportingPlan(plan._id);
      setExportProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await api.get(`/api/diets/${plan._id}/export`, {
        responseType: 'blob'
      });
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `diet-plan-${plan.name}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setExportingPlan(null);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error exporting diet plan:', error);
      toast.error('Failed to export diet plan');
      setExportingPlan(null);
      setExportProgress(0);
    }
  };

  const handleEdit = (plan) => {
    navigate(`/diet-plans/edit/${plan._id}`);
  };

  const getClientName = (dietPlan) => {
    if (dietPlan.clientId && typeof dietPlan.clientId === 'object') {
      return dietPlan.clientId.personalInfo?.name || 'Unknown Client';
    }
    const client = clients.find(c => c._id === dietPlan.clientId);
    return client?.personalInfo?.name || 'Unknown Client';
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setCurrentStep(2);
  };

  const handleCaloriesCalculated = (calories) => {
    setCalculatedCalories(calories);
    setCurrentStep(3);
  };

  const handleBackToCalculator = () => {
    setCurrentStep(2);
  };

  const handleBackToClientSelect = () => {
    setCurrentStep(1);
    setSelectedClient(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCurrentStep(1);
    setSelectedClient(null);
    setCalculatedCalories(null);
  };

  useEffect(() => {
    fetchDietPlans();
    fetchClients();
    setLoading(false);
  }, []);

  const filteredDietPlans = dietPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(plan).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGoal === 'all' || plan.goal === filterGoal;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/95 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div>
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-white">Diet Plans</h1>
              <p className="mt-1 text-xs lg:text-sm text-gray-400">
                Manage and create personalized nutrition plans
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Create New Plan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-4 lg:py-8 px-3 sm:px-4 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search diet plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Goals</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Performance">Performance</option>
                <option value="General Health">General Health</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diet Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredDietPlans.map((plan) => (
            <div key={plan._id} className="bg-gray-900/95 rounded-lg lg:rounded-xl p-4 lg:p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="text-sm lg:text-base font-semibold text-white truncate">{plan.name}</h3>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button
                    onClick={() => handleExport(plan)}
                    disabled={exportingPlan === plan._id}
                    className="p-1 lg:p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Export PDF"
                  >
                    {exportingPlan === plan._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-red-500"></div>
                    ) : (
                      <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-1 lg:p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-1 lg:p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                  <span className="text-gray-300">{plan.goal}</span>
                </div>
                <div className="text-gray-400">
                  <span>Client: </span>
                  <span className="text-white">{getClientName(plan)}</span>
                </div>
                <div className="text-gray-400">
                  <span>Calories: </span>
                  <span className="text-white">{plan.dailyCalories} kcal</span>
                </div>
                {plan.dailyMeals && plan.dailyMeals.length > 0 && (
                  <div className="text-gray-400">
                    <span>Meals: </span>
                    <span className="text-white">{plan.dailyMeals.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDietPlans.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No diet plans found</h3>
            <p className="text-sm text-gray-400">
              {searchTerm || filterGoal !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first diet plan to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Multi-Step Create Diet Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-white">Create New Diet Plan</h2>
                  <p className="text-xs lg:text-sm text-gray-400 mt-1">
                    Step {currentStep} of 3
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-4 lg:mt-6">
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full text-xs lg:text-sm font-medium ${
                    currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    1
                  </div>
                  <div className={`w-8 lg:w-12 h-0.5 ${
                    currentStep >= 2 ? 'bg-red-600' : 'bg-gray-700'
                  }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full text-xs lg:text-sm font-medium ${
                    currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    2
                  </div>
                  <div className={`w-8 lg:w-12 h-0.5 ${
                    currentStep >= 3 ? 'bg-red-600' : 'bg-gray-700'
                  }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full text-xs lg:text-sm font-medium ${
                    currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    3
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-4 lg:p-6">
              {currentStep === 1 && (
                <Step1ClientSelection 
                  clients={clients} 
                  onClientSelect={handleClientSelect}
                />
              )}
              
              {currentStep === 2 && (
                <Step2Calculator 
                  selectedClient={selectedClient}
                  onCaloriesCalculated={handleCaloriesCalculated}
                  onBack={handleBackToClientSelect}
                />
              )}
              
              {currentStep === 3 && (
                <Step3DietPlanForm 
                  selectedClient={selectedClient}
                  calculatedCalories={calculatedCalories}
                  onBack={handleBackToCalculator}
                  onSuccess={handleCloseModal}
                  onRefresh={fetchDietPlans}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Progress Modal */}
      {exportingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-800 p-6 lg:p-8 max-w-md w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Exporting PDF</h3>
              <p className="text-sm lg:text-base text-gray-400 mb-4">Please wait while we generate your diet plan...</p>
              
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-400">{Math.round(exportProgress)}% complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 1: Client Selection
const Step1ClientSelection = ({ clients, onClientSelect }) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <h3 className="text-lg lg:text-xl font-semibold text-white">Step 1: Select Client</h3>
      <p className="text-sm text-gray-400">
        Choose the client for whom you want to create the diet plan.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clients.map(client => (
          <button
            key={client._id}
            onClick={() => onClientSelect(client)}
            className="flex items-center justify-start p-3 lg:p-4 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-left text-xs lg:text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <Users className="w-5 h-5 mr-3 text-gray-400" />
            {client.personalInfo.name}
          </button>
        ))}
      </div>
      {clients.length === 0 && (
        <p className="text-sm text-gray-400 text-center">No clients found. Please add clients first.</p>
      )}
    </div>
  );
};

// Step 2: Calorie Calculator
const Step2Calculator = ({ selectedClient, onCaloriesCalculated, onBack }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(null);

  const handleCaloriesCalculated = (calories) => {
    if (calories === null) {
      setShowCalculator(false);
    } else {
      setCalculatedCalories(calories);
      setShowCalculator(false);
    }
  };

  const getClientDataForCalculator = () => {
    if (!selectedClient) return null;

    return {
      age: selectedClient.personalInfo.age,
      gender: selectedClient.personalInfo.gender,
      weight: selectedClient.fitnessData.currentWeight,
      height: selectedClient.fitnessData.height,
      activityLevel: selectedClient.activityLevel,
      goal: 'maintenance' // Default goal for calculator
    };
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <h3 className="text-lg lg:text-xl font-semibold text-white">Step 2: Calorie Calculation</h3>
      <p className="text-sm text-gray-400">
        Calculate the daily calorie needs for {selectedClient?.personalInfo.name}.
      </p>

      <div className="bg-gray-800 rounded-lg lg:rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h4 className="text-sm lg:text-base font-semibold text-white">Client Information</h4>
            <p className="text-xs lg:text-sm text-gray-400">
              {selectedClient?.personalInfo.name} - {selectedClient?.personalInfo.age} years old
            </p>
          </div>
          <button
            onClick={() => setShowCalculator(true)}
            className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 transition-colors"
          >
            <Calculator className="w-4 h-4 lg:w-5 lg:h-5" />
            Calculate Calories
          </button>
        </div>

        {calculatedCalories && (
          <div className="bg-gray-700 rounded-lg lg:rounded-xl p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-400">Calculated Daily Calories</p>
                <p className="text-lg lg:text-xl font-bold text-white">{calculatedCalories} kcal</p>
              </div>
              <button
                onClick={() => setCalculatedCalories(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 lg:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onCaloriesCalculated(calculatedCalories)}
          disabled={!calculatedCalories}
          className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg lg:rounded-xl font-medium transition-all text-xs lg:text-sm"
        >
          Continue to Step 3
        </button>
      </div>

      {/* Calorie Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white">Calorie Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <CalorieCalculator
              clientData={getClientDataForCalculator()}
              onCalculate={handleCaloriesCalculated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Step 3: Diet Plan Form
const Step3DietPlanForm = ({ selectedClient, calculatedCalories, onBack, onSuccess, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    protein: '',
    carbs: '',
    fat: '',
    restrictions: '',
    supplements: '',
    hydrate: '',
    dailyMeals: [] // Array to hold meal objects
  });
  const [showMealForm, setShowMealForm] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');
  const [newMealCarbs, setNewMealCarbs] = useState('');
  const [newMealFat, setNewMealFat] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();
    if (newMealName && newMealProtein !== '' && newMealCarbs !== '' && newMealFat !== '') {
      setFormData(prev => ({
        ...prev,
        dailyMeals: [...prev.dailyMeals, {
          name: newMealName,
          protein: parseFloat(newMealProtein),
          carbs: parseFloat(newMealCarbs),
          fat: parseFloat(newMealFat)
        }]
      }));
      setNewMealName('');
      setNewMealProtein('');
      setNewMealCarbs('');
      setNewMealFat('');
      setShowMealForm(false);
    } else {
      toast.error('Please fill in all meal details.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient || !formData.name || !formData.goal || calculatedCalories === null) {
      toast.error('Please fill in all required fields and calculate calories.');
      return;
    }

    const dietPlanData = {
      clientId: selectedClient._id,
      name: formData.name,
      goal: formData.goal,
      dailyCalories: calculatedCalories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      restrictions: formData.restrictions,
      supplements: formData.supplements,
      hydrate: formData.hydrate,
      dailyMeals: formData.dailyMeals
    };

    try {
      await api.post('/api/diets', dietPlanData);
      toast.success('Diet plan created successfully!');
      onSuccess();
      onRefresh();
    } catch (error) {
      console.error('Error creating diet plan:', error);
      toast.error('Failed to create diet plan');
    }
  };

  const handleBackToCalculator = () => {
    onBack(); // Use the onBack prop
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <h3 className="text-lg lg:text-xl font-semibold text-white">Step 3: Create Diet Plan</h3>
      <p className="text-sm text-gray-400">
        Fill in the details for the {formData.goal} diet plan for {selectedClient?.personalInfo.name}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Plan Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter plan name"
            required
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Goal *
          </label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select a goal</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Performance">Performance</option>
            <option value="General Health">General Health</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Daily Calories *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="dailyCalories"
              value={calculatedCalories}
              className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter daily calories"
              required
              disabled
            />
            <button
              type="button"
              onClick={handleBackToCalculator}
              className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Protein (g)
          </label>
          <input
            type="number"
            name="protein"
            value={formData.protein}
            onChange={handleInputChange}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter protein"
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Carbs (g)
          </label>
          <input
            type="number"
            name="carbs"
            value={formData.carbs}
            onChange={handleInputChange}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter carbs"
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Fat (g)
          </label>
          <input
            type="number"
            name="fat"
            value={formData.fat}
            onChange={handleInputChange}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter fat"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Dietary Restrictions
          </label>
          <textarea
            name="restrictions"
            value={formData.restrictions}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Any dietary restrictions or allergies..."
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Supplements
          </label>
          <textarea
            name="supplements"
            value={formData.supplements}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Recommended supplements..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
          Hydration Guidelines
        </label>
        <textarea
          name="hydrate"
          value={formData.hydrate}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Hydration recommendations..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
            Daily Meals
          </label>
          <button
            type="button"
            onClick={() => setShowMealForm(true)}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-colors"
          >
            Add New Meal
          </button>
          <div className="mt-4 space-y-3">
            {formData.dailyMeals.map((meal, index) => (
              <div key={index} className="bg-gray-800 rounded-lg lg:rounded-xl p-3 lg:p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm lg:text-base font-semibold text-white">{meal.name}</h4>
                  <p className="text-xs text-gray-400">
                    Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fat: {meal.fat}g
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, dailyMeals: prev.dailyMeals.filter((_, i) => i !== index) }))}
                  className="p-1 lg:p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove Meal"
                >
                  <X className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 lg:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg lg:rounded-xl font-medium transition-all text-xs lg:text-sm"
        >
          Create Diet Plan
        </button>
      </div>

      {/* Meal Form Modal */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-800 max-w-md w-full p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white">Add New Meal</h3>
              <button
                onClick={() => setShowMealForm(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleMealSubmit} className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  name="newMealName"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter meal name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    name="newMealProtein"
                    value={newMealProtein}
                    onChange={(e) => setNewMealProtein(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter protein"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    name="newMealCarbs"
                    value={newMealCarbs}
                    onChange={(e) => setNewMealCarbs(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter carbs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    name="newMealFat"
                    value={newMealFat}
                    onChange={(e) => setNewMealFat(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter fat"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => setShowMealForm(false)}
                  className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg lg:rounded-xl font-medium transition-colors text-xs lg:text-sm"
                >
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlans; 