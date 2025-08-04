import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Briefcase, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    experience: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const trainerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      specialization: formData.specialization || undefined,
      experience: formData.experience ? parseInt(formData.experience) : undefined
    };

    const success = await register(trainerData);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-6 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 lg:space-y-8">
        <div>
          <div className="mx-auto h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <h2 className="mt-4 lg:mt-6 text-center text-2xl lg:text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs lg:text-sm text-gray-300">
            Start managing your fitness business today
          </p>
        </div>

        <div className="bg-gray-900/95 rounded-xl lg:rounded-2xl shadow-xl border border-gray-800 p-4 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full pl-10 pr-3 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="block w-full pl-10 pr-3 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Specialization Field */}
            <div>
              <label htmlFor="specialization" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Specialization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="e.g., Personal Training, Nutrition"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Experience Field */}
            <div>
              <label htmlFor="experience" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Years of Experience
              </label>
              <input
                id="experience"
                name="experience"
                type="number"
                min="0"
                max="50"
                className="block w-full px-3 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-12 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs lg:text-sm font-medium text-gray-300 mb-1 lg:mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-12 py-2 lg:py-3 border border-gray-700 rounded-lg lg:rounded-xl text-xs lg:text-sm text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 lg:px-6 py-2 lg:py-3 border border-transparent rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white mr-2"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Create Account</span>
                    <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-xs lg:text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 