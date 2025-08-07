import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden px-4">
      {/* Floating Gradient Blur Effect */}
      <div className="absolute inset-0">
        <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-blue-500 opacity-20 rounded-full filter blur-3xl top-10 left-5 md:top-20 md:left-10 animate-float"></div>
        <div className="absolute w-56 h-56 md:w-80 md:h-80 bg-purple-500 opacity-20 rounded-full filter blur-3xl bottom-5 right-8 md:bottom-10 md:right-20 animate-float-delay"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full px-6 py-4 flex justify-between items-center max-w-6xl mx-auto z-10">
        {/* Logo */}
        <motion.img
          src="Logo.PNG"
          alt="CodeIt Logo"
          className="h-12 md:h-14 cursor-pointer"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4">
          <motion.button
            className="px-6 py-2 text-lg font-semibold bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login
          </motion.button>
          <motion.button
            className="px-6 py-2 text-lg font-semibold bg-blue-600 bg-opacity-90 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-blue-500 transition-all border border-blue-500 border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </motion.button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            {/* Hamburger Icon */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {menuOpen ? (
                <span className="text-2xl">✖</span> // Close Icon
              ) : (
                <span className="text-2xl">☰</span> // Hamburger Icon
              )}
            </motion.div>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 right-6 bg-gray-800 bg-opacity-90 backdrop-blur-md p-4 rounded-lg shadow-lg flex flex-col space-y-3 md:hidden z-50 border border-gray-700"
        >
          <motion.button
            className="px-6 py-2 text-lg font-semibold bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login
          </motion.button>
           <motion.button
            className="px-6 py-2 text-lg font-semibold bg-blue-600 bg-opacity-90 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-blue-500 transition-all border border-blue-500 border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </motion.button>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.div
        className="text-center px-4 md:px-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          The Future of{" "}
          <span className="text-blue-400">Collaborative Coding</span>
        </h2>
        <p className="mt-3 md:mt-4 text-lg md:text-xl text-gray-300 max-w-xl md:max-w-2xl mx-auto">
          Code together in real-time with seamless chat, audio, and video. Join
          rooms and sync instantly with teammates.
        </p>

        <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-4">
          <motion.button
            className="px-6 md:px-8 py-3 bg-blue-500 bg-opacity-90 backdrop-blur-md text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-400 transition-all border border-blue-400 border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Get Started 🚀
          </motion.button>
          <motion.button
            className="px-6 md:px-8 py-3 bg-white bg-opacity-10 backdrop-blur-md text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login 🔥
          </motion.button>
        </div>
      </motion.div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-20 md:h-32 bg-gradient-to-t from-gray-900 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-4 md:bottom-5 text-gray-400 text-xs md:text-sm z-10">
        <p>&copy; 2025 CodeIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;