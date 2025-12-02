import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password min 6 chars');
    if (password !== confirm) return toast.error('Passwords do not match');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'Password reset');
        navigate('/login');
      } else {
        toast.error(result.message || 'Invalid or expired token');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // 
  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>🔐 Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit">Set new password</button>
        </form>
      </div>
    </div>
  );
}
