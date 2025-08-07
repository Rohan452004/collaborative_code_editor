import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { IoCodeSlash } from "react-icons/io5"
import { MdOutlineDraw } from "react-icons/md"
import cn from "classnames"
import { Tooltip } from 'react-tooltip'
import { useState } from 'react'
import { tooltipStyles } from "./tooltipStyles"

function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
        setIsSidebarOpen,
    } = useViews()
    const { minHeightReached } = useResponsive()
    const { activityState, setActivityState } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)

    const changeState = () => {
        setShowTooltip(false)
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    return (
        <aside className="flex h-full w-full md:w-auto">
            {/* Sidebar Navigation */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-14 w-full items-center justify-between border-t border-white/5 bg-dark/95 px-4 backdrop-blur-sm md:static md:h-full md:w-16 md:flex-col md:justify-start md:border-r md:border-t-0 md:px-0 md:py-4",
                    {
                        "hidden md:flex": minHeightReached,
                    },
                )}
            >
                {/* Modified buttons container with horizontal scroll */}
                <div className="flex flex-1 gap-3 overflow-x-auto md:flex-col md:gap-2 flex-nowrap md:overflow-visible">
                    <SidebarButton
                        viewName={VIEWS.FILES}
                        icon={viewIcons[VIEWS.FILES]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CHATS}
                        icon={viewIcons[VIEWS.CHATS]}
                    />
                    <SidebarButton
                        viewName={VIEWS.COPILOT}
                        icon={viewIcons[VIEWS.COPILOT]}
                    />
                    <SidebarButton
                        viewName={VIEWS.RUN}
                        icon={viewIcons[VIEWS.RUN]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CLIENTS}
                        icon={viewIcons[VIEWS.CLIENTS]}
                    />
                    <SidebarButton
                        viewName={VIEWS.SETTINGS}
                        icon={viewIcons[VIEWS.SETTINGS]}
                    />
                </div>

                {/* Activity State Toggle */}
                <div className="flex h-fit items-center justify-center md:mt-auto mt-[-10px]">
                    <button
                        className={cn(
                            "flex items-center justify-center rounded-lg p-2 transition-all",
                            "hover:bg-white/5",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50",
                            {
                                "text-primary": activityState === ACTIVITY_STATE.CODING,
                                "text-white/80": activityState !== ACTIVITY_STATE.CODING,
                            }
                        )}
                        onClick={changeState}
                        onMouseEnter={() => setShowTooltip(true)}
                        data-tooltip-id="activity-state-tooltip"
                        data-tooltip-content={
                            activityState === ACTIVITY_STATE.CODING
                                ? "Switch to Drawing Mode"
                                : "Switch to Coding Mode"
                        }
                    >
                        {activityState === ACTIVITY_STATE.CODING ? (
                            <MdOutlineDraw size={24} />
                        ) : (
                            <IoCodeSlash size={24} />
                        )}
                    </button>
                    {showTooltip && (
                        <Tooltip
                            id="activity-state-tooltip"
                            place="right"
                            offset={15}
                            className="!z-50"
                            style={tooltipStyles}
                            noArrow={false}
                            positionStrategy="fixed"
                            float={true}
                        />
                    )}
                </div>
            </div>

            {/* Sidebar Content */}
            <div
                className={cn(
                    "absolute left-0 top-0 z-40 h-full w-full border-r border-white/5 bg-dark/95 backdrop-blur-sm transition-all duration-200 md:static md:w-90",
                    {
                        "translate-x-0": isSidebarOpen,
                        "-translate-x-full md:translate-x-0 md:hidden": !isSidebarOpen,
                    }
                )}
            >
                {viewComponents[activeView]}
            </div>
        </aside>
    )
}

export default Sidebar