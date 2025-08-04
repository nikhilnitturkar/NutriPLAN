import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Phone, MapPin, Activity, Target } from 'lucide-react';

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Fetch client data on component mount
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/api/clients/${id}`);
        const clientData = response.data;
        setClient(clientData);
        
        // Pre-fill the form with existing data
        reset({
          name: clientData.personalInfo.name,
          age: clientData.personalInfo.age,
          gender: clientData.personalInfo.gender,
          email: clientData.personalInfo.email || '',
          phone: clientData.personalInfo.phone || '',
          street: clientData.personalInfo.address?.street || '',
          city: clientData.personalInfo.address?.city || '',
          state: clientData.personalInfo.address?.state || '',
          zipCode: clientData.personalInfo.address?.zipCode || '',
          emergencyName: clientData.personalInfo.emergencyContact?.name || '',
          emergencyPhone: clientData.personalInfo.emergencyContact?.phone || '',
          emergencyRelationship: clientData.personalInfo.emergencyContact?.relationship || '',
          currentWeight: clientData.fitnessData.currentWeight,
          height: clientData.fitnessData.height,
          bodyFatPercentage: clientData.fitnessData.bodyFatPercentage || '',
          muscleMass: clientData.fitnessData.muscleMass || '',
          targetWeight: clientData.fitnessData.targetWeight || '',
          primaryGoal: clientData.fitnessGoals.primaryGoal,
          secondaryGoals: clientData.fitnessGoals.secondaryGoals?.join(', ') || '',
          targetDate: clientData.fitnessGoals.targetDate || '',
          goalNotes: clientData.fitnessGoals.notes || '',
          medicalConditions: clientData.medicalInfo?.conditions?.join(', ') || '',
          medications: clientData.medicalInfo?.medications?.join(', ') || '',
          allergies: clientData.medicalInfo?.allergies?.join(', ') || '',
          injuries: clientData.medicalInfo?.injuries?.join(', ') || '',
          restrictions: clientData.medicalInfo?.restrictions?.join(', ') || '',
          activityLevel: clientData.activityLevel || '',
          experienceLevel: clientData.experienceLevel || '',
          status: clientData.status || '',
          notes: clientData.notes || ''
        });
      } catch (error) {
        console.error('Error fetching client:', error);
        toast.error('Failed to load client data');
        navigate('/clients');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id, reset, navigate]);

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
          secondaryGoals: data.secondaryGoals ? data.secondaryGoals.split(',').map(g => g.trim()) : [],
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

      await api.put(`/api/clients/${id}`, clientData);
      toast.success('Client updated successfully!');
      navigate(`/clients/${id}`);
    } catch (error) {
      console.error('Error updating client:', error);
      const message = error.response?.data?.message || 'Failed to update client';
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
              onClick={() => navigate('/clients')}
              className="mr-3 lg:mr-4 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-white">Edit Client</h1>
              <p className="mt-1 text-xs lg:text-sm text-gray-400">
                Update client information and fitness data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {initialLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* Form */}
      {!initialLoading && client && (
        <div className="max-w-4xl mx-auto py-4 lg:py-8 px-3 sm:px-4 lg:px-8">
          <div className="bg-gray-900/95 shadow-xl rounded-xl lg:rounded-2xl border border-gray-800 p-4 lg:p-8">
            <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Client Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 13, message: 'Age must be at least 13' },
                      max: { value: 100, message: 'Age must be less than 100' }
                    })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-400">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Gender *
                  </label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-400">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      pattern: { 
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                        message: 'Invalid email address' 
                      }
                    })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    {...register('street')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    {...register('zipCode')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    {...register('emergencyName')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    {...register('emergencyPhone')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter contact phone"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    {...register('emergencyRelationship')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>

              {/* Fitness Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Current Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('currentWeight', { 
                      required: 'Current weight is required',
                      min: { value: 20, message: 'Weight must be at least 20 kg' },
                      max: { value: 500, message: 'Weight must be at most 500 kg' }
                    })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter current weight"
                  />
                  {errors.currentWeight && (
                    <p className="mt-1 text-xs text-red-400">{errors.currentWeight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('height', { 
                      required: 'Height is required',
                      min: { value: 100, message: 'Height must be at least 100 cm' },
                      max: { value: 250, message: 'Height must be at most 250 cm' }
                    })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter height"
                  />
                  {errors.height && (
                    <p className="mt-1 text-xs text-red-400">{errors.height.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Body Fat Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('bodyFatPercentage')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter body fat percentage"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Muscle Mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('muscleMass')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter muscle mass"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('targetWeight')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter target weight"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Activity Level
                  </label>
                  <select
                    {...register('activityLevel')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Experience Level
                  </label>
                  <select
                    {...register('experienceLevel')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Fitness Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Primary Goal *
                  </label>
                  <select
                    {...register('primaryGoal', { required: 'Primary goal is required' })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select primary goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="sports_performance">Sports Performance</option>
                  </select>
                  {errors.primaryGoal && (
                    <p className="mt-1 text-xs text-red-400">{errors.primaryGoal.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    {...register('targetDate')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Secondary Goals
                  </label>
                  <input
                    type="text"
                    {...register('secondaryGoals')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter secondary goals (comma-separated)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Goal Notes
                  </label>
                  <textarea
                    {...register('goalNotes')}
                    rows={3}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Additional notes about goals"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    {...register('medicalConditions')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter medical conditions (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Medications
                  </label>
                  <input
                    type="text"
                    {...register('medications')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter medications (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Allergies
                  </label>
                  <input
                    type="text"
                    {...register('allergies')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter allergies (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Injuries
                  </label>
                  <input
                    type="text"
                    {...register('injuries')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter injuries (comma-separated)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    {...register('restrictions')}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter dietary restrictions (comma-separated)"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-800 border border-gray-700 rounded-lg text-xs lg:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter any additional notes about the client"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 lg:space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/clients/${id}`)}
                  className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-700 text-xs lg:text-sm text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border border-transparent text-xs lg:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Updating...' : 'Update Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClient; 