import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"
import { motion } from "framer-motion"
import { FiUserCheck, FiUserX } from "react-icons/fi"

const statusConfig = {
  [USER_CONNECTION_STATUS.ONLINE]: {
    color: "bg-green-500",
    icon: <FiUserCheck className="text-green-500" size={12} />,
    pulse: true,
    text: "Active now",
    textColor: "text-green-400"
  },
  [USER_CONNECTION_STATUS.OFFLINE]: {
    color: "bg-gray-500",
    icon: <FiUserX className="text-gray-500" size={12} />,
    pulse: false,
    text: "Offline",
    textColor: "text-gray-400"
  }
}

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex min-h-[200px] flex-grow flex-col overflow-y-auto p-4">
            <h3 className="mb-4 text-lg font-semibold text-white/80">Active Users ({users.length})</h3>
            <div className="grid grid-cols-1 gap-2">
                {users.map((user, index) => (
                    <motion.div
                        key={user.socketId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full"
                    >
                        <User user={user} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const statusData = statusConfig[status]

    return (
        <div className="group flex items-center gap-3 p-2 transition-all hover:bg-darkHover/50 rounded-lg w-full">
            <div className="relative shrink-0">
                <Avatar 
                    name={username} 
                    size="40" 
                    round="12px"
                    className="transition-transform group-hover:scale-105"
                    color={status === USER_CONNECTION_STATUS.ONLINE ? "#3B82F6" : "#6B7280"}
                    fgColor="white"
                />
                <div className={`absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-dark bg-dark`}>
                    {statusData.icon}
                </div>
                {statusData.pulse && (
                    <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-green-500/20 animate-ping"></div>
                )}
            </div>
            
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-white font-medium truncate">
                    {username}
                </p>
                <span className={`text-xs ${statusData.textColor}`}>
                    {statusData.text}
                </span>
            </div>
        </div>
    )
}

export default Users