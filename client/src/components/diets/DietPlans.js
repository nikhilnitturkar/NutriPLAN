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
  X
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
  const [exportingPlan, setExportingPlan] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Get clientId from URL parameters
  useEffect(() => {
    if (showModal === 'true') {
      setShowCreateModal(true);
    }
  }, [showModal, selectedClientId]);

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

      {/* Create Diet Plan Modal */}
      {showCreateModal && (
        <CreateDietPlanModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDietPlans();
          }}
          selectedClientId={selectedClientId}
        />
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

// Create Diet Plan Modal Component
const CreateDietPlanModal = ({ clients, onClose, onSuccess, selectedClientId = null }) => {
  const [formData, setFormData] = useState({
    clientId: selectedClientId || '',
    name: '',
    goal: '',
    dailyCalories: '',
    protein: '',
    carbs: '',
    fat: '',
    restrictions: '',
    supplements: '',
    hydrate: ''
  });
  const [showCalculator, setShowCalculator] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.name || !formData.dailyCalories) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/api/diets', formData);
      toast.success('Diet plan created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating diet plan:', error);
      toast.error('Failed to create diet plan');
    }
  };

  const getClientDataForCalculator = () => {
    const selectedClient = clients.find(c => c._id === formData.clientId);
    if (!selectedClient) return null;

    return {
      age: selectedClient.personalInfo.age,
      gender: selectedClient.personalInfo.gender,
      weight: selectedClient.fitnessData.currentWeight,
      height: selectedClient.fitnessData.height,
      activityLevel: selectedClient.activityLevel,
      goal: formData.goal
    };
  };

  const handleCaloriesCalculated = (calories) => {
    if (calories === null) {
      setShowCalculator(false);
    } else {
      setFormData({ ...formData, dailyCalories: calories });
      setShowCalculator(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 lg:p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-bold text-white">Create New Diet Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
              Client *
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.personalInfo.name}
                </option>
              ))}
            </select>
          </div>

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

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
              Daily Calories *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="dailyCalories"
                value={formData.dailyCalories}
                onChange={handleInputChange}
                className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter daily calories"
                required
              />
              <button
                type="button"
                onClick={() => setShowCalculator(true)}
                disabled={!formData.clientId}
                className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-colors"
              >
                <Calculator className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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

          <div className="flex gap-3 lg:gap-4 pt-4 lg:pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg lg:rounded-xl font-medium transition-all text-xs lg:text-sm"
            >
              Create Diet Plan
            </button>
          </div>
        </div>
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

export default DietPlans; 