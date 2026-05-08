import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomerPortal = () => {
  const [latestBill, setLatestBill] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, paymentsRes] = await Promise.all([
          axios.get('/bills/my'),
          axios.get('/payments/my'),
        ]);

        const bills = billsRes.data.bills || [];
        const unpaid = bills.find(b => b.status === 'Unpaid');
        setLatestBill(unpaid || bills[0] || null);

        setRecentPayments((paymentsRes.data.payments || []).slice(0, 3));

        const chart = bills.slice(0, 6).reverse().map(b => ({
          month: b.month.substring(0, 3),
          usage: parseFloat(b.usage_m3),
        }));
        setUsageHistory(chart);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  return (
    <div className="animate-fade-in">
      {error && (
        <div style={{ background: '#ffe3e3', color: '#ff4242', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--primary-blue) 100%)', color: 'white' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8 }}>
              {latestBill ? `Current Bill — ${latestBill.month} ${latestBill.year}` : 'No outstanding bills'}
            </p>
            <h2 style={{ color: 'white', margin: '0.5rem 0', fontSize: '2.5rem' }}>
              {latestBill ? `M ${parseFloat(latestBill.amount_due).toFixed(2)}` : 'M 0.00'}
            </h2>
            <p style={{ margin: 0, color: latestBill?.status === 'Overdue' ? '#ffbaba' : '#a0f0c8' }}>
              {latestBill ? `Due: ${latestBill.due_date?.substring(0, 10)} — ${latestBill.status}` : 'All bills are paid ✓'}
            </p>
          </div>
          <div>
            {latestBill && latestBill.status !== 'Paid' && (
              <Link to="/customer/pay" state={{ bill: latestBill }} className="btn-primary"
                style={{ background: 'white', color: 'var(--primary-blue)', fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Pay Now
              </Link>
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Account Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2bce89' }}></div>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Active</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {latestBill?.account_number || '—'}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Water Usage (Last 6 Months)</h3>
          {usageHistory.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,119,182,0.1)' }} />
                  <Bar dataKey="usage" fill="var(--primary-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No usage data available yet.</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Payments</h3>
            <Link to="/customer/history" style={{ fontSize: '0.9rem' }}>View All</Link>
          </div>
          {recentPayments.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.payment_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '1rem 0' }}>{p.payment_date?.substring(0, 10)}</td>
                    <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>M {parseFloat(p.amount_paid).toFixed(2)}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{p.reference_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No payment history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
