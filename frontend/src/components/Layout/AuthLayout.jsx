import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--light-blue) 100%)',
      padding: '2rem'
    }}>
      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <Link to="/" style={{ color: 'var(--white)', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          💧 WASCO
        </Link>
      </div>
      
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
