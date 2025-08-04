import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Activity, Target } from 'lucide-react';

const AddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Transform the form data to match the API structure
      const clientData = {
        personalInfo: {
          name: data.name,
          age: parseInt(data.age),
          gender: data.gender,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: {
            street: data.street || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            zipCode: data.zipCode || undefined
          },
          emergencyContact: {
            name: data.emergencyName || undefined,
            phone: data.emergencyPhone || undefined,
            relationship: data.emergencyRelationship || undefined
          }
        },
        fitnessData: {
          currentWeight: parseFloat(data.currentWeight),
          height: parseFloat(data.height),
          bodyFatPercentage: data.bodyFatPercentage ? parseFloat(data.bodyFatPercentage) : undefined,
          muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : undefined,
          targetWeight: data.targetWeight ? parseFloat(data.targetWeight) : undefined
        },
        fitnessGoals: {
          primaryGoal: data.primaryGoal,
          secondaryGoals: data.secondaryGoals || [],
          targetDate: data.targetDate || undefined,
          notes: data.goalNotes || undefined
        },
        medicalInfo: {
          conditions: data.medicalConditions ? data.medicalConditions.split(',').map(c => c.trim()) : [],
          medications: data.medications ? data.medications.split(',').map(m => m.trim()) : [],
          allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()) : [],
          injuries: data.injuries ? data.injuries.split(',').map(i => i.trim()) : [],
          restrictions: data.restrictions ? data.restrictions.split(',').map(r => r.trim()) : []
        },
        activityLevel: data.activityLevel || undefined,
        experienceLevel: data.experienceLevel || undefined,
        status: data.status || undefined,
        notes: data.notes || undefined
      };

      await api.post('/api/clients', clientData);
      toast.success('Client added successfully!');
      navigate('/clients');
    } catch (error) {
      console.error('Error adding client:', error);
      const message = error.response?.data?.message || 'Failed to add client';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/95 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/clients')}
              className="mr-4 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Add New Client</h1>
              <p className="mt-1 text-sm text-gray-400">
                Register a new client and start tracking their fitness journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900/95 rounded-2xl shadow-xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Age *
                  </label>
                  <input
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 1, message: 'Age must be at least 1' },
                      max: { value: 120, message: 'Age must be less than 120' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter age"
                  />
                  {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Gender *
                  </label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email', {
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Please enter a valid email'
                        }
                      })}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('street')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    State
                  </label>
                  <input
                    {...register('state')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    ZIP Code
                  </label>
                  <input
                    {...register('zipCode')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    {...register('emergencyName')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    {...register('emergencyPhone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter emergency contact phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Relationship
                  </label>
                  <input
                    {...register('emergencyRelationship')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Data */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Fitness Data</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Current Weight (kg) *
                  </label>
                  <input
                    {...register('currentWeight', { 
                      required: 'Current weight is required',
                      min: { value: 20, message: 'Weight must be at least 20kg' },
                      max: { value: 300, message: 'Weight must be less than 300kg' }
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter current weight"
                  />
                  {errors.currentWeight && <p className="mt-1 text-sm text-red-400">{errors.currentWeight.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Height (cm) *
                  </label>
                  <input
                    {...register('height', { 
                      required: 'Height is required',
                      min: { value: 100, message: 'Height must be at least 100cm' },
                      max: { value: 250, message: 'Height must be less than 250cm' }
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter height"
                  />
                  {errors.height && <p className="mt-1 text-sm text-red-400">{errors.height.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Target Weight (kg)
                  </label>
                  <input
                    {...register('targetWeight')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter target weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Body Fat Percentage (%)
                  </label>
                  <input
                    {...register('bodyFatPercentage')}
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter body fat percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Muscle Mass (kg)
                  </label>
                  <input
                    {...register('muscleMass')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter muscle mass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Activity Level *
                  </label>
                  <select
                    {...register('activityLevel', { required: 'Activity level is required' })}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary (Little or no exercise)</option>
                    <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                    <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                    <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                    <option value="extremely_active">Extremely Active (Very hard exercise, physical job)</option>
                  </select>
                  {errors.activityLevel && <p className="mt-1 text-sm text-red-400">{errors.activityLevel.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Experience Level
                  </label>
                  <select
                    {...register('experienceLevel')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Fitness Goals</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Primary Goal *
                  </label>
                  <select
                    {...register('primaryGoal', { required: 'Primary goal is required' })}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select primary goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="strength_training">Strength Training</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="general_fitness">General Fitness</option>
                  </select>
                  {errors.primaryGoal && <p className="mt-1 text-sm text-red-400">{errors.primaryGoal.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Target Date
                  </label>
                  <input
                    {...register('targetDate')}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Goal Notes
                </label>
                <textarea
                  {...register('goalNotes')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Additional notes about goals..."
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Medical Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    {...register('medicalConditions')}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter medical conditions (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Medications
                  </label>
                  <textarea
                    {...register('medications')}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter medications (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Allergies
                  </label>
                  <textarea
                    {...register('allergies')}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter allergies (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Injuries
                  </label>
                  <textarea
                    {...register('injuries')}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter injuries (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Dietary Restrictions
                  </label>
                  <textarea
                    {...register('restrictions')}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter dietary restrictions (comma-separated)"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Additional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Additional notes about the client..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Client...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Add Client
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

export default AddClient; 