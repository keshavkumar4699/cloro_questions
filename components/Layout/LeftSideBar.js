"use client";
import { memo, useCallback } from "react";
import Logo from "../Logo";
import { XMarkIcon } from "@heroicons/react/24/solid";
import SidebarLink from "./SidebarLink";
import { navlinks } from "@/data/navlink";
import { topics } from "@/data/topic";

const LeftSidebar = memo(({ isMobileOpen, onMobileClose }) => {
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onMobileClose();
    }
  }, [onMobileClose]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          aria-hidden="true"
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-base-100 border-r border-base-300
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          h-screen lg:h-[calc(100vh-73px)] lg:top-[73px]
        `}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-base-300">
          <Logo />
          <button
            onClick={onMobileClose}
            className="btn btn-ghost btn-sm btn-circle transition-transform hover:scale-110 active:scale-95"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-2">
              Topics
            </h2>
            <SidebarLink items={topics} />
          </div>

          <div className="divider my-0" />

          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-2">
              Navigation
            </h2>
            <SidebarLink items={navlinks} />
          </div>
        </div>

        <div className="p-4 border-t border-base-300">
          <p className="text-xs text-base-content/60 text-center">
            © {new Date().getFullYear()} Cloro
          </p>
        </div>
      </aside>
    </>
  );
});

LeftSidebar.displayName = "LeftSidebar";
export default LeftSidebar;