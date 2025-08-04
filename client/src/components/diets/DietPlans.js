import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  X,
  Users,
  Target,
  Calculator,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

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
      const response = await api.get(`/api/diets/${plan._id}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `diet-plan-${plan.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleEdit = (plan) => {
    // Navigate to diet plans page with edit parameter
    navigate(`/diet-plans?edit=${plan._id}`);
  };

  useEffect(() => {
    fetchDietPlans();
    fetchClients();
    setLoading(false);
  }, []);

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
                <Target className="w-5 h-5 text-red-400 mr-2" />
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Daily Calories</span>
                  <span className="text-white font-semibold">{plan.dailyCalories?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Protein</span>
                  <span className="text-white font-semibold">{plan.protein || 'N/A'}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Carbs</span>
                  <span className="text-white font-semibold">{plan.carbs || 'N/A'}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Fat</span>
                  <span className="text-white font-semibold">{plan.fat || 'N/A'}g</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleExport(plan)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
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
    hydration: '',
    dailyMeals: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.name || !formData.dailyCalories) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/api/diets', formData);
      toast.success('Diet plan created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating diet plan:', error);
      toast.error('Failed to create diet plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Create New Diet Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
              Goal
            </label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fat (g)
              </label>
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
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

          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg font-medium transition-all"
            >
              Create Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlans; 