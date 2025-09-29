import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import "../index.css";
import { Link } from 'react-router-dom';


export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'Reset link sent');
        const msg = "Please check your email for the reset link.";
        // Optionally redirect to login
        handleSuccess(msg);
        setTimeout(() => {
          navigate('/login');
        }, 500);
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>🔑 Forgot Password</h2>
        <p className="subtitle">
          Enter your email to receive a reset link
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send reset link</button>
        </form>
        <div className="redirect-link" style={{ marginTop: '15px' }}>
            <center>
                Back to Login <Link to="/login">Login</Link>
              </center>
        </div>
      </div>
    </div>
  );
}
