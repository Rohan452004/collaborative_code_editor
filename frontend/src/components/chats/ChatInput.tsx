import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef, useState } from "react"
import { LuSendHorizonal } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])

            if (inputRef.current) inputRef.current.value = ""
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="group relative mx-4 mb-4 overflow-hidden rounded-2xl bg-dark-800 shadow-xl transition-all duration-300 focus-within:shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-30 group-focus-within:opacity-50" />
            
            <div className="relative flex items-center">
                <input
                    type="text"
                    className="w-full flex-grow border-none bg-transparent py-4 pl-6 pr-20 text-lg text-white placeholder-gray-400 outline-none transition-all duration-300"
                    placeholder="Type your message here 💬..."
                    ref={inputRef}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                
                <motion.button
                    className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <LuSendHorizonal className="text-white" size={24} />
                </motion.button>
            </div>

            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ width: 0 }}
                        className="h-1 bg-gradient-to-r from-primary to-secondary"
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>
        </form>
    )
}

export default ChatInput