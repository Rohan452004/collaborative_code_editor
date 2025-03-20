import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity", // Fixed typo: reconnectionAttempt → reconnectionAttempts
    timeout: 10000,
    transports: ["websocket", "polling"], // Added 'polling' as a fallback
  };
  return io(process.env.REACT_APP_BASE_URL, options); // Replace with your EC2 IP or domain
};
