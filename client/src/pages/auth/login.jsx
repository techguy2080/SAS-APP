import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Define colors for consistency
const DEEP_BLUE = '#0052CC';
const HOVER_BLUE = '#0747A6';

const Login = () => {
  const [formValues, setFormValues] = useState({ username: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!formValues.username) errors.username = "Username is required";
    if (!formValues.password) errors.password = "Password is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(formValues.username, formValues.password);
      navigate("/admin/dashboard");
    } catch {
      setFormErrors({ password: "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand/Info */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0052CC] via-[#0066FF] to-[#00B8D9] items-center justify-center relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0066FF]/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#00B8D9]/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center px-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow">
            Kidega Apartments
          </h1>
          <p className="text-lg text-blue-100 mb-6 text-center">
            Welcome to your property management portal.
          </p>
          <ul className="text-blue-50 text-base space-y-2 text-left max-w-xs">
            <li>
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
              Precision, speed, and style in every service.
            </li>
            <li>
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
              Hands-on professional training for excellence.
            </li>
            <li>
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>
              We teach, apply, and stand by quality.
            </li>
          </ul>
        </div>
      </div>
      {/* Right: Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-blue-50 bg-white">
          <h2 className="text-3xl font-bold text-center text-[#0052CC] mb-8">
            Sign in to Kidega
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                ref={usernameRef}
                type="text"
                name="username"
                value={formValues.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.username
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#0052CC]"
                } focus:outline-none focus:ring-2 focus:ring-[#0052CC]`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                ref={passwordRef}
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.password
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#0052CC]"
                } focus:outline-none focus:ring-2 focus:ring-[#0052CC]`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#0052CC] hover:bg-[#0066FF] text-white font-semibold text-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
            {error && (
              <div className="mt-4 p-3 rounded bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Kidega Apartments. Powered by Docker Desktop theme.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;