import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import axios from 'axios';
import { getBackendURL } from '../../lib/utils';
import '../admin.css';

const BACKEND_URL = getBackendURL();

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/admins/login`, {
        username,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
      
      // Full reload to ensure clean admin state
      window.location.href = '/admin';
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || 'Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1C2A3A 0%, #2D3E50 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* MSPN DEV Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <img
              src="/mspn-logo-transparent.png"
              alt="MSPN DEV Logo"
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.3))'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1C2A3A',
            margin: '0 0 8px 0'
          }}>MSPN DEV Admin</h1>
          <p style={{
            color: '#6B7280',
            margin: 0
          }}>Sign in to manage your website</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#forgot" style={{
              fontSize: '14px',
              color: '#7C5CFF',
              textDecoration: 'none'
            }}>Forgot password?</a>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6B7280'
        }}>
          <a href="/" style={{ color: '#7C5CFF', textDecoration: 'none' }}>
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
