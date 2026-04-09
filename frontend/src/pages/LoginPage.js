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
      // 1. Call the login function from AuthContext
      const userData = await login(email, password);

      /**
       * DEBUGGING TIP: 
       * If Admin login isn't working, check your browser console for this log.
       * If 'role' is undefined here, your backend isn't sending it back!
       */
      console.log("Logged in User Data:", userData);

      // 2. Check the role. 
      // We use lowercase 'admin' and check if the property exists.
      if (userData && userData.role === 'admin') {
        console.log("Redirecting to Admin Dashboard...");
        navigate('/admin');
      } else {
        console.log("Redirecting to User Home...");
        navigate('/home');
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Handle various error formats from the backend
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content">
      <div className="container" style={{ maxWidth: '400px', margin: '40px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login to Travel Journal ✈️</h2>

        {error && (
          <div style={{
            color: '#7a1a1a',
            background: 'rgba(180,60,60,0.12)',
            border: '1px solid #b43c3c',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g., travel@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <input
            type="submit"
            id="newcolor"
            value={loading ? 'Verifying...' : 'Login'}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#8C7E72' : '#475522',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          />
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#475522', fontWeight: 'bold', textDecoration: '<p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#475522', fontWeight: 'bold', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
