"use client";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    }
  }, [isOpen, initialMode]);

  const handleClose = () =>{
    if(onClose) {
      onClose();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <dialog id="auth_modal" className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-md p-6 md:p-8 rounded-lg shadow-xl bg-base-100 relative">
        <button 
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
        >
          ✕
        </button>

        {mode === 'login' ? (
          <LoginForm 
            onClose={handleClose}
            onSwitchToRegister={() => setMode('register')}
            error={error}
            setError={setError}
          />
        ) : (
          <RegisterForm 
            onClose={handleClose}
            onSwitchToLogin={() => setMode('login')}
            error={error}
            setError={setError}
          />
        )}
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
};

export default AuthModal;