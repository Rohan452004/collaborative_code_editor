import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";
import { motion } from "framer-motion";

axios.defaults.withCredentials = true;

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (isTimerActive && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      toast.error("Request timed out! Please try again later.");
      setLoading(false);
    }
    return () => clearInterval(countdown);
  }, [isTimerActive, timer]);

  const createNewRoom = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const BACKEND = import.meta.env.VITE_BACKEND_URL;
      const id = uuidV4();
      setLoading(true);
      const response = await axios.post(
        `${BACKEND}/api/createRoom`,
        { id, owner: username }
      );

      if (response.data.success) {
        setRoomId(id);
        setUsername("Owner");
        toast.success("Created a new room");
        navigate(`/editor/${id}`, {
          state: { username: "Owner", isOwner: true },
        });
      } else {
        toast.error("Failed to create room");
      }
    } catch (error) {
      toast.error("Error creating room");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username are required");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Check if the user is the owner or already approved
      let checkResponse;
      try {
        const BACKEND = import.meta.env.VITE_BACKEND_URL;
        checkResponse = await axios.get(
          `${BACKEND}/api/checkUserRole?roomId=${roomId}&username=${username}`,
          { withCredentials: true }
        );
      } catch (error) {
        toast.error("Error verifying user role. Please try again.");
        console.error("Error in checkUserRole:", error);
        setLoading(false);
        return;
      }

      console.log("User role check response:", checkResponse.data);

      if (
        checkResponse.data.role === "owner" ||
        checkResponse.data.role === "approved"
      ) {
        toast.success("Access granted! Redirecting...");
        navigate(`/editor/${roomId}`, { state: { username } });
        return;
      }

      // Step 2: If not owner or approved, proceed to request access
      setIsTimerActive(true);
      setTimer(120);

      let response;
      try {
        const BACKEND = import.meta.env.VITE_BACKEND_URL;
        response = await axios.post(
          `${BACKEND}/api/requestAccess`,
          { roomId, username },
          { withCredentials: true }
        );
      } catch (error) {
        toast.error("Access Denied !");
        console.error("Error in requestAccess:", error);
        setLoading(false);
        setIsTimerActive(false);
        return;
      }

      console.log("Requesting access...");
      console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success("Access request sent to the room owner");

        let approved = false;
        let retryCount = 0;
        const maxRetries = 41;

        while (!approved && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          retryCount++;

          let statusResponse;
          try {
            const BACKEND = import.meta.env.VITE_BACKEND_URL;
            statusResponse = await axios.get(
              `${BACKEND}/api/check-access?roomId=${roomId}&username=${username}`,
              { withCredentials: true }
            );
          } catch (error) {
            toast.error("Error checking access status.");
            console.error("Error in check-access:", error);
            setLoading(false);
            setIsTimerActive(false);
            return;
          }

          console.log("Access status response:", statusResponse.data);

          if (statusResponse.data.status === "approved") {
            approved = true;
            toast.success("Access approved! Redirecting...");
            setLoading(false);
            setIsTimerActive(false);
            navigate(`/editor/${roomId}`, { state: { username } });
            return;
          } else if (statusResponse.data.status === "denied") {
            toast.error("Access denied!");
            setLoading(false);
            setIsTimerActive(false);
            return;
          }
        }

        if (!approved) {
          toast.error("Request timed out! Please try again later.");
        }
      } else {
        toast.error(response.data.message || "Failed to request access");
      }
    } catch (error) {
      toast.error("Unexpected error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  
  const handleLogout = async () => {

  try{
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, {}, { withCredentials: true });
    if (response.data.success) {
      toast.success("Logged out successfully!");
    } else {
      toast.error("Logout failed!");
    }
  
  }catch(error){
    toast.error("Logout failed!");
    console.error("Logout error:", error);
  }finally{
    navigate("/");
    sessionStorage.clear();
    localStorage.clear();
  }

  };

return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden px-4">
    {/* Logout Button */}
    <motion.div
      className="absolute top-4 right-4 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={handleLogout}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Logout
      </button>
    </motion.div>

    {/* Floating Gradient Blur Effect */}
    <div className="absolute inset-0">
      <div className="absolute w-80 h-80 md:w-96 md:h-96 bg-blue-500 opacity-30 rounded-full filter blur-3xl top-10 left-5 md:top-20 md:left-10 animate-pulse"></div>
      <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-purple-500 opacity-30 rounded-full filter blur-3xl bottom-5 right-10 md:bottom-10 md:right-20 animate-pulse"></div>
    </div>

    {/* Join Room Card */}
    <motion.div
      className="bg-gray-950 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md text-center z-10 border border-gray-700"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img className="w-20 md:w-24 mx-auto mb-4" src="Logo.PNG" alt="logo" />
      <h4 className="text-xl md:text-2xl font-semibold mb-6 text-blue-400">
        Enter ROOM ID to Join
      </h4>

      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-2 md:p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="ROOM ID"
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId}
          disabled={loading}
        />
        <input
          type="text"
          className="w-full p-2 md:p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="USERNAME"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          disabled={loading}
        />
        <motion.button
          className="w-full bg-blue-500 text-white p-2 md:p-3 rounded-md font-semibold hover:bg-blue-400 transition-all shadow-md disabled:bg-gray-600"
          onClick={joinRoom}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Processing..." : "Request to Join"}
        </motion.button>

        {isTimerActive && (
          <div className="mt-4">
            <p className="text-xs md:text-sm text-gray-400 font-semibold">
              Request expires in {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")} minutes
            </p>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500"
                style={{ width: `${(timer / 120) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <span className="block text-xs md:text-sm text-gray-400 mt-4">
          Don't have an invite? &nbsp;
          <a
            onClick={createNewRoom}
            href="#"
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Create a new room
          </a>
        </span>
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

export default Home;
