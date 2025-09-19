// components/Layout/AppLayout.js
"use client";

import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import LeftSidebar from "./LeftSideBar";
import RightSideBar from "./RightSideBar";
import { useState, useEffect } from "react";

// Define or import HEADER_HEIGHT_PX consistently
const HEADER_HEIGHT_PX = 65; // Example value, match your actual header height

export default function AppLayout({ children, session }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Manage body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <SessionProvider session={session}>
      {" "}
      {/* Crucial for useSession in client components */}
      <div className="flex flex-col min-h-screen bg-base-100">
        <Header toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar
            isMobileOpen={isMobileOpen}
            onMobileClose={() => setIsMobileOpen(false)}
            headerHeightPx={HEADER_HEIGHT_PX}
          />
          <main className="flex-1 overflow-y-auto focus:outline-none animate-fadeIn">
            {children}
          </main>
          <div className="hidden lg:flex flex-col w-56 flex-shrink-0 border-l border-base-300 bg-base-100">
            <RightSideBar headerHeightPx={HEADER_HEIGHT_PX} />
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
