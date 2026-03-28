// frontend/src/pages/LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const user = await login(email, password);
    // If user is admin, go to admin dashboard, else go home
    navigate(user.role === 'admin' ? '/admin' : '/home');
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed.');
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="content">
    <div className="container">
      <h2>Login to Travel Journal</h2>

      {error && (
        <p style={{
          color: '#7a1a1a',
          background: 'rgba(180,60,60,0.12)',
          border: '1px solid #b43c3c',
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          placeholder="e.g., krishane@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <input
          type="submit"
          id="newcolor"
          value={loading ? 'Logging in...' : 'Login'}
          disabled={loading}
        />
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <Link to="/register" style={{ color: '#475522', fontWeight: 'bold' }}>Register here</Link>
      </p>
    </div>
    </main>
  );
};

export default LoginPage;