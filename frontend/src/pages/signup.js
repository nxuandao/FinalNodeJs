import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
        
    });

    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }
    console.log('signupInfo ->', signupInfo);
    const handleSignup = async (e) => {
        e.preventDefault();
        const {name, email, phone, password} = signupInfo;
        if(!name || !email || !password || !phone){
            return handleError('All fields are required');
        }

        try{
            const url = "http://localhost:8080/auth/signup";
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            console.log('status:', response.status);   // 400 chẳng hạn
console.log('statusText:', response.statusText);
            console.log(signupInfo);
            const result = await response.json();
            const {success, message, error} = result;
            if(success){
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }   , 1000);
            }else if (result.error){  //CHƯA FIX ĐƯỢC LỖI NHẬP MẬT KHẨU YẾU
                // const msg = 
                // (result.error && result.error.details && result.error.details[0] && result.error.details[0].message) || 
                // result.error?.message || 
                // message ||  
                // 'Something went wrong. Please check your email or password.';
                // console.log(result);
                return handleError(result.error.details[0].message || 'Something went wrong. Please try again later.');
            }else if(!result.success){
                return handleError(result.message || 'Something went wrong. Please try again later.');
            }
        }catch(err){
            console.log(err);
            return handleError(err.message || 'Something went wrong. Please try again later.');
        }

    }
  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-left">
          <img
            src="https://i.pinimg.com/736x/2a/2f/b0/2a2fb00d0e6761e25bb60e59c09cc39f.jpg"
            alt="Illustration"
          />
        </div>

        <div className="signup-right">
          <h2>Create an account</h2>
          <form onSubmit={handleSignup}>
            <div>
            <label htmlFor="name">Name</label>
            <div className="form-group">
              <input 
                onChange = {handleChange}
                type="text" 
                placeholder="Enter your name,..." 
                name = "name"
                autoFocus
                value={signupInfo.name}
            />
            </div>
            <label htmlFor="email">Email</label>
            <div className="form-group">
              <input 
              onChange = {handleChange}
                type="email" 
                placeholder="Enter your email,..." 
                name="email"
                value={signupInfo.email}

              />
            </div>
            <label htmlFor="phone">Phone Number</label>
            <div className="form-group">
              <input 
              onChange = {handleChange}
                type="phone" 
                placeholder="Enter your phone number"
                name="phone"
                value={signupInfo.phone}
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="form-group">
              <input 
              onChange = {handleChange}
                type="password" 
                placeholder="Enter your password,..." 
                name="password"
                value={signupInfo.password}
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn primary">
                Register
              </button>
            </div>
            </div>
          </form>
        <ToastContainer />
            <div className="redirect-link">
              <center>Already have an account? <Link to="/login">Login</Link></center>
            </div>
          <p className="terms">
            By registering your details, you agree with our{" "}
            <a href="#">Terms & Conditions</a>, and{" "}
            <a href="#">Privacy and Cookie Policy</a>.
          </p>

          <div className="social-links">
            <a href="#">Facebook</a> · <a href="#">LinkedIn</a> ·{" "}
            <a href="#">Google</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup
