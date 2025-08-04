import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Activity,
  Plus,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDietPlans: 0,
    activePlans: 0,
    retentionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch clients
        const clientsResponse = await api.get('/api/clients');
        const clients = clientsResponse.data;

        // Fetch diet plans
        const dietsResponse = await api.get('/api/diets');
        const diets = dietsResponse.data;

        setStats({
          totalClients: clients.length,
          totalDietPlans: diets.length,
          activePlans: diets.filter(plan => plan.isActive).length,
          retentionRate: clients.length > 0 ? Math.round((clients.filter(client => client.status === 'active').length / clients.length) * 100) : 0
        });

        // Generate real recent activity based on actual data
        const recentActivity = [];
        
        // Add recent clients
        const recentClients = clients
          .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
          .slice(0, 2);
        
        recentClients.forEach(client => {
          const joinDate = new Date(client.createdAt || client.joinDate);
          const timeAgo = getTimeAgo(joinDate);
          recentActivity.push({
            id: `client-${client._id}`,
            type: 'client_added',
            title: 'New Client Added',
            description: `${client.personalInfo.name} joined your program`,
            time: timeAgo,
            icon: Users,
            color: 'blue'
          });
        });

        // Add recent diet plans
        const recentDiets = diets
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);
        
        recentDiets.forEach(diet => {
          const createDate = new Date(diet.createdAt);
          const timeAgo = getTimeAgo(createDate);
          recentActivity.push({
            id: `diet-${diet._id}`,
            type: 'diet_plan_created',
            title: 'Diet Plan Created',
            description: `${diet.name} plan created`,
            time: timeAgo,
            icon: Target,
            color: 'green'
          });
        });

        // Sort by date and take top 4
        const sortedActivity = recentActivity
          .sort((a, b) => {
            const timeA = a.time.includes('minute') ? 1 : a.time.includes('hour') ? 2 : 3;
            const timeB = b.time.includes('minute') ? 1 : b.time.includes('hour') ? 2 : 3;
            return timeA - timeB;
          })
          .slice(0, 4);

        setRecentActivity(sortedActivity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddClient = () => {
    try {
      navigate('/clients/add');
    } catch (error) {
      toast.error('Failed to navigate to add client page');
    }
  };

  const handleCreateDietPlan = () => {
    try {
      navigate('/diet-plans?showModal=true');
    } catch (error) {
      toast.error('Failed to navigate to create diet plan page');
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-red-900 to-black p-6 lg:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Welcome back, {user?.name || 'Trainer'}! 👋
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-6">
            Here's what's happening with your NutriPlan business today.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gray-900 rounded-xl p-4 lg:p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.totalClients}</p>
              <p className="text-xs lg:text-sm text-gray-400">Total Clients</p>
            </div>
          </div>
          {stats.totalClients > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-4 lg:p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.totalDietPlans}</p>
              <p className="text-xs lg:text-sm text-gray-400">Diet Plans</p>
            </div>
          </div>
          {stats.totalDietPlans > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-4 lg:p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.activePlans}</p>
              <p className="text-xs lg:text-sm text-gray-400">Active Plans</p>
            </div>
          </div>
          {stats.activePlans > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-4 lg:p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.retentionRate}%</p>
              <p className="text-xs lg:text-sm text-gray-400">Client Retention Rate</p>
            </div>
          </div>
          {stats.retentionRate > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${stats.retentionRate}%` }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 lg:space-y-8">
        {/* Quick Actions Section */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <button
              onClick={handleAddClient}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer w-full text-left"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative p-4 lg:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                      <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-white mb-1">Add New Client</h3>
                      <p className="text-sm lg:text-base text-gray-400">Create a new client profile</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={handleCreateDietPlan}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer w-full text-left"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative p-4 lg:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                      <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-white mb-1">Create Diet Plan</h3>
                      <p className="text-sm lg:text-base text-gray-400">Design personalized nutrition</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Recent Activity</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 lg:p-6">
              <div className="space-y-3 lg:space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className={`flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-lg ${
                      index % 2 === 0 ? 'bg-gray-800/50' : 'bg-transparent'
                    }`}>
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg ${getIconColor(activity.color)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">{activity.title}</h3>
                        <p className="text-gray-400 text-xs lg:text-sm mb-2">{activity.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 