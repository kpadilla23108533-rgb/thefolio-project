import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dob: '',
    experience: '',
    terms: false
  });
  
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.server) {
      setErrors(prev => ({ ...prev, [field]: null, server: null }));
    }
  };

  const validateForm = async (e) => {
    e.preventDefault();
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullname.trim()) errs.fullname = "Full name is required.";

    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      errs.email = "Please enter a valid email format.";
    }

    if (!formData.username.trim()) errs.username = "Username is required.";
    if (formData.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match.";

    if (!formData.dob) {
      errs.dob = "Date of birth is required.";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) errs.dob = "You must be at least 18 years old.";
    }

    if (!formData.experience) errs.experience = "Please select your experience level.";
    if (!formData.terms) errs.terms = "You must agree to the terms.";

    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        /**
         * FIXED: We use the relative path '/auth/register'. 
         * Axios will combine this with your baseURL from axios.js.
         * Do NOT put the full domain here.
         */
        await API.post('/auth/register', {
          name: formData.fullname,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          experience: formData.experience,
          dob: formData.dob // Added dob to the payload in case your backend needs it
        });

        alert("Registration successful! Welcome to the club.");
        navigate('/login');
      } catch (err) {
        // Detailed error logging to help you debug in the console
        console.error("Registration Error Details:", err.response);
        
        setErrors({ 
          server: err.response?.data?.message || "Registration failed. The server might be unreachable." 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="content">
      <div className="container">
        <h2>Join the Club 🗺️</h2>
        <p style={{ textAlign: 'center', color: '#8C7E72', marginBottom: '20px' }}>
          Explore, discover, and share your journey with us.
        </p>

        {errors.server && (
          <div style={{ 
            color: '#b43c3c', 
            background: 'rgba(180,60,60,0.1)', 
            padding: '12px', 
            borderRadius: '8px', 
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            {errors.server}
          </div>
        )}

        <form onSubmit={validateForm}>
          <label htmlFor="fullname">Full Name:</label>
          <input type="text" id="fullname" placeholder="Enter your full name"
            value={formData.fullname} onChange={e => update('fullname', e.target.value)} />
          {errors.fullname && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.fullname}</span>}

          <label htmlFor="email">Email Address:</label>
          <input type="email" id="email" placeholder="example@mail.com"
            value={formData.email} onChange={e => update('email', e.target.value)} />
          {errors.email && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.email}</span>}

          <label htmlFor="username">Username:</label>
          <input type="text" id="username" placeholder="Choose a username"
            value={formData.username} onChange={e => update('username', e.target.value)} />
          {errors.username && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.username}</span>}

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" placeholder="Min. 8 characters"
            value={formData.password} onChange={e => update('password', e.target.value)} />
          {errors.password && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.password}</span>}

          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" placeholder="Repeat your password"
            value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
          {errors.confirmPassword && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.confirmPassword}</span>}

          <label htmlFor="dob">Date of Birth:</label>
          <input type="date" id="dob"
            value={formData.dob} onChange={e => update('dob', e.target.value)} />
          {errors.dob && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.dob}</span>}

          <p style={{ marginTop: '15px' }}><strong>Experience Level:</strong></p>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
            {['Beginner', 'Intermediate', 'Expert'].map(level => (
              <label key={level} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  style={{ width: 'auto', marginRight: '5px' }}
                  checked={formData.experience === level}
                  onChange={e => update('experience', e.target.value)}
                />
                {level}
              </label>
            ))}
          </div>
          {errors.experience && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.experience}</span>}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={formData.terms}
              onChange={e => update('terms', e.target.checked)}
            />
            <span style={{ fontSize: '0.9rem' }}>I agree to the terms and conditions</span>
          </label>
          {errors.terms && <span style={{color: '#b43c3c', fontSize: '0.8rem'}}>{errors.terms}</span>}

          <input 
            type="submit" 
            className="btn-submit" 
            value={loading ? 'Creating Account...' : 'Sign up for free'} 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#475522',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          />
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#475522', fontWeight: 'bold' }}>
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;