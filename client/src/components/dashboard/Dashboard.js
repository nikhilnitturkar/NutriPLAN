import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Activity,
  Plus,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDietPlans: 0,
    activePlans: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients
      const clientsResponse = await fetch('/api/clients');
      const clients = await clientsResponse.json();

      // Fetch diet plans
      const dietsResponse = await fetch('/api/diets');
      const diets = await dietsResponse.json();

      setStats({
        totalClients: clients.length,
        totalDietPlans: diets.length,
        activePlans: diets.filter(plan => plan.isActive).length,
        successRate: Math.round((diets.filter(plan => plan.isActive).length / Math.max(diets.length, 1)) * 100)
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'diet_plan_created',
          title: 'New Diet Plan Created',
          description: 'Weight loss plan for Sarah Johnson',
          time: '2 minutes ago',
          icon: Target,
          color: 'green'
        },
        {
          id: 2,
          type: 'client_added',
          title: 'New Client Added',
          description: 'Mike Davis joined your program',
          time: '1 hour ago',
          icon: Users,
          color: 'blue'
        },
        {
          id: 3,
          type: 'plan_updated',
          title: 'Diet Plan Updated',
          description: 'Emma Wilson\'s plan modified',
          time: '3 hours ago',
          icon: Activity,
          color: 'purple'
        },
        {
          id: 4,
          type: 'goal_achieved',
          title: 'Goal Achieved',
          description: 'John Smith reached target weight',
          time: '1 day ago',
          icon: CheckCircle,
          color: 'green'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-red-900 to-black p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome back, {user?.name || 'Trainer'}! 👋
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Here's what's happening with your NutriPlan business today.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
              <p className="text-sm text-gray-400">Total Clients</p>
            </div>
          </div>
          {stats.totalClients > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{stats.totalDietPlans}</p>
              <p className="text-sm text-gray-400">Diet Plans</p>
            </div>
          </div>
          {stats.totalDietPlans > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{stats.activePlans}</p>
              <p className="text-sm text-gray-400">Active Plans</p>
            </div>
          </div>
          {stats.activePlans > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
              <p className="text-sm text-gray-400">Success Rate</p>
            </div>
          </div>
          {stats.successRate > 0 && (
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${stats.successRate}%` }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Quick Actions Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <button
              onClick={() => {
                console.log('Add Client button clicked');
                navigate('/clients/add');
              }}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer w-full text-left"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Add New Client</h3>
                      <p className="text-gray-400">Create a new client profile</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                console.log('Create Diet Plan button clicked');
                navigate('/diet-plans/add');
              }}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer w-full text-left"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Create Diet Plan</h3>
                      <p className="text-gray-400">Design personalized nutrition</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-lg ${
                      index % 2 === 0 ? 'bg-gray-800/50' : 'bg-transparent'
                    }`}>
                      <div className={`w-10 h-10 rounded-lg ${getIconColor(activity.color)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1">{activity.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
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