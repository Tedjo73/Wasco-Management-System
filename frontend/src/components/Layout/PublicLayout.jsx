import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 5%', 
        backgroundColor: 'var(--white)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ color: 'var(--primary-blue)', margin: 0 }}>💧 WASCO</h2>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Home</Link>
          <a href="#services" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Services</a>
          <a href="#about" style={{ color: 'var(--text-main)', fontWeight: 500 }}>About</a>
          <Link to="/login" className="btn-outline">Login</Link>
          <Link to="/register" className="btn-primary">Register</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--dark-navy)', 
        color: 'var(--white)', 
        padding: '3rem 5%', 
        marginTop: 'auto' 
      }}>
        <div className="grid-3">
          <div>
            <h3 style={{ color: 'var(--white)' }}>WASCO</h3>
            <p style={{ color: 'var(--light-blue)' }}>Managing Your Water, Simplified.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--white)' }}>Contact Info</h4>
            <p>Email: info@wasco.co.ls</p>
            <p>Phone: +266 2231 2345</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--white)' }}>Head Office</h4>
            <p>P.O. Box 426, Maseru 100</p>
            <p>Lesotho</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <p>© {new Date().getFullYear()} Water and Sewerage Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
