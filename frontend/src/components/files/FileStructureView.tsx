import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai"
import { MdDelete, MdOutlineCreateNewFolder } from "react-icons/md"
import { PiPencilSimpleFill, PiNotePencil } from "react-icons/pi"
import { RiFolderReduceLine } from "react-icons/ri"
import RenameView from "./RenameView"
import useResponsive from "@/hooks/useResponsive"

function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } =
        useFileSystem()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)
    const { minHeightReached } = useResponsive()

    const handleClickOutside = (e: MouseEvent) => {
        if (explorerRef.current && !explorerRef.current.contains(e.target as Node)) {
            setSelectedDirId(fileStructure.id)
        }
    }

    const handleCreateFile = () => {
        const fileName = prompt("Enter file name")
        if (fileName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createFile(parentDirId, fileName)
        }
    }

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name")
        if (dirName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createDirectory(parentDirId, dirName)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div 
            onClick={handleClickOutside} 
            className="flex flex-grow flex-col border-r border-white/5 bg-dark/50"
        >
            <div className="flex items-center justify-between border-b border-white/5 p-3">
                <h2 className="text-lg font-medium text-white">Explorer</h2>
                <div className="flex gap-2">
                    <button
                        className="rounded-md p-1 text-white/60 hover:bg-white/5 hover:text-white"
                        onClick={handleCreateFile}
                        title="New File"
                    >
                        <PiNotePencil size={18} />
                    </button>
                    <button
                        className="rounded-md p-1 text-white/60 hover:bg-white/5 hover:text-white"
                        onClick={handleCreateDirectory}
                        title="New Folder"
                    >
                        <MdOutlineCreateNewFolder size={18} />
                    </button>
                    <button
                        className="rounded-md p-1 text-white/60 hover:bg-white/5 hover:text-white"
                        onClick={collapseDirectories}
                        title="Collapse All"
                    >
                        <RiFolderReduceLine size={18} />
                    </button>
                </div>
            </div>
            <div
                className={cn(
                    "flex-grow overflow-auto py-2",
                    {
                        "h-[calc(80vh-170px)]": !minHeightReached,
                        "h-[85vh]": minHeightReached,
                    },
                )}
                ref={explorerRef}
            >
                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [showActions, setShowActions] = useState(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { deleteDirectory, toggleDirectory } = useFileSystem()

    const handleDirClick = (dirId: string) => {
        setSelectedDirId(dirId)
        toggleDirectory(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        const isConfirmed = confirm(`Are you sure you want to delete directory?`)
        if (isConfirmed) {
            deleteDirectory(id)
        }
    }

    useEffect(() => {
        const dirNode = dirRef.current
        if (!dirNode) return

        dirNode.tabIndex = 0
        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        dirNode.addEventListener("keydown", handleF2)
        return () => dirNode.removeEventListener("keydown", handleF2)
    }, [])

    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    return (
        <div className="overflow-x-auto">
            <div
                className={cn(
                    "group relative flex w-full items-center rounded-md px-2 py-1 hover:bg-white/5",
                )}
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                {item.isOpen ? (
                    <AiOutlineFolderOpen size={20} className="mr-2 min-w-fit text-primary/80" />
                ) : (
                    <AiOutlineFolder size={20} className="mr-2 min-w-fit text-white/60" />
                )}
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <>
                        <p
                            className="flex-grow cursor-pointer overflow-hidden truncate text-white/90"
                            title={item.name}
                        >
                            {item.name}
                        </p>
                        {showActions && (
                            <div className="absolute right-2 flex gap-1">
                                <button
                                    onClick={handleRenameDirectory}
                                    className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                                    title="Rename"
                                >
                                    <PiPencilSimpleFill size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteDirectory(e, item.id)}
                                    className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-red-400"
                                    title="Delete"
                                >
                                    <MdDelete size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div
                className={cn(
                    "border-l border-white/5",
                    { hidden: !item.isOpen },
                    { block: item.isOpen },
                    { "ml-4": item.name !== "root" },
                )}
            >
                {item.children &&
                    item.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
        </div>
    )
}

const File = ({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) => {
    const { deleteFile, openFile } = useFileSystem()
    const [isEditing, setEditing] = useState<boolean>(false)
    const [showActions, setShowActions] = useState(false)
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef<HTMLDivElement | null>(null)

    const handleFileClick = (fileId: string) => {
        if (isEditing) return
        setSelectedDirId(fileId)
        openFile(fileId)
        if (isMobile) setIsSidebarOpen(false)
        if (activityState === ACTIVITY_STATE.DRAWING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
    }

    const handleDeleteFile = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        const isConfirmed = confirm(`Are you sure you want to delete file?`)
        if (isConfirmed) deleteFile(id)
    }

    useEffect(() => {
        const fileNode = fileRef.current
        if (!fileNode) return

        fileNode.tabIndex = 0
        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") setEditing(true)
        }

        fileNode.addEventListener("keydown", handleF2)
        return () => fileNode.removeEventListener("keydown", handleF2)
    }, [])

    return (
        <div
            className="group relative flex w-full items-center rounded-md px-2 py-1 hover:bg-white/5"
            onClick={() => handleFileClick(item.id)}
            ref={fileRef}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <Icon
                icon={getIconClassName(item.name)}
                fontSize={18}
                className="mr-2 min-w-fit text-white/60"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <>
                    <p
                        className="flex-grow cursor-pointer overflow-hidden truncate text-white/90"
                        title={item.name}
                    >
                        {item.name}
                    </p>
                    {showActions && (
                        <div className="absolute right-2 flex gap-1">
                            <button
                                onClick={handleRenameFile}
                                className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                                title="Rename"
                            >
                                <PiPencilSimpleFill size={16} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteFile(e, item.id)}
                                className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-red-400"
                                title="Delete"
                            >
                                <MdDelete size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default FileStructureView