import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ClientList from './components/clients/ClientList';
import AddClient from './components/clients/AddClient';
import ClientDetail from './components/clients/ClientDetail';
import EditClient from './components/clients/EditClient';
import DietPlans from './components/diets/DietPlans';
import AddDietPlan from './components/diets/AddDietPlan';
import DietPlanDetail from './components/diets/DietPlanDetail';
import EditDietPlan from './components/diets/EditDietPlan';
import Analytics from './components/analytics/Analytics';
import Notifications from './components/notifications/Notifications';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <PrivateRoute>
                  <Layout>
                    <ClientList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients/add"
              element={
                <PrivateRoute>
                  <Layout>
                    <AddClient />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <ClientDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients/edit/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <EditClient />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/diet-plans"
              element={
                <PrivateRoute>
                  <Layout>
                    <DietPlans />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/diet-plans/add"
              element={
                <PrivateRoute>
                  <Layout>
                    <AddDietPlan />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/diet-plans/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <DietPlanDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/diet-plans/edit/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <EditDietPlan />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App; 