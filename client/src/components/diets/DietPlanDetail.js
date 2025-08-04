import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2, User, Target, Clock, Droplets, Pill, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const DietPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchDietPlan = useCallback(async () => {
    try {
      const response = await api.get(`/api/diets/${id}`);
      setDietPlan(response.data);
      
      // Fetch client details
      if (response.data.clientId) {
        // Handle both populated client object and client ID string
        const clientId = typeof response.data.clientId === 'object' ? response.data.clientId._id : response.data.clientId;
        if (clientId) {
          try {
            const clientResponse = await api.get(`/api/clients/${clientId}`);
            setClient(clientResponse.data);
          } catch (clientError) {
            console.error('Failed to fetch client details:', clientError);
            // If client fetch fails, use the populated data if available
            if (typeof response.data.clientId === 'object') {
              setClient(response.data.clientId);
            }
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load diet plan');
      navigate('/diet-plans');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDietPlan();
  }, [fetchDietPlan]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    
    try {
      await api.delete(`/api/diets/${id}`);
      toast.success('Diet plan deleted successfully');
      navigate('/diet-plans');
    } catch (error) {
      toast.error('Failed to delete diet plan');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/api/diets/${id}/pdf`, {
        responseType: 'blob'
      });

      // Check if the response is actually a PDF or HTML
      const contentType = response.headers['content-type'];
      const isPDF = contentType && contentType.includes('application/pdf');
      const isHTML = contentType && contentType.includes('text/html');

      if (isPDF) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const clientName = client?.personalInfo?.name || 'client';
        link.setAttribute('download', `diet-plan-${clientName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('PDF exported successfully!');
      } else if (isHTML) {
        // Handle HTML fallback
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
        const link = document.createElement('a');
        link.href = url;
        const clientName = client?.personalInfo?.name || 'client';
        link.setAttribute('download', `diet-plan-${clientName}.html`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('HTML version exported (PDF generation failed)');
      } else {
        // Try to read error message from response
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            toast.error(`Export failed: ${errorData.message || 'Unknown error'}`);
          } catch {
            toast.error('Export failed: Unable to generate PDF');
          }
        };
        reader.readAsText(response.data);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (error.response?.status === 500) {
        toast.error('Server error: PDF generation failed');
      } else if (error.response?.status === 404) {
        toast.error('Diet plan not found');
      } else {
        toast.error('Failed to export PDF. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="text-center py-12 bg-black min-h-screen flex items-center justify-center">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">Diet plan not found</h3>
          <Link to="/diet-plans" className="text-red-500 hover:text-red-400 transition-colors">
            Back to Diet Plans
          </Link>
        </div>
      </div>
    );
  }

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'Weight Loss': return 'bg-red-900/20 text-red-400 border-red-800';
      case 'Muscle Gain': return 'bg-purple-900/20 text-purple-400 border-purple-800';
      case 'Maintenance': return 'bg-green-900/20 text-green-400 border-green-800';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  return (
    <div className="p-3 lg:p-6 max-w-6xl mx-auto bg-black min-h-screen">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 gap-4 lg:gap-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              to="/diet-plans"
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white">Diet Plan Details</h1>
              <p className="text-xs lg:text-sm text-gray-400">Complete nutrition plan for {client?.personalInfo?.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-xs lg:text-sm"
            >
              <Download className="w-4 h-4 lg:w-5 lg:h-5" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <Link
              to={`/diet-plans/edit/${id}`}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-xs lg:text-sm"
            >
              <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
              Edit Plan
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-xs lg:text-sm"
            >
              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-8">
          {/* Client Information */}
          <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="p-2 lg:p-3 bg-red-600 rounded-lg">
                <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">Client Information</h2>
            </div>
            
            {client && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <h3 className="font-medium text-white mb-3 lg:mb-4 text-sm lg:text-base">Personal Details</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Name:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.personalInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Age:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.personalInfo?.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Gender:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.personalInfo?.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Height:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessData?.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Current Weight:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessData?.currentWeight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Target Weight:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessData?.targetWeight || 'Not set'} kg</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3 lg:mb-4 text-sm lg:text-base">Fitness Goals</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Primary Goal:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessGoals?.primaryGoal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Activity Level:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.activityLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs lg:text-sm">Experience Level:</span>
                      <span className="font-medium text-white text-xs lg:text-sm">{client.experienceLevel}</span>
                    </div>
                    {client.fitnessData?.bodyFatPercentage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs lg:text-sm">Body Fat %:</span>
                        <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessData.bodyFatPercentage}%</span>
                      </div>
                    )}
                    {client.fitnessData?.muscleMass && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs lg:text-sm">Muscle Mass:</span>
                        <span className="font-medium text-white text-xs lg:text-sm">{client.fitnessData.muscleMass} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diet Plan Information */}
          <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="p-2 lg:p-3 bg-purple-600 rounded-lg">
                <Target className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">Diet Plan Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <h3 className="font-medium text-white mb-3 lg:mb-4 text-sm lg:text-base">Plan Details</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Plan Name:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">{dietPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Goal:</span>
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${getGoalColor(dietPlan.goal)}`}>
                      {dietPlan.goal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Daily Calories:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">{dietPlan.dailyCalories?.toLocaleString()} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Status:</span>
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                      dietPlan.isActive 
                        ? 'bg-green-900/20 text-green-400 border border-green-800' 
                        : 'bg-gray-900/20 text-gray-400 border border-gray-800'
                    }`}>
                      {dietPlan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Created:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">
                      {new Date(dietPlan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-3 lg:mb-4 text-sm lg:text-base">Macronutrients</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Protein:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">{dietPlan.macronutrients?.protein || dietPlan.protein || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Carbohydrates:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">{dietPlan.macronutrients?.carbs || dietPlan.carbs || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs lg:text-sm">Fat:</span>
                    <span className="font-medium text-white text-xs lg:text-sm">{dietPlan.macronutrients?.fat || dietPlan.fat || 0}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Meals */}
          <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="p-2 lg:p-3 bg-green-600 rounded-lg">
                <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">Daily Meals</h2>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              {dietPlan.dailyMeals?.map((meal, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <h3 className="font-semibold text-red-400 text-sm lg:text-base">{meal.mealType}</h3>
                    <span className="text-xs lg:text-sm text-gray-400">{meal.calories || 0} cal</span>
                  </div>
                  
                  <div className="mb-2 lg:mb-3">
                    <h4 className="font-medium text-white text-sm lg:text-base mb-1">{meal.name}</h4>
                    {meal.description && (
                      <p className="text-gray-400 text-xs lg:text-sm">{meal.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 lg:gap-4 text-xs lg:text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Protein</div>
                      <div className="font-medium text-white">{meal.protein || 0}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Carbs</div>
                      <div className="font-medium text-white">{meal.carbs || 0}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Fat</div>
                      <div className="font-medium text-white">{meal.fat || 0}g</div>
                    </div>
                  </div>
                  
                  {meal.ingredients && (
                    <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-700">
                      <h5 className="text-xs lg:text-sm font-medium text-gray-300 mb-1">Ingredients:</h5>
                      <p className="text-gray-400 text-xs lg:text-sm">{meal.ingredients}</p>
                    </div>
                  )}
                  
                  {meal.instructions && (
                    <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-700">
                      <h5 className="text-xs lg:text-sm font-medium text-gray-300 mb-1">Instructions:</h5>
                      <p className="text-gray-400 text-xs lg:text-sm">{meal.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          {(dietPlan.restrictions || dietPlan.supplements || dietPlan.hydration) && (
            <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="p-2 lg:p-3 bg-yellow-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
                <h2 className="text-lg lg:text-xl font-semibold text-white">Additional Information</h2>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                {dietPlan.restrictions && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2 text-sm lg:text-base">
                      <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
                      Dietary Restrictions
                    </h3>
                    <p className="text-gray-400 text-xs lg:text-sm">{dietPlan.restrictions}</p>
                  </div>
                )}
                
                {dietPlan.supplements && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2 text-sm lg:text-base">
                      <Pill className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                      Supplements
                    </h3>
                    <p className="text-gray-400 text-xs lg:text-sm">{dietPlan.supplements}</p>
                  </div>
                )}
                
                {dietPlan.hydration && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2 text-sm lg:text-base">
                      <Droplets className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                      Hydration
                    </h3>
                    <p className="text-gray-400 text-xs lg:text-sm">{dietPlan.hydration}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Stats */}
          <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Quick Stats</h3>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs lg:text-sm">Total Meals</span>
                <span className="font-semibold text-white text-xs lg:text-sm">{dietPlan.dailyMeals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs lg:text-sm">Daily Calories</span>
                <span className="font-semibold text-white text-xs lg:text-sm">{dietPlan.dailyCalories?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs lg:text-sm">Protein</span>
                <span className="font-semibold text-white text-xs lg:text-sm">{dietPlan.macronutrients?.protein || dietPlan.protein || 0}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs lg:text-sm">Carbs</span>
                <span className="font-semibold text-white text-xs lg:text-sm">{dietPlan.macronutrients?.carbs || dietPlan.carbs || 0}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs lg:text-sm">Fat</span>
                <span className="font-semibold text-white text-xs lg:text-sm">{dietPlan.macronutrients?.fat || dietPlan.fat || 0}g</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Actions</h3>
            <div className="space-y-2 lg:space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-medium flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 text-xs lg:text-sm"
              >
                <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <Link
                to={`/diet-plans/edit/${id}`}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-medium flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 text-xs lg:text-sm"
              >
                <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                Edit Plan
              </Link>
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-medium flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 text-xs lg:text-sm"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanDetail; 