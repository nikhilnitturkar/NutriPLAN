import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  User, 
  Target, 
  FileText,
  Utensils
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchClientData = useCallback(async () => {
    try {
      const [clientResponse, dietPlansResponse] = await Promise.all([
        api.get(`/api/clients/${id}`),
        api.get('/api/diets')
      ]);
      
      setClient(clientResponse.data);
      const clientDietPlans = dietPlansResponse.data.filter(
        plan => plan.clientId === id || plan.clientId?._id === id
      );
      setDietPlans(clientDietPlans);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id, fetchClientData]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-900/20 text-green-400 border border-green-800',
      inactive: 'bg-red-900/20 text-red-400 border border-red-800',
      on_hold: 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
    };

    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusClasses[status] || 'bg-gray-900/20 text-gray-400 border border-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center bg-gray-900/95 rounded-2xl p-8 border border-gray-800">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Client not found</h3>
          <p className="mt-1 text-sm text-gray-400">The client you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to="/clients"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all"
            >
              <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
              Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/95 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/clients')}
                className="mr-4 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{client.personalInfo.name}</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Client Profile • {client.personalInfo.age} years old • {client.personalInfo.gender}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(client.status)}
              <Link
                to={`/clients/edit/${id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-xl text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                <Edit className="-ml-0.5 mr-2 h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/95 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'diets', label: 'Diet Plans', icon: Plus },
              { id: 'medical', label: 'Medical Info', icon: Trash2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800">
              <div className="px-6 py-6">
                <h3 className="text-lg leading-6 font-medium text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Full Name</label>
                    <p className="mt-1 text-sm text-white">{client.personalInfo.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Age</label>
                    <p className="mt-1 text-sm text-white">{client.personalInfo.age} years old</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Gender</label>
                    <p className="mt-1 text-sm text-white">{client.personalInfo.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(client.status)}</div>
                  </div>
                  {client.personalInfo.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="mt-1 text-sm text-white">{client.personalInfo.email}</p>
                    </div>
                  )}
                  {client.personalInfo.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Phone</label>
                      <p className="mt-1 text-sm text-white">{client.personalInfo.phone}</p>
                    </div>
                  )}
                  {client.personalInfo.address && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-400">Address</label>
                      <p className="mt-1 text-sm text-white">
                        {client.personalInfo.address.street && `${client.personalInfo.address.street}, `}
                        {client.personalInfo.address.city && `${client.personalInfo.address.city}, `}
                        {client.personalInfo.address.state && `${client.personalInfo.address.state} `}
                        {client.personalInfo.address.zipCode && client.personalInfo.address.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fitness Data */}
            <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800">
              <div className="px-6 py-6">
                <h3 className="text-lg leading-6 font-medium text-white mb-6">Fitness Data</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Current Weight</label>
                    <p className="mt-1 text-sm text-white">{client.fitnessData?.currentWeight} kg</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Height</label>
                    <p className="mt-1 text-sm text-white">{client.fitnessData?.height} cm</p>
                  </div>
                  {client.fitnessData?.targetWeight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Target Weight</label>
                      <p className="mt-1 text-sm text-white">{client.fitnessData.targetWeight} kg</p>
                    </div>
                  )}
                  {client.fitnessData?.bodyFatPercentage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Body Fat %</label>
                      <p className="mt-1 text-sm text-white">{client.fitnessData.bodyFatPercentage}%</p>
                    </div>
                  )}
                  {client.fitnessData?.muscleMass && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Muscle Mass</label>
                      <p className="mt-1 text-sm text-white">{client.fitnessData.muscleMass} kg</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Activity Level</label>
                    <p className="mt-1 text-sm text-white">{client.activityLevel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Experience Level</label>
                    <p className="mt-1 text-sm text-white">{client.experienceLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            {client.fitnessGoals && (
              <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800">
                <div className="px-6 py-6">
                  <h3 className="text-lg leading-6 font-medium text-white mb-6">Fitness Goals</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Primary Goal</label>
                      <p className="mt-1 text-sm text-white">{client.fitnessGoals.primaryGoal}</p>
                    </div>
                    {client.fitnessGoals.targetDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Target Date</label>
                        <p className="mt-1 text-sm text-white">{formatDate(client.fitnessGoals.targetDate)}</p>
                      </div>
                    )}
                    {client.fitnessGoals.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Notes</label>
                        <p className="mt-1 text-sm text-white">{client.fitnessGoals.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {client.personalInfo?.emergencyContact && (
              <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800">
                <div className="px-6 py-6">
                  <h3 className="text-lg leading-6 font-medium text-white mb-6">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Name</label>
                      <p className="mt-1 text-sm text-white">{client.personalInfo.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Phone</label>
                      <p className="mt-1 text-sm text-white">{client.personalInfo.emergencyContact.phone}</p>
                    </div>
                    {client.personalInfo.emergencyContact.relationship && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Relationship</label>
                        <p className="mt-1 text-sm text-white">{client.personalInfo.emergencyContact.relationship}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        {activeTab === 'diets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-white">Diet Plans</h3>
              <Link
                to={`/diet-plans/add?clientId=${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Diet Plan
              </Link>
            </div>

            {dietPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {dietPlans.map((plan) => (
                  <div key={plan._id} className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.isActive 
                          ? 'bg-green-900/20 text-green-400 border border-green-800' 
                          : 'bg-gray-900/20 text-gray-400 border border-gray-800'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Goal:</span>
                        <span className="text-white">{plan.goal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Calories:</span>
                        <span className="text-white">{plan.dailyCalories?.toLocaleString()} cal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{formatDate(plan.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/diet-plans/${plan._id}`}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/diet-plans/edit/${plan._id}`}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-all"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800 p-6">
                <div className="text-center py-8">
                  <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">No diet plans yet</h3>
                  <p className="mt-1 text-sm text-gray-400">Create a diet plan for this client to get started.</p>
                  <div className="mt-6">
                    <Link
                      to={`/diet-plans/add?clientId=${id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" />
                      Create First Diet Plan
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            {client.medicalInfo ? (
              <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg leading-6 font-medium text-white mb-6">Medical Information</h3>
                <div className="space-y-6">
                  {client.medicalInfo.conditions && client.medicalInfo.conditions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Medical Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.conditions.map((condition, index) => (
                          <span key={index} className="px-3 py-1 bg-red-900/20 text-red-400 border border-red-800 rounded-full text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.medicalInfo.medications && client.medicalInfo.medications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Medications</label>
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.medications.map((medication, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-900/20 text-blue-400 border border-blue-800 rounded-full text-sm">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.medicalInfo.allergies && client.medicalInfo.allergies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Allergies</label>
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.allergies.map((allergy, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-900/20 text-yellow-400 border border-yellow-800 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.medicalInfo.injuries && client.medicalInfo.injuries.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Injuries</label>
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.injuries.map((injury, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-900/20 text-orange-400 border border-orange-800 rounded-full text-sm">
                            {injury}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/95 shadow-xl rounded-2xl border border-gray-800 p-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">No medical information</h3>
                  <p className="mt-1 text-sm text-gray-400">No medical information has been recorded for this client.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail; 