import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = location.pathname.split("/").at(-1);

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      // Validate inputs
      if (!password || !confirmPassword) {
        setError("All fields are required.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        setError("Password must be at least 8 characters long, include uppercase & lowercase letters, a number, and a special character.");
        return;
     }

      // Send API request to update password
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reset-password`,
        { password, confirmPassword, token: resetToken }
      );

      if (res.data.success) {
        toast.success("Password updated successfully!");
        navigate("/login");
      } else {
        throw new Error(res.data.message || "Failed to update password.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      toast.error("Failed to update password.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      {/* Floating Neon Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-60 h-60 bg-blue-500 opacity-20 rounded-full filter blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-purple-500 opacity-20 rounded-full filter blur-3xl bottom-10 right-20 animate-bounce"></div>
      </div>

      {/* Update Password Form */}
      <motion.div
        className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl p-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-extrabold text-center bg-clip-text text-blue-400 mb-6">
          Update Password 🔑
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your new password"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </div>
            ) : (
              "Update Password"
            )}
          </motion.button>
        </form>

        {/* Back to Login Link */}
        <p className="mt-6 text-center text-gray-400">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Login
          </button>
        </p>
      </motion.div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-gray-950 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-2 text-gray-400 text-xs md:text-sm z-10">
        <p>&copy; 2025 CodeIt. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UpdatePassword;
