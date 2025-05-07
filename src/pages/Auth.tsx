import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/questions"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Prompt Wars</h1>
          <p className="text-gray-600 mt-2">Your AI-powered DSA practice companion</p>
        </div>
        
        {isLoginView ? (
          <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
