import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2A2D3E' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: '#1E1E2F', border: '2px solid #00FF84' }}>
            <TrendingUp className="h-8 w-8" style={{ color: '#00FF84' }} />
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
            Welcome to FinAnalyst
          </h2>
          <p className="text-sm" style={{ color: '#D1D1D1' }}>
            Sign in to your account to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ 
                  backgroundColor: '#1E1E2F', 
                  borderColor: '#3A3A4A', 
                  color: '#FFFFFF'
                }}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#D1D1D1' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ 
                    backgroundColor: '#1E1E2F', 
                    borderColor: '#3A3A4A', 
                    color: '#FFFFFF'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: '#D1D1D1' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: '#D1D1D1' }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 hover:bg-green-400"
              style={{ 
                backgroundColor: '#00FF84', 
                color: '#1E1E2F'
              }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#1E1E2F' }}></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: '#D1D1D1' }}>
              Demo: Use test@finanalyst.com / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 