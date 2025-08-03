import React, { useState } from 'react';
import { 
  Calculator, 
  Activity, 
  Target, 
  TrendingUp, 
  Info,
  Zap,
  Scale,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const CalorieCalculator = ({ onCaloriesCalculated, initialData = null }) => {
  const [formData, setFormData] = useState({
    gender: initialData?.gender || 'male',
    age: initialData?.age || '',
    weight: initialData?.weight || '',
    height: initialData?.height || '',
    activityLevel: initialData?.activityLevel || 'moderate'
  });

  const [calculatedCalories, setCalculatedCalories] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedCalorieOption, setSelectedCalorieOption] = useState(null);

  const activityMultipliers = {
    sedentary: { value: 1.2, label: 'Sedentary (little or no exercise)' },
    lightly: { value: 1.375, label: 'Lightly active (light exercise 1-3 days/week)' },
    moderate: { value: 1.55, label: 'Moderately active (moderate exercise 3-5 days/week)' },
    very: { value: 1.725, label: 'Very active (hard exercise 6-7 days/week)' },
    extremely: { value: 1.9, label: 'Extremely active (very hard exercise, physical job)' }
  };

  const goalOptions = {
    extreme_loss: { label: 'Extreme Weight Loss', adjustment: -1000, description: '~2 lbs/week loss', icon: ArrowDown, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    aggressive_loss: { label: 'Aggressive Weight Loss', adjustment: -750, description: '~1.5 lbs/week loss', icon: ArrowDown, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    moderate_loss: { label: 'Moderate Weight Loss', adjustment: -500, description: '~1 lb/week loss', icon: ArrowDown, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    mild_loss: { label: 'Mild Weight Loss', adjustment: -250, description: '~0.5 lb/week loss', icon: ArrowDown, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    maintenance: { label: 'Maintenance', adjustment: 0, description: 'Maintain current weight', icon: Minus, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    mild_gain: { label: 'Mild Weight Gain', adjustment: 250, description: '~0.5 lb/week gain', icon: ArrowUp, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    moderate_gain: { label: 'Moderate Weight Gain', adjustment: 500, description: '~1 lb/week gain', icon: ArrowUp, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    aggressive_gain: { label: 'Aggressive Weight Gain', adjustment: 750, description: '~1.5 lbs/week gain', icon: ArrowUp, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' }
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

  const calculateCalories = () => {
    try {
      const { gender, age, weight, height, activityLevel } = formData;
      
      console.log('Calculating calories with data:', formData);
      
      if (!age || !weight || !height) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate numeric inputs
      const ageNum = parseFloat(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      
      if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
        alert('Please enter valid numbers for age, weight, and height');
        return;
      }

      const bmr = calculateBMR(gender, weightNum, heightNum, ageNum);
      const tdee = calculateTDEE(bmr, activityLevel);
      
      console.log('BMR:', bmr, 'TDEE:', tdee);

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

      console.log('Calculated result:', result);
      setCalculatedCalories(result);
      setShowResults(true);
      setSelectedCalorieOption(null);
    } catch (error) {
      console.error('Error calculating calories:', error);
      alert('An error occurred while calculating calories. Please check your inputs and try again.');
    }
  };

  const calculateMacros = (calories) => {
    return {
      protein: Math.round((calories * 0.25) / 4), // 25% protein
      carbs: Math.round((calories * 0.45) / 4),   // 45% carbs
      fat: Math.round((calories * 0.30) / 9)      // 30% fat
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalorieOptionSelect = (option) => {
    console.log('Selected calorie option:', option);
    setSelectedCalorieOption(option);
    // Don't automatically apply the calories - let user click "Use This Plan" button
  };

  const resetCalculator = () => {
    setFormData({
      gender: 'male',
      age: '',
      weight: '',
      height: '',
      activityLevel: 'moderate'
    });
    setCalculatedCalories(null);
    setShowResults(false);
    setSelectedCalorieOption(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Calorie Calculator</h2>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onCaloriesCalculated) {
              onCaloriesCalculated(null); // Signal to close calculator
            }
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-gray-600" />
            Personal Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years) *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="15"
              max="80"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="30"
              max="300"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) *
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              min="100"
              max="250"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 170"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Activity Level
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level *
            </label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(activityMultipliers).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
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
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            calculateCalories();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Calculator size={16} />
          Calculate Calories
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetCalculator();
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {showResults && calculatedCalories && (
        <div className="mt-6 space-y-6">
          {/* BMR and TDEE Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Your Metabolic Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">BMR</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {calculatedCalories.bmr.toLocaleString()} cal
                </div>
                <div className="text-xs text-gray-500">Basal Metabolic Rate</div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">TDEE</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {calculatedCalories.tdee.toLocaleString()} cal
                </div>
                <div className="text-xs text-gray-500">Total Daily Energy Expenditure</div>
              </div>
            </div>
          </div>

          {/* Calorie Options Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Choose Your Goal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {calculatedCalories.calorieOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedCalorieOption?.key === option.key;
                
                return (
                  <div
                    key={option.key}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCalorieOptionSelect(option);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? `${option.borderColor} ${option.bgColor} shadow-md` 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`h-4 w-4 ${option.color}`} />
                      <span className={`text-sm font-medium ${option.color}`}>
                        {option.label}
                      </span>
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {option.calories.toLocaleString()} cal
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      {option.description}
                    </div>

                    {/* Weekly Change */}
                    <div className="text-xs text-gray-500 mb-3">
                      {option.adjustment > 0 ? '+' : ''}{option.adjustment} cal/day
                      <br />
                      ~{option.adjustment > 0 ? '+' : ''}{option.weeklyChange.toFixed(1)} lbs/week
                    </div>

                    {/* Macronutrients Preview */}
                    <div className="text-xs text-gray-500">
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
              <div className="mt-6 bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Selected: {selectedCalorieOption.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedCalorieOption.calories.toLocaleString()} calories per day
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onCaloriesCalculated) {
                        onCaloriesCalculated(selectedCalorieOption.calories);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Target size={16} />
                    Use This Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator; 