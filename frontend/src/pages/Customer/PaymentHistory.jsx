import { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/payments/my')
      .then(res => {
        setPayments(res.data.payments || []);
        setTotalPaid(res.data.totalPaid || 0);
      })
      .catch(() => setError('Could not load payment history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Payment History</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>
            Total Paid: <span style={{ color: 'var(--dark-navy)' }}>M {parseFloat(totalPaid).toFixed(2)}</span>
          </span>
        </div>
      </div>

      {error && <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading history...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Payment ID</th>
                <th style={{ padding: '1rem' }}>Bill Month</th>
                <th style={{ padding: '1rem' }}>Amount Paid</th>
                <th style={{ padding: '1rem' }}>Method</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Ref No.</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payments recorded yet.
                  </td>
                </tr>
              ) : payments.map(pay => (
                <tr key={pay.payment_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>PAY-{pay.payment_id}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {pay.month} {pay.year}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>M {parseFloat(pay.amount_paid).toFixed(2)}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{pay.payment_method}</td>
                  <td style={{ padding: '1rem' }}>{pay.payment_date?.substring(0, 10)}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-blue)' }}>{pay.reference_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
