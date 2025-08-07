import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        if (activeFile?.id === fileId) return
        updateFileContent(activeFile?.id || "", activeFile?.content || "")
        const file = openFiles.find((file) => file.id === fileId)
        if (file) setActiveFile(file)
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            fileTabNode.scrollLeft += e.deltaY > 0 ? 100 : -100
        }

        fileTabNode.addEventListener("wheel", handleWheel)
        return () => fileTabNode.removeEventListener("wheel", handleWheel)
    }, [])

    useEffect(() => {
        if (!activeFile?.name) return
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    return (
        <div className="relative border-b border-white/5 bg-dark">
            <div
                ref={fileTabRef}
                className="flex h-12 w-full select-none items-end overflow-x-auto scrollbar-hide"
            >
                <div className="flex h-full items-end gap-1 px-2">
                    {openFiles.map((file) => (
                        <div
                            key={file.id}
                            className={cn(
                                "group relative flex h-9 min-w-fit max-w-[200px] items-center rounded-t-md border-t border-r border-l border-transparent px-3 transition-all",
                                {
                                    "border-t-primary/50 border-r-white/5 border-l-white/5 bg-dark text-white": 
                                        file.id === activeFile?.id,
                                    "bg-darkHover/30 text-white/70 hover:bg-darkHover/50": 
                                        file.id !== activeFile?.id,
                                }
                            )}
                            onClick={() => changeActiveFile(file.id)}
                        >
                            <Icon
                                icon={getIconClassName(file.name)}
                                fontSize={18}
                                className={cn("mr-2 shrink-0", {
                                    "text-primary": file.id === activeFile?.id,
                                    "text-white/60": file.id !== activeFile?.id,
                                })}
                            />
                            <p className="truncate text-sm font-medium">
                                {file.name}
                            </p>
                            <button
                                className="ml-2 rounded p-1 opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    closeFile(file.id)
                                }}
                            >
                                <IoClose size={16} className="text-white/60 hover:text-white" />
                            </button>
                            
                            {/* Active file indicator */}
                            {file.id === activeFile?.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FileTab