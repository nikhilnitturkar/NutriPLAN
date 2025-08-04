import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit, Trash2, Users, Target, Sparkles, Activity, Info, TrendingUp, ArrowDown, ArrowUp, Minus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const DietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDietPlan, setEditingDietPlan] = useState(null);
  
  // Get clientId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const selectedClientId = urlParams.get('clientId');
  const showModal = urlParams.get('showModal');

  useEffect(() => {
    fetchDietPlans();
    fetchClients();
  }, []);

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
      toast.error('Failed to load diet plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    
    try {
      await api.delete(`/api/diets/${id}`);
      toast.success('Diet plan deleted successfully');
      fetchDietPlans();
    } catch (error) {
      toast.error('Failed to delete diet plan');
    }
  };

  const handleExport = async (plan) => {
    try {
      const response = await api.get(`/api/diets/${plan._id}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const clientName = plan.clientId?.personalInfo?.name || getClientName(plan) || 'client';
      link.setAttribute('download', `diet-plan-${clientName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleEdit = (plan) => {
    setEditingDietPlan(plan);
    setShowEditModal(true);
  };

  // Edit Diet Plan Modal Component
  const EditDietPlanModal = ({ dietPlan, clients, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      name: dietPlan.name || '',
      clientId: dietPlan.clientId?._id || dietPlan.clientId || '',
      goal: dietPlan.goal || 'Weight Loss',
      dailyCalories: dietPlan.dailyCalories || '',
      description: dietPlan.description || '',
      restrictions: dietPlan.restrictions || '',
      supplements: dietPlan.supplements || '',
      hydration: dietPlan.hydration || '',
      isActive: dietPlan.isActive !== undefined ? dietPlan.isActive : true,
      dailyMeals: dietPlan.dailyMeals || []
    });
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      
      try {
        await api.put(`/api/diets/${dietPlan._id}`, formData);
        toast.success('Diet plan updated successfully!');
        onSuccess();
      } catch (error) {
        console.error('Error updating diet plan:', error);
        toast.error('Failed to update diet plan');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Diet Plan</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter plan name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Performance">Performance</option>
                  <option value="General Health">General Health</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Calories
                </label>
                <input
                  type="number"
                  name="dailyCalories"
                  value={formData.dailyCalories}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter daily calories"
                  required
                  min="800"
                  max="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter plan description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dietary Restrictions
              </label>
              <textarea
                name="restrictions"
                value={formData.restrictions}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter dietary restrictions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recommended Supplements
              </label>
              <textarea
                name="supplements"
                value={formData.supplements}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter recommended supplements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hydration Guidelines
              </label>
              <textarea
                name="hydration"
                value={formData.hydration}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter hydration guidelines"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
              />
              <label className="ml-2 text-sm text-gray-300">
                Active Plan
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getClientName = (dietPlan) => {
    // Use populated client data from the diet plan
    if (dietPlan.clientId && typeof dietPlan.clientId === 'object') {
      return dietPlan.clientId.personalInfo?.name || 'Unknown Client';
    }
    // Fallback to local clients array if populated data is not available
    const clientId = typeof dietPlan.clientId === 'string' ? dietPlan.clientId : dietPlan.clientId?._id;
    const client = clients.find(c => c._id === clientId);
    return client?.personalInfo?.name || 'Unknown Client';
  };

  const filteredPlans = dietPlans.filter(plan => {
    const clientName = getClientName(plan);
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.goal?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGoal === 'all' || plan.goal === filterGoal;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Diet Plans</h1>
          <p className="text-gray-400 mt-1">Manage and create personalized nutrition plans</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <select
            value={filterGoal}
            onChange={(e) => setFilterGoal(e.target.value)}
            className="px-6 py-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="all">All Goals</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New Plan
          </button>
          {selectedClientId && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-sm text-red-300">
                  Creating diet plan for: {clients.find(c => c._id === selectedClientId)?.personalInfo?.name || 'Selected Client'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diet Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan._id} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {getClientName(plan)}
                  </h3>
                  <p className="text-sm text-gray-400">{plan.goal}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-medium ${
                  plan.goal === 'Weight Loss' ? 'bg-red-900/30 text-red-400 border border-red-700/30' :
                  plan.goal === 'Muscle Gain' ? 'bg-purple-900/30 text-purple-400 border border-purple-700/30' :
                  'bg-green-900/30 text-green-400 border border-green-700/30'
                }`}>
                  {plan.goal}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Daily Calories:</span>
                  <span className="font-semibold text-white">{plan.dailyCalories} cal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Protein:</span>
                  <span className="font-semibold text-white">{plan.protein}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Carbs:</span>
                  <span className="font-semibold text-white">{plan.carbs}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Fat:</span>
                  <span className="font-semibold text-white">{plan.fat}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Meals:</span>
                  <span className="font-semibold text-white">{plan.dailyMeals?.length || 0} meals</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExport(plan)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <Link
                  to={`/diet-plans/${plan._id}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => handleEdit(plan)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No diet plans found</h3>
          <p className="text-gray-400 mb-6">Create your first diet plan to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create First Plan
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

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

      {showEditModal && editingDietPlan && (
        <EditDietPlanModal
          dietPlan={editingDietPlan}
          clients={clients}
          onClose={() => {
            setShowEditModal(false);
            setEditingDietPlan(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingDietPlan(null);
            fetchDietPlans();
          }}
        />
      )}
    </div>
  );
};

// Create Diet Plan Modal Component
const CreateDietPlanModal = ({ clients, onClose, onSuccess, selectedClientId = null }) => {
  const [step, setStep] = useState(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate'
  });
  const [calculatedCalories, setCalculatedCalories] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedCalorieOption, setSelectedCalorieOption] = useState(null);
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
    hydration: '',
    dailyMeals: []
  });

  // Auto-fill calculator data when client is selected
  useEffect(() => {
    if (formData.clientId) {
      const selectedClient = clients.find(c => c._id === formData.clientId);
      if (selectedClient) {
        const age = calculateAge(selectedClient.personalInfo.dateOfBirth);
        setCalculatorData({
          age: age.toString(),
          gender: selectedClient.personalInfo.gender || 'male',
          weight: selectedClient.fitnessData.currentWeight?.toString() || '',
          height: selectedClient.fitnessData.height?.toString() || '',
          activityLevel: selectedClient.activityLevel || 'moderate'
        });
      }
    }
  }, [formData.clientId, clients]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25; // Default age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const [currentMeal, setCurrentMeal] = useState({
    mealType: '',
    description: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const activityMultipliers = {
    sedentary: { value: 1.2, label: 'Sedentary (little or no exercise)' },
    lightly: { value: 1.375, label: 'Lightly active (light exercise 1-3 days/week)' },
    moderate: { value: 1.55, label: 'Moderately active (moderate exercise 3-5 days/week)' },
    very: { value: 1.725, label: 'Very active (hard exercise 6-7 days/week)' },
    extremely: { value: 1.9, label: 'Extremely active (very hard exercise, physical job)' }
  };

  const goalOptions = {
    extreme_loss: { label: 'Extreme Weight Loss', adjustment: -1000, description: '~2 lbs/week loss', icon: 'ArrowDown', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    aggressive_loss: { label: 'Aggressive Weight Loss', adjustment: -750, description: '~1.5 lbs/week loss', icon: 'ArrowDown', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    moderate_loss: { label: 'Moderate Weight Loss', adjustment: -500, description: '~1 lb/week loss', icon: 'ArrowDown', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    mild_loss: { label: 'Mild Weight Loss', adjustment: -250, description: '~0.5 lb/week loss', icon: 'ArrowDown', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    maintenance: { label: 'Maintenance', adjustment: 0, description: 'Maintain current weight', icon: 'Minus', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    mild_gain: { label: 'Mild Weight Gain', adjustment: 250, description: '~0.5 lb/week gain', icon: 'ArrowUp', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    moderate_gain: { label: 'Moderate Weight Gain', adjustment: 500, description: '~1 lb/week gain', icon: 'ArrowUp', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    aggressive_gain: { label: 'Aggressive Weight Gain', adjustment: 750, description: '~1.5 lbs/week gain', icon: 'ArrowUp', color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMealInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMeal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculatorInputChange = (e) => {
    const { name, value } = e.target;
    setCalculatorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBMR = (gender, weight, height, age) => {
    // Harris-Benedict Equation
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr, activityLevel) => {
    // Safely get activity multiplier with fallback to moderate
    const multiplier = activityMultipliers[activityLevel]?.value || activityMultipliers.moderate.value;
    return bmr * multiplier;
  };

  const calculateMacros = (calories) => {
    return {
      protein: Math.round((calories * 0.25) / 4), // 25% protein
      carbs: Math.round((calories * 0.45) / 4),   // 45% carbs
      fat: Math.round((calories * 0.30) / 9)      // 30% fat
    };
  };

  const handleCalculateCalories = () => {
    try {
      const { gender, age, weight, height, activityLevel } = calculatorData;
      
      if (!age || !weight || !height) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate numeric inputs
      const ageNum = parseFloat(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      
      if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
        toast.error('Please enter valid numbers for age, weight, and height');
        return;
      }

      const bmr = calculateBMR(gender, weightNum, heightNum, ageNum);
      const tdee = calculateTDEE(bmr, activityLevel);

      // Calculate all calorie options
      const calorieOptions = Object.entries(goalOptions).map(([key, option]) => ({
        key,
        ...option,
        calories: Math.round(tdee + option.adjustment),
        weeklyChange: option.adjustment * 7 / 3500, // 3500 calories = 1 lb
        macronutrients: calculateMacros(Math.round(tdee + option.adjustment))
      }));

      const result = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorieOptions,
        selectedOption: null
      };

      setCalculatedCalories(result);
      setShowResults(true);
      setSelectedCalorieOption(null);
    } catch (error) {
      console.error('Error calculating calories:', error);
      toast.error('An error occurred while calculating calories. Please check your inputs and try again.');
    }
  };

  const handleCalorieOptionSelect = (option) => {
    setSelectedCalorieOption(option);
  };

  const applyCalculatedCalories = (calories) => {
    setFormData(prev => ({
      ...prev,
      dailyCalories: calories.toString()
    }));
    setShowCalculator(false);
    calculateFormMacros();
  };

  const resetCalculator = () => {
    setCalculatorData({
      age: '',
      gender: 'male',
      weight: '',
      height: '',
      activityLevel: 'moderate'
    });
    setCalculatedCalories(null);
    setShowResults(false);
    setSelectedCalorieOption(null);
  };

  const addMeal = () => {
    if (!currentMeal.mealType || !currentMeal.description) {
      toast.error('Please fill in meal type and description');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      dailyMeals: [...prev.dailyMeals, { ...currentMeal }]
    }));
    
    setCurrentMeal({
      mealType: '',
      description: '',
      ingredients: '',
      instructions: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    
    toast.success('Meal added successfully!');
  };

  const removeMeal = (index) => {
    setFormData(prev => ({
      ...prev,
      dailyMeals: prev.dailyMeals.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.clientId) {
      toast.error('Please select a client first');
      return;
    }

    if (!formData.name) {
      toast.error('Please enter a diet plan name');
      return;
    }

    if (!formData.goal) {
      toast.error('Please select a goal');
      return;
    }

    if (!formData.dailyCalories) {
      toast.error('Please enter daily calories');
      return;
    }

    try {
      await api.post('/api/diets', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating diet plan:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create diet plan');
      }
    }
  };

  const calculateFormMacros = () => {
    const calories = parseInt(formData.dailyCalories) || 0;
    if (calories > 0) {
      const protein = Math.round((calories * 0.25) / 4); // 25% protein
      const carbs = Math.round((calories * 0.45) / 4);   // 45% carbs
      const fat = Math.round((calories * 0.30) / 9);     // 30% fat
      
      setFormData(prev => ({
        ...prev,
        protein: protein.toString(),
        carbs: carbs.toString(),
        fat: fat.toString()
      }));
    }
  };

  const selectedClient = clients.find(c => c._id === formData.clientId);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="p-8 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create New Diet Plan</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-white/50"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center mt-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= stepNumber ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                      step > stepNumber ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 1: Select Client & Basic Information</h3>
                
                {/* Client Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-white/20">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h4>
                  {clients.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No clients available</p>
                      <Link
                        to="/clients/add"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Add New Client
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clients.map(client => (
                        <div
                          key={client._id}
                          onClick={() => setFormData(prev => ({ ...prev, clientId: client._id }))}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.clientId === client._id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{client.personalInfo?.name}</h5>
                              <p className="text-sm text-gray-600">{client.personalInfo?.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedClient && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Client: {selectedClient.personalInfo?.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Diet Plan Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Summer Weight Loss Plan"
                          className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Goal</label>
                        <select
                          name="goal"
                          value={formData.goal}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select goal</option>
                          <option value="Weight Loss">Weight Loss</option>
                          <option value="Muscle Gain">Muscle Gain</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Performance">Performance</option>
                          <option value="General Health">General Health</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Daily Calories</label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            name="dailyCalories"
                            value={formData.dailyCalories}
                            onChange={handleInputChange}
                            placeholder="e.g., 2000"
                            className="flex-1 px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCalculator(true)}
                            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <Target className="w-5 h-5" />
                            Calculator
                          </button>
                        </div>
                        {formData.clientId && (
                          <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <Info className="w-4 h-4 inline mr-2" />
                            Client data will be auto-filled in the calculator
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={calculateFormMacros}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Calculate Macros
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Protein (g)</label>
                        <input
                          type="number"
                          name="protein"
                          value={formData.protein}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Carbs (g)</label>
                        <input
                          type="number"
                          name="carbs"
                          value={formData.carbs}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Fat (g)</label>
                        <input
                          type="number"
                          name="fat"
                          value={formData.fat}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 2: Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</label>
                    <textarea
                      name="restrictions"
                      value={formData.restrictions}
                      onChange={handleInputChange}
                      placeholder="e.g., No dairy, gluten-free"
                      rows="4"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Supplements</label>
                    <textarea
                      name="supplements"
                      value={formData.supplements}
                      onChange={handleInputChange}
                      placeholder="e.g., Protein powder, multivitamin"
                      rows="4"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Hydration Guidelines</label>
                  <textarea
                    name="hydration"
                    value={formData.hydration}
                    onChange={handleInputChange}
                    placeholder="e.g., Drink 8-10 glasses of water daily"
                    rows="4"
                    className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 3: Daily Meals</h3>
                
                {/* Add Meal Form */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-white/20">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Add Meal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Meal Type</label>
                      <select
                        name="mealType"
                        value={currentMeal.mealType}
                        onChange={handleMealInputChange}
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select meal type</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Morning Snack">Morning Snack</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Afternoon Snack">Afternoon Snack</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Evening Snack">Evening Snack</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Calories</label>
                      <input
                        type="number"
                        name="calories"
                        value={currentMeal.calories}
                        onChange={handleMealInputChange}
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={currentMeal.description}
                      onChange={handleMealInputChange}
                      placeholder="e.g., Grilled chicken with quinoa"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Ingredients</label>
                      <textarea
                        name="ingredients"
                        value={currentMeal.ingredients}
                        onChange={handleMealInputChange}
                        placeholder="List ingredients"
                        rows="4"
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Instructions</label>
                      <textarea
                        name="instructions"
                        value={currentMeal.instructions}
                        onChange={handleMealInputChange}
                        placeholder="Cooking instructions"
                        rows="4"
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Protein (g)</label>
                      <input
                        type="number"
                        name="protein"
                        value={currentMeal.protein}
                        onChange={handleMealInputChange}
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Carbs (g)</label>
                      <input
                        type="number"
                        name="carbs"
                        value={currentMeal.carbs}
                        onChange={handleMealInputChange}
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Fat (g)</label>
                      <input
                        type="number"
                        name="fat"
                        value={currentMeal.fat}
                        onChange={handleMealInputChange}
                        className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addMeal}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Add Meal
                  </button>
                </div>

                {/* Meals List */}
                {formData.dailyMeals.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Added Meals ({formData.dailyMeals.length})</h4>
                    <div className="space-y-4">
                      {formData.dailyMeals.map((meal, index) => (
                        <div key={index} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{meal.mealType}</h5>
                            <button
                              onClick={() => removeMeal(index)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{meal.description}</p>
                          <div className="flex gap-6 text-sm text-gray-500">
                            <span className="font-medium">{meal.calories} cal</span>
                            <span className="font-medium">{meal.protein}g protein</span>
                            <span className="font-medium">{meal.carbs}g carbs</span>
                            <span className="font-medium">{meal.fat}g fat</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-white/20">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 border border-white/20 text-gray-700 rounded-xl font-medium hover:bg-white/50 transition-all duration-300"
                >
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="ml-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Diet Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calorie Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-8 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Calorie Calculator</h2>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-white/50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-600" />
                    Personal Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                    <select
                      name="gender"
                      value={calculatorData.gender}
                      onChange={handleCalculatorInputChange}
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Age (years)</label>
                    <input
                      type="number"
                      name="age"
                      value={calculatorData.age}
                      onChange={handleCalculatorInputChange}
                      min="15"
                      max="80"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={calculatorData.weight}
                      onChange={handleCalculatorInputChange}
                      min="30"
                      max="300"
                      step="0.1"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., 70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={calculatorData.height}
                      onChange={handleCalculatorInputChange}
                      min="100"
                      max="250"
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., 170"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    Activity Level
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Activity Level</label>
                    <select
                      name="activityLevel"
                      value={calculatorData.activityLevel}
                      onChange={handleCalculatorInputChange}
                      className="w-full px-6 py-4 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {Object.entries(activityMultipliers).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-white/20">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">How it works:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• BMR calculated using Harris-Benedict equation</li>
                          <li>• TDEE = BMR × Activity multiplier</li>
                          <li>• Choose your goal from the calorie options below</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleCalculateCalories}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
                >
                  <Target className="w-5 h-5" />
                  Calculate Calories
                </button>
                <button
                  onClick={resetCalculator}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {showResults && calculatedCalories && (
                <div className="mt-8 space-y-8">
                  {/* BMR and TDEE Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-white/20">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <Target className="h-6 w-6 text-green-600" />
                      Your Metabolic Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">BMR</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {calculatedCalories.bmr.toLocaleString()} cal
                        </div>
                        <div className="text-sm text-gray-500">Basal Metabolic Rate</div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">TDEE</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {calculatedCalories.tdee.toLocaleString()} cal
                        </div>
                        <div className="text-sm text-gray-500">Total Daily Energy Expenditure</div>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Options Chart */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-white/20">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      Choose Your Goal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {calculatedCalories.calorieOptions.map((option) => {
                        const isSelected = selectedCalorieOption?.key === option.key;
                        
                        return (
                          <div
                            key={option.key}
                            onClick={() => handleCalorieOptionSelect(option)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                              isSelected 
                                ? `${option.borderColor} ${option.bgColor} shadow-lg` 
                                : 'border-white/20 bg-white/80 backdrop-blur-sm hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                option.adjustment < 0 ? 'bg-red-100' : option.adjustment > 0 ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                {option.adjustment < 0 ? (
                                  <ArrowDown className={`h-4 w-4 ${option.color}`} />
                                ) : option.adjustment > 0 ? (
                                  <ArrowUp className={`h-4 w-4 ${option.color}`} />
                                ) : (
                                  <Minus className={`h-4 w-4 ${option.color}`} />
                                )}
                              </div>
                              <span className={`text-sm font-medium ${option.color}`}>
                                {option.label}
                              </span>
                            </div>
                            
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              {option.calories.toLocaleString()} cal
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-4">
                              {option.description}
                            </div>

                            {/* Weekly Change */}
                            <div className="text-sm text-gray-500 mb-4">
                              {option.adjustment > 0 ? '+' : ''}{option.adjustment} cal/day
                              <br />
                              ~{option.adjustment > 0 ? '+' : ''}{option.weeklyChange.toFixed(1)} lbs/week
                            </div>

                            {/* Macronutrients Preview */}
                            <div className="text-sm text-gray-500">
                              <div className="flex justify-between">
                                <span>P: {option.macronutrients.protein}g</span>
                                <span>C: {option.macronutrients.carbs}g</span>
                                <span>F: {option.macronutrients.fat}g</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedCalorieOption && (
                      <div className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Selected: {selectedCalorieOption.label}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedCalorieOption.calories.toLocaleString()} calories per day
                            </p>
                          </div>
                          <button
                            onClick={() => applyCalculatedCalories(selectedCalorieOption.calories)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <Target className="w-5 h-5" />
                            Use This Plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Diet Plan Modal Component */}
      <EditDietPlanModal
        dietPlan={editingDietPlan}
        clients={clients}
        onClose={() => {
          setShowEditModal(false);
          setEditingDietPlan(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setEditingDietPlan(null);
          fetchDietPlans();
        }}
      />
    </>
  );
};

export default DietPlans; 