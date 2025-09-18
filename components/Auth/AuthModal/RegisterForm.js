"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import config from "@/config";

const RegisterForm = ({ onClose, onSwitchToLogin, error, setError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      setLoading(false);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
      } else {
        const loginResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
          callbackUrl: config.auth.callbackUrl || '/',
        });
        
        if (loginResult?.ok) {
          onClose();
        } else {
          setError("Registration successful, but auto-login failed. Please log in manually.");
          onSwitchToLogin();
        }
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred during registration.");
      console.error("Registration error:", err);
    }
  };

  return (
    <>
      <h3 className="font-bold text-2xl text-center mb-6 text-base-content">
        <span className="text-primary">{config.appName}</span> Register
      </h3>
      
      <form onSubmit={handleRegistration} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-base-content mb-1">Name</label>
          <input 
            type="text" 
            id="reg-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Your Name" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-base-content mb-1">Email</label>
          <input 
            type="email" 
            id="reg-email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your@email.com" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-base-content mb-1">Password</label>
          <input 
            type="password" 
            id="reg-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Create Password" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        <div>
          <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-base-content mb-1">Confirm Password</label>
          <input 
            type="password" 
            id="reg-confirmPassword" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            placeholder="Confirm Password" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        {error && <p className="text-error text-sm text-center">{error}</p>}
        
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6 rounded-md" 
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Sign Up"}
        </button>
      </form>
      
      <p className="text-center text-sm mt-6 text-base-content">
        Already have an account?{' '}
        <button 
          onClick={() => { onSwitchToLogin(); setError(''); }} 
          className="link link-primary font-medium"
        >
          Sign In
        </button>
      </p>
    </>
  );
};

export default RegisterForm;