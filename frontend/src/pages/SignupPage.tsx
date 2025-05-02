import  { SetStateAction, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function SignUpPage() {
  const [step, setStep] = useState(1); // Step 1 or Step 2
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle input changes for Step 1
  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle OTP input change for Step 2
  const handleOtpChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setOtp(e.target.value);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sendotp`,
        { email: formData.email }
      );

      if (res.data.success) {
        setTimeLeft(300);
        toast.success("New OTP sent to your email!");
      } else {
        throw new Error(res.data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      toast.error("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to the user's email
  const handleSendOtp = async () => {
    console.log("Sending OTP...");
    console.log(`${import.meta.env.VITE_BACKEND_URL}/api/sendotp`);
    setLoading(true); // Start loading
    try {
      // Validate form data
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("All fields are required.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Simulate backend call to send OTP
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sendotp`,
        { email: formData.email }
      );

      if (res.data.success) {
        setStep(2); // Move to Step 2
        setError("");
        toast.success("OTP sent to your email!");
      } else {
        throw new Error(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Step 2: Verify OTP and create user
  const handleSignUp = async () => {
    console.log("Signing Up...");
    setLoading(true); // Start loading
    try {
      // Validate OTP
      if (!otp) {
        setError("OTP is required.");
        return;
      }

      // Simulate backend call to sign up
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/signup`,
        {
          ...formData,
          otp,
        }
      );

      console.log(res.data);

      if (res.data.success) {
        toast.success("Sign up successful!");
        navigate("/login"); // Redirect to login page
      } else {
        throw new Error(res.data.message || "Failed to create user.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Failed to create user.");
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

      {/* Sign Up Form */}
      <motion.div
        className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl p-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500 mb-6">
          {step === 1 ? "Sign Up 🚀" : "Verify OTP 🔥"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          // Step 1: Collect user details
          <>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="mb-6 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <motion.button
              type="button"
              onClick={handleSendOtp}
              className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                "Next"
              )}
            </motion.button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter OTP sent to your email"
                required
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-400">
                OTP expires in:{" "}
                <span className="font-semibold text-green-400">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendOtp}
                className={`text-sm text-green-400 hover:text-green-300 font-semibold`}
              >
                {loading ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <motion.button
              type="button"
              onClick={handleSignUp}
              className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing Up...
                </div>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-400 hover:text-green-300 font-semibold"
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

export default SignUpPage;
