"use client";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import Logo from "../Logo";
import AuthModal from "../Auth/AuthModal/AuthModal";
import ButtonSignin from "../Auth/ButtonSignin";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";

const Header = memo(({ toggleMobileMenu, session }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearchInput, setShowMobileSearchInput] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef(null);

  // Debounced search handler
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        console.log("Searching for:", searchQuery);
        if (showMobileSearchInput) {
          setShowMobileSearchInput(false);
        }
      }
    },
    [searchQuery, showMobileSearchInput]
  );

  const openAuthModal = useCallback((mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const toggleMobileSearchVisibility = useCallback(() => {
    setShowMobileSearchInput((prev) => !prev);
  }, []);

  // Focus management for mobile search
  useEffect(() => {
    if (showMobileSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearchInput]);

  // Scroll lock management
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isAuthModalOpen || showMobileSearchInput) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isAuthModalOpen, showMobileSearchInput]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/80 backdrop-blur-sm">
        <nav className="container flex items-center justify-between px-4 sm:px-6 py-3 mx-auto gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden btn btn-ghost btn-square p-2"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div
              className={`${
                showMobileSearchInput ? "hidden" : "flex"
              } md:flex items-center`}
            >
              <Logo />
            </div>
          </div>

          {!showMobileSearchInput && (
            <div className="hidden md:flex flex-auto min-w-0 mx-2 sm:mx-4 lg:flex-1 lg:max-w-2xl">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search posts..."
                  className={`input input-bordered w-full pl-10 pr-4 py-2.5 rounded-full text-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isSearchFocused
                      ? "bg-base-200 border-primary shadow-sm"
                      : "bg-base-100 border-base-300"
                  } focus:outline-none focus:ring-1 focus:ring-primary`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors duration-200"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {!showMobileSearchInput && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="md:hidden btn btn-ghost btn-square p-2 transition-transform hover:scale-105 active:scale-95"
                onClick={toggleMobileSearchVisibility}
                aria-label="Open search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
              <ButtonSignin
                session={session}
                onOpenLoginModal={() => openAuthModal("login")}
                extraStyle="btn-primary btn-outline h-10 min-h-[2.5rem] px-3 rounded-full whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
              />
            </div>
          )}
        </nav>

        {showMobileSearchInput && (
          <div className="md:hidden fixed inset-0 z-50 bg-base-100/95 backdrop-blur-sm p-3 border-b border-base-300">
            <form
              onSubmit={handleSearch}
              className="relative w-full flex items-center gap-2"
            >
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors duration-200"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search all posts..."
                className="input input-bordered flex-grow pl-10 pr-4 py-2.5 rounded-full text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={toggleMobileSearchVisibility}
                className="btn btn-ghost btn-square p-2 transition-transform hover:scale-105 active:scale-95"
                aria-label="Close search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </form>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
});

Header.displayName = "Header";
export default Header;