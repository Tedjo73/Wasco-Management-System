import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'manager') navigate('/manager');
      else navigate('/customer');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
      {error && <div style={{ color: '#ff6b6b', background: '#ffe3e3', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email or Account Number</label>
          <input 
            type="text" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email or account #"
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <a href="#" style={{ fontSize: '0.9rem' }}>Forgot Password?</a>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </>
  );
};

export default Login;
