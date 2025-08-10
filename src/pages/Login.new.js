import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await login(formData.email, formData.password);
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }
      onLogin(data);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">MemeVerse</h1>
            <p className="text-gray-500 text-sm">
              Sign in to see photos and videos from your friends.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Phone number, username, or email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-blue-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
