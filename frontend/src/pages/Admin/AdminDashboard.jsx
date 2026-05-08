import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [leakages, setLeakages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billStats, custStats, leakRes] = await Promise.all([
          axios.get('/bills/stats'),
          axios.get('/customers/stats'),
          axios.get('/leakages'),
        ]);
        setStats(billStats.data);
        setCustomerStats(custStats.data);
        setLeakages((leakRes.data || []).slice(0, 3));
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n) => n != null ? n.toLocaleString() : '—';

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Customers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {loading ? '...' : fmt(customerStats?.totalCustomers)}
          </p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #2bce89' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Bills (This Month)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {loading ? '...' : fmt(stats?.billsGeneratedThisMonth)}
          </p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #feca57' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Revenue Collected</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {loading ? '...' : `M ${fmt(stats?.totalRevenue)}`}
          </p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ff6b6b' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Outstanding Balances</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {loading ? '...' : `M ${fmt(stats?.outstandingBalance)}`}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/admin/bills" className="btn-primary" style={{ textAlign: 'center' }}>Generate Monthly Bills</Link>
            <Link to="/admin/customers" className="btn-outline" style={{ textAlign: 'center' }}>Manage Customers</Link>
            <Link to="/admin/rates" className="btn-outline" style={{ textAlign: 'center' }}>Edit Billing Rates</Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Leakage Reports</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : leakages.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No leakage reports yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {leakages.map(l => (
                <li key={l.report_id} style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <span style={{
                    color: l.urgency === 'High' ? '#ff6b6b' : l.urgency === 'Medium' ? '#feca57' : '#2bce89'
                  }}>●</span>{' '}
                  <strong>{l.urgency}</strong> urgency — {l.location}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {l.full_name || l.account_number} · {l.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
