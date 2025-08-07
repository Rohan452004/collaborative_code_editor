import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

const ApproveAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const approveRequest = async () => {
      const roomId = searchParams.get("roomId");
      const email = searchParams.get("email");
      const isApproved = searchParams.get("approve") === "true"; 
    

      if (!roomId || !email) {
        setMessage("Invalid request. Missing parameters.");
        setLoading(false);
        return;
      }

      try {
        const BACKEND = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.post(
          `${BACKEND}/api/approveAccess`,
          {
            roomId,
            email,
            isApproved,
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success(
            `User ${isApproved ? "approved" : "denied"} successfully!`
          );
          setMessage(
            `User ${isApproved ? "approved" : "denied"} successfully.`
          );
        } else {
          toast.error(response.data.message);
          setMessage("Failed to process request.");
        }
      } catch (error) {
        console.error(error);
        setMessage("An error occurred while processing the request.");
      } finally {
        setLoading(false);
        // setTimeout(() => navigate("/dashboard"), 5000); // Redirect home after 3 sec
      }
    };

    approveRequest();
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl text-black font-semibold">
          {loading ? "Processing..." : message}
        </h2>
      </div>
    </div>
  );
};

export default ApproveAccess;
