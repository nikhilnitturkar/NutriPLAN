import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Utensils,
  Target,
  Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import CalorieCalculator from './CalorieCalculator';

const AddDietPlan = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [currentMeal, setCurrentMeal] = useState({});
  const [showCalculator, setShowCalculator] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const watchGoal = watch('goal');
  const watchDailyCalories = watch('dailyCalories');
  const watchClientId = watch('clientId');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const calculateMacros = (calories, goal) => {
    let proteinRatio, fatRatio, carbRatio;
    
    switch (goal) {
      case 'Weight Loss':
        proteinRatio = 0.35; // 35% protein
        fatRatio = 0.30;     // 30% fat
        carbRatio = 0.35;    // 35% carbs
        break;
      case 'Muscle Gain':
        proteinRatio = 0.30; // 30% protein
        fatRatio = 0.25;     // 25% fat
        carbRatio = 0.45;    // 45% carbs
        break;
      case 'Maintenance':
        proteinRatio = 0.25; // 25% protein
        fatRatio = 0.30;     // 30% fat
        carbRatio = 0.45;    // 45% carbs
        break;
      case 'Performance':
        proteinRatio = 0.25; // 25% protein
        fatRatio = 0.20;     // 20% fat
        carbRatio = 0.55;    // 55% carbs
        break;
      default:
        proteinRatio = 0.25;
        fatRatio = 0.30;
        carbRatio = 0.45;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
      fat: Math.round((calories * fatRatio) / 9),         // 9 cal per gram
      carbs: Math.round((calories * carbRatio) / 4)       // 4 cal per gram
    };
  };

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    setSelectedClient(client);
    setValue('clientId', clientId);
  };

  const handleCaloriesCalculated = (calories) => {
    if (calories === null) {
      // Close calculator
      setShowCalculator(false);
    } else {
      setValue('dailyCalories', calories);
      setShowCalculator(false);
      toast.success(`Daily calories set to ${calories.toLocaleString()}`);
    }
  };

  const getClientDataForCalculator = () => {
    if (!selectedClient) return null;
    
    return {
      gender: selectedClient.personalInfo?.gender?.toLowerCase() || 'male',
      age: selectedClient.personalInfo?.age || '',
      weight: selectedClient.fitnessData?.weight || '',
      height: selectedClient.fitnessData?.height || '',
      activityLevel: selectedClient.activityLevel?.toLowerCase() || 'moderate'
    };
  };

  const addMeal = () => {
    setCurrentMeal({
      mealType: 'Breakfast',
      name: '',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: '',
      instructions: ''
    });
    setShowMealForm(true);
  };

  const saveMeal = () => {
    const meals = watch('dailyMeals') || [];
    meals.push(currentMeal);
    setValue('dailyMeals', meals);
    setShowMealForm(false);
    setCurrentMeal({});
    toast.success('Meal added successfully');
  };

  const removeMeal = (index) => {
    const meals = watch('dailyMeals') || [];
    meals.splice(index, 1);
    setValue('dailyMeals', meals);
    toast.success('Meal removed');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/diets', data);
      toast.success('Diet plan created successfully!');
      navigate('/diet-plans');
    } catch (error) {
      console.error('Error creating diet plan:', error);
      const message = error.response?.data?.message || 'Failed to create diet plan';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/95 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center py-4 lg:py-6">
            <button
              onClick={() => navigate('/diet-plans')}
              className="mr-3 lg:mr-4 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-white">Create New Diet Plan</h1>
              <p className="mt-1 text-xs lg:text-sm text-gray-400">
                Design a personalized nutrition plan for your client
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto py-4 lg:py-8 px-3 sm:px-4 lg:px-8">
        <div className="bg-gray-900/95 shadow-xl rounded-xl lg:rounded-2xl border border-gray-800 p-4 lg:p-8">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Diet Plan Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Plan name is required' })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter plan name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                  Client *
                </label>
                <select
                  {...register('clientId', { required: 'Client is required' })}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.personalInfo.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-xs text-red-400">{errors.clientId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                  Goal *
                </label>
                <select
                  {...register('goal', { required: 'Goal is required' })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select goal</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Performance">Performance</option>
                  <option value="General Health">General Health</option>
                </select>
                {errors.goal && (
                  <p className="mt-1 text-xs text-red-400">{errors.goal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                  Daily Calories *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    {...register('dailyCalories', { 
                      required: 'Daily calories are required',
                      min: { value: 800, message: 'Calories must be at least 800' },
                      max: { value: 5000, message: 'Calories must be less than 5000' }
                    })}
                    className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter daily calories"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalculator(true)}
                    className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs lg:text-sm font-medium transition-colors"
                  >
                    <Calculator className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
                {errors.dailyCalories && (
                  <p className="mt-1 text-xs text-red-400">{errors.dailyCalories.message}</p>
                )}
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

            {/* Macronutrients */}
            {watchDailyCalories && watchGoal && (
              <div className="space-y-4 lg:space-y-6">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-4 lg:mb-6">Macronutrients</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  <div className="bg-gray-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700">
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Protein (g)</label>
                    <input
                      type="number"
                      {...register('protein')}
                      value={calculateMacros(watchDailyCalories, watchGoal).protein}
                      onChange={(e) => setValue('protein', e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700">
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Carbohydrates (g)</label>
                    <input
                      type="number"
                      {...register('carbs')}
                      value={calculateMacros(watchDailyCalories, watchGoal).carbs}
                      onChange={(e) => setValue('carbs', e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700">
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Fat (g)</label>
                    <input
                      type="number"
                      {...register('fat')}
                      value={calculateMacros(watchDailyCalories, watchGoal).fat}
                      onChange={(e) => setValue('fat', e.target.value)}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Meal Form */}
            {showMealForm && (
              <div className="bg-gray-800/50 rounded-lg lg:rounded-xl p-4 lg:p-6 border border-gray-700">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-4 lg:mb-6">Add Meal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Meal Type *
                    </label>
                    <select
                      value={currentMeal.mealType || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, mealType: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select meal type</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Meal Name *
                    </label>
                    <input
                      type="text"
                      value={currentMeal.name || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, name: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter meal name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={currentMeal.calories || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, calories: parseInt(e.target.value) || 0})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter calories"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={currentMeal.protein || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, protein: parseInt(e.target.value) || 0})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter protein"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={currentMeal.carbs || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, carbs: parseInt(e.target.value) || 0})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter carbs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={currentMeal.fat || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, fat: parseInt(e.target.value) || 0})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter fat"
                    />
                  </div>
                </div>

                <div className="mt-4 lg:mt-6">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentMeal.description || ''}
                    onChange={(e) => setCurrentMeal({...currentMeal, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter meal description"
                  />
                </div>

                <div className="mt-4 lg:mt-6">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Ingredients
                  </label>
                  <textarea
                    value={currentMeal.ingredients || ''}
                    onChange={(e) => setCurrentMeal({...currentMeal, ingredients: e.target.value})}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter ingredients"
                  />
                </div>

                <div className="mt-4 lg:mt-6">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={currentMeal.instructions || ''}
                    onChange={(e) => setCurrentMeal({...currentMeal, instructions: e.target.value})}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter cooking instructions"
                  />
                </div>

                <div className="flex gap-2 mt-4 lg:mt-6">
                  <button
                    type="button"
                    onClick={saveMeal}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-colors"
                  >
                    Save Meal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMealForm(false)}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Meals List */}
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-semibold text-white">Daily Meals</h3>
                <button
                  type="button"
                  onClick={addMeal}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  Add Meal
                </button>
              </div>

              <div className="space-y-3 lg:space-y-4">
                {watch('dailyMeals')?.map((meal, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <h4 className="text-sm lg:text-base font-semibold text-white">{meal.mealType} - {meal.name}</h4>
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                    {meal.description && (
                      <p className="text-xs lg:text-sm text-gray-400 mb-2 lg:mb-3">{meal.description}</p>
                    )}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm">
                      <div>
                        <span className="text-gray-400">Calories:</span>
                        <span className="text-white ml-1">{meal.calories}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Protein:</span>
                        <span className="text-white ml-1">{meal.protein}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Carbs:</span>
                        <span className="text-white ml-1">{meal.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fat:</span>
                        <span className="text-white ml-1">{meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 lg:space-y-6">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-4 lg:mb-6">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Dietary Restrictions</label>
                  <textarea
                    {...register('restrictions')}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Any dietary restrictions or allergies..."
                  />
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Supplements</label>
                  <textarea
                    {...register('supplements')}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Recommended supplements..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">Hydration Guidelines</label>
                <textarea
                  {...register('hydrate')}
                  rows="3"
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Hydration recommendations..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4 pt-4 lg:pt-6">
              <button
                type="button"
                onClick={() => navigate('/diet-plans')}
                className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-colors text-xs lg:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg lg:rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs lg:text-sm"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white mr-1 lg:mr-2"></div>
                    <span>Creating Plan...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span>Create Diet Plan</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDietPlan; 