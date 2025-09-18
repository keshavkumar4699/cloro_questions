"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import config from "@/config";

const LoginForm = ({ onClose, onSwitchToRegister, error, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: config.auth.callbackUrl || '/',
      });

      setLoading(false);
      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
      } else if (result?.ok) {
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', { callbackUrl: config.auth.callbackUrl || '/' });
  };

  return (
    <>
      <h3 className="font-bold text-2xl text-center mb-6 text-base-content">
        <span className="text-primary">{config.appName}</span> Login
      </h3>
      
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-base-content mb-1">Email</label>
          <input 
            type="email" 
            id="login-email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your@email.com" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-base-content mb-1">Password</label>
          <input 
            type="password" 
            id="login-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Your Password" 
            className="input input-bordered w-full rounded-md" 
          />
        </div>
        
        {error && <p className="text-error text-sm text-center">{error}</p>}
        
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6 rounded-md" 
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Sign In"}
        </button>
      </form>
      
      <div className="divider my-6">OR</div>
      
      <button 
        onClick={handleGoogleSignIn} 
        className="btn btn-outline w-full rounded-md flex items-center justify-center gap-2" 
        disabled={loading}
      >
        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5"/> 
        Sign In with Google
      </button>
      
      <p className="text-center text-sm mt-6 text-base-content">
        Don&apos;t have an account?{' '}
        <button 
          onClick={() => { onSwitchToRegister(); setError(''); }} 
          className="link link-primary font-medium"
        >
          Sign Up
        </button>
      </p>
    </>
  );
};

export default LoginForm;