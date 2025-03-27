import React, { useState } from "react";
import { MessageCircle, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; 

const AuthLayout = () => {
  const [view, setView] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { login, register, resetPassword } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccessMessage("");
    setLoading(true);

    try {
      if (view === "login") {
        await login(email, password); 
        // No need to do anything else - the App component will handle the redirect
      } else if (view === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        
        // Register the user - this will:
        // 1. Call the API to create the account
        // 2. Set the authentication token
        // 3. Set the needsProfileSetup flag through the useAuth hook
        // 4. App.jsx will handle redirecting to the profile setup page
        await register(name, email, password, confirmPassword); 
        
        // Don't set view back to login or show success message
        // The user will be automatically redirected to profile setup
      } else if (view === "forgot-password") {
        // If resetPassword is implemented, use it here
        if (typeof resetPassword === 'function') {
          await resetPassword(email);
          setSuccessMessage("Password reset email sent. Please check your inbox.");
        } else {
          // Fallback to alert if resetPassword is not implemented
          alert("Password reset functionality is not implemented yet.");
        }
      }
    } catch (err) {
      // Enhanced error handling
      if (err.response?.data) {
        // Format Django REST error messages
        const errorData = err.response.data;
        
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } 
        else if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`);
        }
        else if (errorData.password1) {
          setError(`Password: ${errorData.password1[0]}`);
        }
        else if (errorData.username) {
          setError(`Username: ${errorData.username[0]}`);
        }
        else if (errorData.detail) {
          setError(errorData.detail);
        }
        else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch (view) {
      case "signup":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                User Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="W Euphoric"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create account"
              )}
            </button>

            <p className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setView("login")}
                disabled={loading}
                className="text-sm text-violet-600 hover:text-violet-500 disabled:opacity-50"
              >
                Already have an account? Sign in
              </button>
            </p>
          </form>
        );

      case "forgot-password":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Reset password"
              )}
            </button>

            <p className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setView("login")}
                disabled={loading}
                className="inline-flex items-center text-sm text-violet-600 hover:text-violet-500 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to sign in
              </button>
            </p>
          </form>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => setView("forgot-password")}
                disabled={loading}
                className="text-sm text-violet-600 hover:text-violet-500 disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setView("signup")}
                disabled={loading}
                className="text-sm text-violet-600 hover:text-violet-500 disabled:opacity-50"
              >
                Don't have an account? Sign up
              </button>
            </p>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-4 bg-violet-100 rounded-full blur-lg opacity-75"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <MessageCircle className="w-10 h-10 text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
              Whisper
            </h2>
            <p className="mt-2 text-gray-600">
              {view === "login" && "Welcome back"}
              {view === "signup" && "Create your account"}
              {view === "forgot-password" && "Reset your password"}
            </p>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm text-center mb-4">
            {successMessage}
          </div>
        )}
        
        {/* Form */}
        {renderView()}
      </div>
    </div>
  );
};

export default AuthLayout;