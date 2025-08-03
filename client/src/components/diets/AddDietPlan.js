import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
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
      const response = await axios.get('/api/clients');
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
      console.log('Submitting diet plan data:', data);
      
      // Calculate macronutrients if not provided
      if (!data.macronutrients) {
        data.macronutrients = calculateMacros(data.dailyCalories, data.goal);
      }

      console.log('Final data being sent to server:', data);
      
      const response = await axios.post('/api/diets', data);
      console.log('Server response:', response.data);
      toast.success('Diet plan created successfully!');
      navigate('/diets');
    } catch (error) {
      console.error('Error creating diet plan:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create diet plan');
    } finally {
      setLoading(false);
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/95 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/diet-plans')}
                className="mr-4 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Create Diet Plan</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Design a personalized nutrition plan for your client
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Plan name is required' })}
                    className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Weight Loss Plan"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Client *
                  </label>
                  <select
                    {...register('clientId', { required: 'Please select a client' })}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.personalInfo?.name} - {client.personalInfo?.age} years
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-red-400 text-sm mt-1">{errors.clientId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Goal *
                  </label>
                  <select
                    {...register('goal', { required: 'Please select a goal' })}
                    className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Performance">Performance</option>
                    <option value="General Health">General Health</option>
                  </select>
                  {errors.goal && (
                    <p className="text-red-400 text-sm mt-1">{errors.goal.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Daily Calories *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      {...register('dailyCalories', { 
                        required: 'Daily calories is required',
                        min: { value: 800, message: 'Minimum 800 calories' },
                        max: { value: 5000, message: 'Maximum 5000 calories' }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="e.g., 2000"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                      disabled={!watchClientId}
                    >
                      <Calculator size={16} />
                      Calculate
                    </button>
                  </div>
                  {errors.dailyCalories && (
                    <p className="text-red-400 text-sm mt-1">{errors.dailyCalories.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Describe the diet plan and its objectives..."
                />
              </div>
            </div>

            {/* Calorie Calculator Modal */}
            {showCalculator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-6 max-w-2xl w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Calorie Calculator</h3>
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
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Macronutrients</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      {...register('protein')}
                      value={calculateMacros(watchDailyCalories, watchGoal).protein}
                      onChange={(e) => setValue('protein', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Carbohydrates (g)</label>
                    <input
                      type="number"
                      {...register('carbs')}
                      value={calculateMacros(watchDailyCalories, watchGoal).carbs}
                      onChange={(e) => setValue('carbs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Fat (g)</label>
                    <input
                      type="number"
                      {...register('fat')}
                      value={calculateMacros(watchDailyCalories, watchGoal).fat}
                      onChange={(e) => setValue('fat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Meals */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Daily Meals</h2>
                </div>
                <button
                  type="button"
                  onClick={addMeal}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl flex items-center gap-2 transition-all"
                >
                  <Plus size={16} />
                  Add Meal
                </button>
              </div>

              {/* Meal Form */}
              {showMealForm && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Add New Meal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Meal Type</label>
                      <select
                        value={currentMeal.mealType || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, mealType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select meal type</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Meal Name</label>
                      <input
                        type="text"
                        value={currentMeal.name || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="e.g., Grilled Chicken Salad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Calories</label>
                      <input
                        type="number"
                        value={currentMeal.calories || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, calories: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="e.g., 350"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Protein (g)</label>
                      <input
                        type="number"
                        value={currentMeal.protein || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, protein: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="e.g., 25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Carbs (g)</label>
                      <input
                        type="number"
                        value={currentMeal.carbs || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, carbs: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="e.g., 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Fat (g)</label>
                      <input
                        type="number"
                        value={currentMeal.fat || ''}
                        onChange={(e) => setCurrentMeal({...currentMeal, fat: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="e.g., 12"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                    <textarea
                      value={currentMeal.description || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Describe the meal..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Ingredients</label>
                    <textarea
                      value={currentMeal.ingredients || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, ingredients: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="List ingredients..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Instructions</label>
                    <textarea
                      value={currentMeal.instructions || ''}
                      onChange={(e) => setCurrentMeal({...currentMeal, instructions: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Cooking instructions..."
                    />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={saveMeal}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl flex items-center gap-2 transition-all"
                    >
                      <Save size={16} />
                      Save Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMealForm(false);
                        setCurrentMeal({});
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Meals List */}
              <div className="space-y-4">
                {watch('dailyMeals')?.map((meal, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{meal.mealType}: {meal.name}</h4>
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
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
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Additional Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Dietary Restrictions</label>
                  <textarea
                    {...register('restrictions')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Any dietary restrictions or allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Supplements</label>
                  <textarea
                    {...register('supplements')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Recommended supplements..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Hydration Guidelines</label>
                <textarea
                  {...register('hydrate')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Hydration recommendations..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/diet-plans')}
                className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Plan...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Create Diet Plan
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