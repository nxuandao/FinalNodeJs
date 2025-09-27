import React, { useEffect, useState } from 'react';
import { handleSuccess } from '../utils';
import { useNavigate } from 'react-router-dom';
function Home() {
  const [loggedInUser, setLoggedInUser] = useState('Guest');
  const navigate = useNavigate();

  useEffect(() => {
  const storedUser = localStorage.getItem('loggedInUser');
  if (storedUser) {
    setLoggedInUser(storedUser);
  }
}, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div>
      <h1>Xin chào, {loggedInUser}</h1>
      {loggedInUser !== 'Guest' && (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
}

export default Home;
