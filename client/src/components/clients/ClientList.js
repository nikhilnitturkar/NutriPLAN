import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Target,
  TrendingUp,
  MapPin,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode } = useDarkMode();

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const filterClients = () => {
    return clients.filter(client => {
      const matchesSearch = client.personalInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGoal = filterGoal === 'All' || 
                         client.fitnessInfo?.goals?.includes(filterGoal);
      return matchesSearch && matchesGoal;
    });
  };

  const getGoalIcon = (goal) => {
    const goalIcons = {
      weight_loss: Target,
      muscle_gain: TrendingUp,
      maintenance: Target,
      performance: Target,
      general_health: Users
    };
    return goalIcons[goal] || Users;
  };

  const filteredClients = filterClients();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-red-900 to-black p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Client Management</h1>
              <p className="text-xl text-gray-300">
                Manage your client profiles and track their progress
              </p>
            </div>
            <div className="hidden lg:block">
              <Users className="w-16 h-16 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {clients.length}
              </p>
              <p className="text-sm text-gray-400">
                Total Clients
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.fitnessInfo?.goals?.includes('Weight Loss')).length}
              </p>
              <p className="text-sm text-gray-400">
                Weight Loss Goals
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.fitnessInfo?.goals?.includes('Muscle Gain')).length}
              </p>
              <p className="text-sm text-gray-400">
                Muscle Gain Goals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 transition-all bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 transition-all bg-gray-800 border-gray-700 text-gray-200"
              >
                <option value="All">All Goals</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Performance">Performance</option>
                <option value="General Health">General Health</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          <Link
            to="/clients/add"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const GoalIcon = getGoalIcon(client.fitnessInfo?.goals?.[0] || 'general_health');
          return (
            <div
              key={client._id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {client.personalInfo?.name || 'Unknown Client'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {client.personalInfo?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/clients/${client._id}`}
                    className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-gray-400">
                    {client.personalInfo?.email || 'No email'}
                  </span>
                </div>
                {client.personalInfo?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-gray-400">
                      {client.personalInfo.phone}
                    </span>
                  </div>
                )}
                {client.fitnessInfo?.goals && (
                  <div className="flex items-center space-x-2">
                    <GoalIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-400">
                      {client.fitnessInfo.goals.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={`/clients/${client._id}`}
                  className="inline-flex items-center space-x-2 text-sm font-medium transition-all text-red-400 hover:text-red-300"
                >
                  <span>View Details</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/clients/${client._id}`}
                    className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-semibold mb-2 text-white">No clients found</h3>
          <p className="mb-6 text-gray-400">
            {searchTerm || filterGoal !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first client'
            }
          </p>
          {!searchTerm && filterGoal === 'All' && (
            <Link
              to="/clients/add"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Client</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientList; 