import { useFileSystem } from "@/context/FileContext"
import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

interface RenameViewProps {
    id: string
    preName: string
    type: "file" | "directory"
    setEditing: (isEditing: boolean) => void
}

function RenameView({ id, preName, setEditing, type }: RenameViewProps) {
    const [name, setName] = useState<string>(preName || "")
    const { renameFile, openFile, renameDirectory } = useFileSystem()
    const formRef = useRef<HTMLFormElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)

        if (name === "") {
            toast.error(`${capitalizedType} name cannot be empty`)
        } else if (name.length > 25) {
            toast.error(
                `${capitalizedType} name cannot be longer than 25 characters`,
            )
        } else if (name === preName) {
            toast.error(`${capitalizedType} name cannot be the same as before`)
        } else {
            const isRenamed =
                type === "directory"
                    ? renameDirectory(id, name)
                    : renameFile(id, name)

            if (isRenamed && type === "file") {
                openFile(id)
            }
            if (!isRenamed) {
                toast.error(`${capitalizedType} with same name already exists`)
            } else {
                setEditing(false)
            }
        }
    }

    const handleFormKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                formRef.current?.requestSubmit()
            } else if (e.key === "Escape") {
                setEditing(false)
            }
        },
        [setEditing],
    )

    const handleDocumentEvent = useCallback(
        (e: KeyboardEvent | MouseEvent) => {
            const formNode = formRef.current
            if (formNode && !formNode.contains(e.target as Node)) {
                setEditing(false)
            }
        },
        [setEditing],
    )

    useEffect(() => {
        const formNode = formRef.current
        if (!formNode) return

        inputRef.current?.select()
        formNode.addEventListener("keydown", handleFormKeyDown)
        document.addEventListener("keydown", handleDocumentEvent)
        document.addEventListener("click", handleDocumentEvent)

        return () => {
            formNode.removeEventListener("keydown", handleFormKeyDown)
            document.removeEventListener("keydown", handleDocumentEvent)
            document.removeEventListener("click", handleDocumentEvent)
        }
    }, [handleDocumentEvent, handleFormKeyDown, setEditing])

    return (
        <div className="w-full">
            <form
                onSubmit={handleSubmit}
                ref={formRef}
                className="flex w-full items-center gap-1"
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full flex-1 rounded border border-primary/50 bg-darkHover px-2 py-0.5 text-sm text-white outline-none ring-1 ring-primary/20 focus:border-primary/80 focus:ring-primary/40"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                />
                <div className="flex gap-1">
                    <button
                        type="submit"
                        className="rounded px-2 py-0.5 text-xs text-white hover:bg-primary/10"
                        title="Save"
                    >
                        ✓
                    </button>
                    <button
                        type="button"
                        className="rounded px-2 py-0.5 text-xs text-white hover:bg-white/10"
                        onClick={() => setEditing(false)}
                        title="Cancel"
                    >
                        ✕
                    </button>
                </div>
            </form>
        </div>
    )
}

export default RenameView