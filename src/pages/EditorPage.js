import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import Canvas from "../components/Canvas";
import { initSocket } from "../socket";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import { FaPlay, FaChalkboard, FaCode, FaUsers, FaTimes } from "react-icons/fa"; // Import icons

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const terminalRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOutputAreaVisible, setIsOutputAreaVisible] = useState(false);
  const [isCanvasOpen, setCanvasOpen] = useState(false); // State to toggle Canvas
  const [isTerminalOpen, setTerminalOpen] = useState(false); // State to toggle Terminal
  const [isClientsPanelOpen, setClientsPanelOpen] = useState(false); // State to toggle Clients Panel

  const languageMapping = {
    cpp: 54,
    javascript: 63,
    python: 71,
    java: 62,
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/dashboard");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [reactNavigator, roomId, location.state?.username]);

  const runCode = async () => {
    setIsLoading(true);

    if (!language) {
      toast.error("Please select a language.");
      setIsLoading(false);
      return;
    }

    try {
      const BACKEND = process.env.REACT_APP_BASE_URL;
      const response = await fetch(`${BACKEND}/api/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: languageMapping[language],
          source_code: codeRef.current,
          stdin: input,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        pollForOutput(data.token);
      } else {
        toast.error(data.error || "Failed to execute code.");
        setOutput(data.error);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("Failed to execute the code.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const pollForOutput = async (token) => {
    try {
      const BACKEND = process.env.REACT_APP_BASE_URL;
      const response = await fetch(`${BACKEND}/api/get-output/${token}`);
      const data = await response.json();
      if (data.status === "Processing") {
        setTimeout(() => pollForOutput(token), 2000);
      } else {
        setIsOutputAreaVisible(true);
        setOutput(data.output);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("Failed to fetch the output.");
      console.error(err);
      setIsLoading(false);
    }
  };

  if (!location.state) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        {/* Editor Button */}
        <button
          className={`p-2 mb-4 rounded ${
            !isCanvasOpen ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setCanvasOpen(false)} // Always show Editor when clicked
        >
          <FaCode className="text-white text-xl" /> {/* Editor Icon */}
        </button>

        {/* Canvas Button */}
        <button
          className={`p-2 mb-4 rounded ${
            isCanvasOpen ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setCanvasOpen(true)} // Replace Editor with Canvas
        >
          <FaChalkboard className="text-white text-xl" /> {/* Canvas Icon */}
        </button>

        {/* Terminal Button */}
        <button
          className={`p-2 mb-4 rounded ${
            isTerminalOpen ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setTerminalOpen(!isTerminalOpen)} // Toggle Terminal
        >
          <FaPlay className="text-white text-xl" /> {/* Terminal Icon */}
        </button>

        {/* Clients Button */}
        <button
          className={`p-2 mb-4 rounded ${
            isClientsPanelOpen ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setClientsPanelOpen(!isClientsPanelOpen)} // Toggle Clients Panel
        >
          <FaUsers className="text-white text-xl" /> {/* Clients Icon */}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor or Canvas */}
        <div className="flex-1 relative">
          {!isCanvasOpen ? (
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          ) : (
            <Canvas socketRef={socketRef} roomId={roomId} />
          )}
        </div>

        {/* Terminal Panel */}
        {isTerminalOpen && (
          <div className="w-96 bg-gray-800 p-4 border-l border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Run Code</h3>
              <button
                className="p-2 rounded bg-gray-700 hover:bg-gray-600"
                onClick={() => setTerminalOpen(false)}
              >
                <FaTimes className="text-white" /> {/* Close Icon */}
              </button>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            >
              <option value="">Select Language</option>
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            ></textarea>
            <button
              onClick={runCode}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? "Executing..." : "Execute"}
            </button>
            {isLoading ? (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              isOutputAreaVisible && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Output:</h3>
                  <pre className="bg-gray-700 p-2 rounded">{output}</pre>
                </div>
              )
            )}
          </div>
        )}

        {/* Clients Panel */}
        {isClientsPanelOpen && (
          <div className="w-64 bg-gray-800 p-4 border-l border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Connected Clients</h3>
              <button
                className="p-2 rounded bg-gray-700 hover:bg-gray-600"
                onClick={() => setClientsPanelOpen(false)}
              >
                <FaTimes className="text-white" /> {/* Close Icon */}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
              onClick={() => navigator.clipboard.writeText(roomId)}
            >
              Copy ROOM ID
            </button>
            <button
              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => reactNavigator("/dashboard")}
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;