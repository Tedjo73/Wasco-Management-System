import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState([]);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', district: '', physicalAddress: '', password: '', email: '' });
  const [updating, setUpdating] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const [custRes, distRes] = await Promise.all([
        axios.get('/customers', { params: { search, district } }),
        axios.get('/customers/districts/all'),
      ]);
      setCustomers(custRes.data);
      setDistricts(distRes.data);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [search, district]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      fullName: customer.full_name,
      phone: customer.phone_number || '',
      district: customer.district || '',
      physicalAddress: customer.physical_address || '',
      email: customer.email || '',
      password: '' 
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`/customers/${editingCustomer.account_number}`, editForm);
      setEditingCustomer(null);
      fetchCustomers(); 
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Manage Customers</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name, account, email..."
          style={{ flex: 1, padding: '0.75rem' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ padding: '0.75rem', width: '200px' }} value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {districts.map(d => <option key={d.district_id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {error && <div style={{ color: '#ff4242', background: '#ffe3e3', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Account No.</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>District</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td></tr>
            ) : customers.map(c => (
              <tr key={c.account_number} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary-blue)' }}>{c.account_number}</td>
                <td style={{ padding: '1rem' }}>{c.full_name}</td>
                <td style={{ padding: '1rem' }}>{c.district || '—'}</td>
                <td style={{ padding: '1rem' }}>{c.phone_number || '—'}</td>
                <td style={{ padding: '1rem' }}>{c.email}</td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleEdit(c)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={() => setEditingCustomer(null)}>&times;</button>
            <h3>Update Customer</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Editing {editingCustomer.account_number}</p>
            
            <form onSubmit={handleUpdate}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    value={editForm.fullName} 
                    onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Reset Password</label>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={editForm.password} 
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>District</label>
                <select 
                  value={editForm.district} 
                  onChange={e => setEditForm({...editForm, district: e.target.value})}
                  required
                >
                  {districts.map(d => <option key={d.district_id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Physical Address</label>
                <textarea 
                  value={editForm.physicalAddress} 
                  onChange={e => setEditForm({...editForm, physicalAddress: e.target.value})}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
