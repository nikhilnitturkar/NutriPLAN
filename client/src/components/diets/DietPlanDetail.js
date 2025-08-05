import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2, User, Target, Clock, Droplets, Pill, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import ExportProgressModal from '../common/ExportProgressModal';
import useExportProgress from '../../hooks/useExportProgress';

const DietPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { exporting, exportProgress, showExportModal, handleExportWithProgress } = useExportProgress();

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
    const exportFunction = async () => {
      // Try PDF export first with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for PDFKit
        
        const response = await api.get(`/api/diets/${id}/pdf`, {
          responseType: 'blob',
          signal: controller.signal,
          timeout: 30000 // Also set axios timeout
        });
        
        clearTimeout(timeoutId);
        
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
      } catch (pdfError) {
        console.error('PDF export failed:', pdfError);
        
        // If PDF fails, try HTML export as fallback
        if (pdfError.name === 'AbortError' || pdfError.code === 'ECONNABORTED') {
          toast.error('PDF generation timed out. Trying HTML export...');
          
          const htmlResponse = await api.get(`/api/diets/${id}/html`, {
            responseType: 'blob'
          });
          
          const url = window.URL.createObjectURL(new Blob([htmlResponse.data]));
          const link = document.createElement('a');
          link.href = url;
          const clientName = client?.personalInfo?.name || 'client';
          link.setAttribute('download', `diet-plan-${clientName}.html`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          toast.success('HTML exported successfully! (PDF generation failed)');
        } else {
          throw pdfError; // Re-throw other errors
        }
      }
    };

    try {
      await handleExportWithProgress(exportFunction);
    } catch (error) {
      console.error('Export error:', error);
      
      // Provide more specific error messages for export
      if (error.response) {
        const { status } = error.response;
        
        if (status === 404) {
          toast.error('Diet plan not found. It may have been deleted.');
        } else if (status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (status === 403) {
          toast.error('You do not have permission to export this diet plan.');
        } else if (status === 500) {
          toast.error('Export generation failed. Please try again later.');
        } else {
          toast.error('Failed to export. Please try again.');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.name === 'AbortError') {
        toast.error('Export timed out. Please try again or contact support.');
      } else {
        // Other error
        toast.error('An unexpected error occurred while exporting. Please try again.');
      }
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
    <>
      <ExportProgressModal 
        show={showExportModal} 
        progress={exportProgress}
        title="Exporting PDF..."
        message="Please wait while we generate your diet plan PDF."
      />
      <div className="p-6 max-w-6xl mx-auto bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/diet-plans"
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Diet Plan Details</h1>
              <p className="text-gray-400">Complete nutrition plan for {client?.personalInfo?.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export PDF'}</span>
              <span className="sm:hidden">{exporting ? 'Exporting...' : 'Export'}</span>
            </button>
            <Link
              to={`/diet-plans/edit/${id}`}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              <Edit className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Edit Plan</span>
              <span className="sm:hidden">Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Client Information */}
          <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Client Information</h2>
            </div>
            
            {client && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-4">Personal Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-medium text-white">{client.personalInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <span className="font-medium text-white">{client.personalInfo?.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span className="font-medium text-white">{client.personalInfo?.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Height:</span>
                      <span className="font-medium text-white">{client.fitnessData?.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Weight:</span>
                      <span className="font-medium text-white">{client.fitnessData?.currentWeight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Weight:</span>
                      <span className="font-medium text-white">{client.fitnessData?.targetWeight || 'Not set'} kg</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-4">Fitness Goals</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Primary Goal:</span>
                      <span className="font-medium text-white">{client.fitnessGoals?.primaryGoal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Activity Level:</span>
                      <span className="font-medium text-white">{client.activityLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience Level:</span>
                      <span className="font-medium text-white">{client.experienceLevel}</span>
                    </div>
                    {client.fitnessData?.bodyFatPercentage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Body Fat %:</span>
                        <span className="font-medium text-white">{client.fitnessData.bodyFatPercentage}%</span>
                      </div>
                    )}
                    {client.fitnessData?.muscleMass && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Muscle Mass:</span>
                        <span className="font-medium text-white">{client.fitnessData.muscleMass} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diet Plan Information */}
          <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Diet Plan Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-white mb-4">Plan Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Name:</span>
                    <span className="font-medium text-white">{dietPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goal:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getGoalColor(dietPlan.goal)}`}>
                      {dietPlan.goal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Calories:</span>
                    <span className="font-medium text-white">{dietPlan.dailyCalories?.toLocaleString()} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dietPlan.isActive 
                        ? 'bg-green-900/20 text-green-400 border border-green-800' 
                        : 'bg-gray-900/20 text-gray-400 border border-gray-800'
                    }`}>
                      {dietPlan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="font-medium text-white">
                      {new Date(dietPlan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-4">Macronutrients</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protein:</span>
                    <span className="font-medium text-white">{dietPlan.macronutrients?.protein || dietPlan.protein || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carbohydrates:</span>
                    <span className="font-medium text-white">{dietPlan.macronutrients?.carbs || dietPlan.carbs || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fat:</span>
                    <span className="font-medium text-white">{dietPlan.macronutrients?.fat || dietPlan.fat || 0}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Meals */}
          <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Daily Meals</h2>
            </div>
            
            <div className="space-y-4">
              {dietPlan.dailyMeals?.map((meal, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-red-400">{meal.mealType}</h3>
                    <span className="text-sm text-gray-400">{meal.calories || 0} cal</span>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-white mb-1">{meal.name}</h4>
                    {meal.description && (
                      <p className="text-gray-400 text-sm">{meal.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
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
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Ingredients:</h5>
                      <p className="text-gray-400 text-sm">{meal.ingredients}</p>
                    </div>
                  )}
                  
                  {meal.instructions && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Instructions:</h5>
                      <p className="text-gray-400 text-sm">{meal.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          {(dietPlan.restrictions || dietPlan.supplements || dietPlan.hydration) && (
            <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Additional Information</h2>
              </div>
              
              <div className="space-y-4">
                {dietPlan.restrictions && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Dietary Restrictions
                    </h3>
                    <p className="text-gray-400">{dietPlan.restrictions}</p>
                  </div>
                )}
                
                {dietPlan.supplements && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-blue-400" />
                      Supplements
                    </h3>
                    <p className="text-gray-400">{dietPlan.supplements}</p>
                  </div>
                )}
                
                {dietPlan.hydration && (
                  <div>
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      Hydration
                    </h3>
                    <p className="text-gray-400">{dietPlan.hydration}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Meals</span>
                <span className="font-semibold text-white">{dietPlan.dailyMeals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Daily Calories</span>
                <span className="font-semibold text-white">{dietPlan.dailyCalories?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Protein</span>
                <span className="font-semibold text-white">{dietPlan.macronutrients?.protein || dietPlan.protein || 0}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Carbs</span>
                <span className="font-semibold text-white">{dietPlan.macronutrients?.carbs || dietPlan.carbs || 0}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fat</span>
                <span className="font-semibold text-white">{dietPlan.macronutrients?.fat || dietPlan.fat || 0}g</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <Link
                to={`/diet-plans/edit/${id}`}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                Edit Plan
              </Link>
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default DietPlanDetail; 