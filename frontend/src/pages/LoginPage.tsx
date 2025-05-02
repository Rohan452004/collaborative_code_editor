import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleLogo from "../assets/GoogleLogo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const BACKEND = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(`${BACKEND}/api/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        toast.success("Logged In Successfully!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputEnter = (e: { code: string }) => {
    if (e.code === "Enter") {
      handleLogin();
    }
  };

  // 🔹 Google Login Handler
  const googleLogin = useGoogleLogin({
  onSuccess: async (response) => {
    try {
      // 🔹 Send only access_token to backend
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
        token: response.access_token,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success("Logged in with Google!");
        navigate("/dashboard");
      } else {
        toast.error("Google login failed!");
      }
    } catch (error) {
      toast.error("Google Authentication Error!");
    }
  },
  onError: () => toast.error("Google Sign-In Failed!"),
});



   return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden px-4">
      {/* Floating Gradient Blur Effect - Adjusted for mobile */}
      <div className="absolute inset-0">
        <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-blue-500 opacity-30 rounded-full filter blur-3xl top-20 left-4 md:left-10 animate-pulse"></div>
        <div className="absolute w-56 h-56 md:w-80 md:h-80 bg-purple-500 opacity-30 rounded-full filter blur-3xl bottom-10 right-4 md:right-20 animate-pulse"></div>
      </div>

      {/* Login Card - Responsive adjustments */}
      <motion.div
        className="bg-gray-950 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md md:w-96 text-center z-10 border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img className="w-20 md:w-24 mx-auto mb-4" src="Logo.PNG" alt="App Logo" />
        <h4 className="text-xl md:text-2xl font-semibold mb-6 text-blue-400">
          Login to Your Account
        </h4>

        <div className="space-y-4 md:space-y-5">
          <input
            type="email"
            className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            onKeyUp={handleInputEnter}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              onKeyUp={handleInputEnter}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 md:top-3 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Buttons - Adjusted padding for mobile */}
          <motion.button
            className="w-full bg-blue-500 text-white p-2 md:p-3 rounded-md text-sm md:text-base font-semibold hover:bg-blue-400 transition-all shadow-md disabled:bg-gray-600"
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </motion.button>

          {/* Google Sign-In Button - Adjusted for mobile */}
          <motion.button
            className="w-full flex items-center justify-center gap-2 bg-white text-black p-2 md:p-3 rounded-md text-sm md:text-base font-semibold shadow-md hover:bg-gray-200 transition-all border border-gray-300 mt-2"
            onClick={() => googleLogin()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={GoogleLogo}
              alt="Google Logo"
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <span>Continue with Google</span>
          </motion.button>

          {/* Links - Text size adjustment */}
          <p className="text-xs md:text-sm text-gray-400 mt-2">
            Forgot Password?{" "}
            <a
              href="/forgot-password"
              className="text-blue-400 hover:underline hover:text-blue-300"
            >
              Click Here
            </a>
          </p>

          <p className="text-xs md:text-sm text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-400 hover:underline hover:text-blue-300"
            >
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>

      {/* Footer - Adjusted positioning */}
      <footer className="absolute bottom-4 md:bottom-5 text-gray-400 text-xs md:text-sm z-10 text-center">
        <p>&copy; 2025 CodeIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;