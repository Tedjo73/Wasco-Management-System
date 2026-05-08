import { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import PublicLayout from './components/Layout/PublicLayout';
import AuthLayout from './components/Layout/AuthLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

import LandingPage from './pages/Public/LandingPage';
import Register from './pages/Public/Register';
import Login from './pages/Public/Login';

import CustomerPortal from './pages/Customer/CustomerPortal';
import MyBills from './pages/Customer/MyBills';
import PayBill from './pages/Customer/PayBill';
import PaymentHistory from './pages/Customer/PaymentHistory';
import ReportLeakage from './pages/Customer/ReportLeakage';

import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageCustomers from './pages/Admin/ManageCustomers';
import ManageBills from './pages/Admin/ManageBills';
import BillingRates from './pages/Admin/BillingRates';
import ManageLeakages from './pages/Admin/ManageLeakages';

import ManagerDashboard from './pages/Manager/ManagerDashboard';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
      <h2>Loading...</h2>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wasco_token');
    if (!token) { 
      setTimeout(() => setLoading(false), 0); 
      return; 
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axios.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('wasco_token');
        delete axios.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('wasco_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wasco_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><DashboardLayout role="customer" /></ProtectedRoute>}>
            <Route index element={<CustomerPortal />} />
            <Route path="bills" element={<MyBills />} />
            <Route path="pay" element={<PayBill />} />
            <Route path="history" element={<PaymentHistory />} />
            <Route path="report-leakage" element={<ReportLeakage />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="bills" element={<ManageBills />} />
            <Route path="rates" element={<BillingRates />} />
            <Route path="leakages" element={<ManageLeakages />} />
          </Route>

          <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><DashboardLayout role="manager" /></ProtectedRoute>}>
            <Route index element={<ManagerDashboard />} />
            <Route path="leakages" element={<ManageLeakages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
