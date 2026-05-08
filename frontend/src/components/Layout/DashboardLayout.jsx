import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { 
  FiHome, FiFileText, FiDollarSign, FiAlertCircle, 
  FiUsers, FiSettings, FiLogOut, FiPieChart 
} from 'react-icons/fi';

const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getSidebarLinks = () => {
    if (role === 'customer') return [
      { path: '/customer', label: 'Dashboard', icon: FiHome },
      { path: '/customer/bills', label: 'My Bills', icon: FiFileText },
      { path: '/customer/pay', label: 'Pay Bill', icon: FiDollarSign },
      { path: '/customer/history', label: 'Payment History', icon: FiFileText },
      { path: '/customer/report-leakage', label: 'Report Leakage', icon: FiAlertCircle },
    ];
    if (role === 'admin') return [
      { path: '/admin', label: 'Dashboard', icon: FiHome },
      { path: '/admin/customers', label: 'Manage Customers', icon: FiUsers },
      { path: '/admin/bills', label: 'Manage Bills', icon: FiFileText },
      { path: '/admin/rates', label: 'Billing Rates', icon: FiSettings },
      { path: '/admin/leakages', label: 'Manage Leakages', icon: FiAlertCircle },
    ];
    if (role === 'manager') return [
      { path: '/manager', label: 'Overview', icon: FiPieChart },
      { path: '/manager/leakages', label: 'Manage Leakages', icon: FiAlertCircle },
    ];
    return [];
  };

  const links = getSidebarLinks();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--dark-navy)', 
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💧 WASCO</h2>
          <p style={{ color: 'var(--light-blue)', fontSize: '0.85rem', marginTop: '0.5rem', textTransform: 'capitalize' }}>{role} Portal</p>
        </div>
        
        <nav style={{ padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)',
                color: isActive ? 'var(--white)' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActive ? 'var(--primary-blue)' : 'transparent',
                transition: 'var(--transition)'
              }}>
                <Icon size={20} />
                <span style={{ fontWeight: 500 }}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '2rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem',
              width: '100%', padding: '0.75rem 1rem',
              background: 'transparent', border: 'none', color: '#ff6b6b',
              textAlign: 'left'
            }}
          >
            <FiLogOut size={20} />
            <span style={{ fontWeight: 500 }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Topbar */}
        <header style={{ 
          backgroundColor: 'var(--white)', 
          padding: '1.5rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h3 style={{ margin: 0 }}>Welcome back, {user?.name || 'User'}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: 'var(--light-blue)', color: 'var(--dark-navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.2rem'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
