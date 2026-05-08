import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PayBill = () => {
  const location = useLocation();
  const preloadedBill = location.state?.bill || null;

  const [bills, setBills] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState(preloadedBill?.bill_id || '');
  const [selectedBill, setSelectedBill] = useState(preloadedBill);
  const [amount, setAmount] = useState(preloadedBill ? parseFloat(preloadedBill.amount_due) : 0);
  const [method, setMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/bills/my', { params: { status: 'Unpaid' } })
      .then(res => {
        setBills(res.data.bills || []);
        if (!preloadedBill && res.data.bills?.length > 0) {
          const first = res.data.bills[0];
          setSelectedBillId(first.bill_id);
          setSelectedBill(first);
          setAmount(parseFloat(first.amount_due));
        }
      })
      .catch(() => {});
  }, []);

  const handleBillChange = (id) => {
    const bill = bills.find(b => b.bill_id === parseInt(id));
    setSelectedBillId(id);
    setSelectedBill(bill || null);
    setAmount(bill ? parseFloat(bill.amount_due) : 0);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/payments', {
        billId: selectedBillId,
        amountPaid: amount,
        paymentMethod: method,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: '#0f8a4f' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{success.message}</p>
        <p><strong>Reference:</strong> {success.payment?.reference_number}</p>
        <p><strong>Amount Paid:</strong> M {parseFloat(success.payment?.amount_paid).toFixed(2)}</p>
        <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.href = '/customer/bills'}>
          View My Bills
        </button>
      </div>
    );
  }

  return (
    <div className="grid-2 animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ background: 'var(--bg-color)', border: 'none' }}>
        <h3>Bill Summary</h3>

        {bills.length > 1 && (
          <div className="form-group">
            <label>Select Bill</label>
            <select value={selectedBillId} onChange={e => handleBillChange(e.target.value)}>
              {bills.map(b => (
                <option key={b.bill_id} value={b.bill_id}>
                  {b.month} {b.year} — M {parseFloat(b.amount_due).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedBill ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{selectedBill.month} {selectedBill.year}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px dashed #ccc' }}>
              <span>Bill ID:</span><strong>BL-{selectedBill.bill_id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px dashed #ccc' }}>
              <span>Total Usage:</span><strong>{parseFloat(selectedBill.usage_m3).toFixed(2)} m³</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px dashed #ccc' }}>
              <span>Status:</span>
              <strong style={{ color: selectedBill.status === 'Overdue' ? '#d97706' : '#ff4242' }}>{selectedBill.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.2rem', color: 'var(--primary-blue)' }}>
              <span>Amount Due:</span><strong>M {parseFloat(selectedBill.amount_due).toFixed(2)}</strong>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No unpaid bills found.</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Payment Gateway</h3>
        {error && <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handlePay}>
          <div className="form-group">
            <label>Amount to Pay (M)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" required />
            <small style={{ color: 'var(--text-muted)' }}>You can make partial payments.</small>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { value: 'mpesa', label: 'Mobile Money — M-Pesa' },
                { value: 'ecocash', label: 'Mobile Money — Ecocash' },
                { value: 'card', label: 'Debit / Credit Card' },
                { value: 'bank', label: 'Bank Transfer' },
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input type="radio" name="method" value={opt.value} checked={method === opt.value} onChange={() => setMethod(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || !selectedBill}>
            {loading ? 'Processing...' : `Confirm Payment of M ${parseFloat(amount || 0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayBill;
