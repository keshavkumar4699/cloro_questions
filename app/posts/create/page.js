// app/posts/create/page.js
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // For navigation
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowLeftIcon, // For a back button
  ExclamationCircleIcon, // For errors
} from "@heroicons/react/24/outline";
import { debounce } from "lodash"; // Ensure lodash is installed

export default function CreatePostPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
    imageName: "",
    chainTitle: "", // For search input and selected/new chain's title
    chainId: null,   // ID of selected existing chain
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For success feedback

  // Chain search state
  const [chainSearchInput, setChainSearchInput] = useState("");
  const [chainSearchResults, setChainSearchResults] = useState([]);
  const [isChainSearching, setIsChainSearching] = useState(false);
  const [showChainResultsDropdown, setShowChainResultsDropdown] = useState(false);

  const fileInputRef = useRef(null);
  const chainSearchContainerRef = useRef(null);
  const contentTextAreaRef = useRef(null); // For auto-resize

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/api/auth/signin?callbackUrl=/posts/create"); // Or your login page
    }
  }, [sessionStatus, router]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = contentTextAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.content]);

  // Close chain dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chainSearchContainerRef.current && !chainSearchContainerRef.current.contains(event.target)) {
        setShowChainResultsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedChainSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.trim().length < 2) {
        setChainSearchResults([]);
        // Only show create if there's actual input
        setShowChainResultsDropdown(searchTerm.trim().length > 0 && !isChainSearching);
        if (searchTerm.trim().length > 0 && !isChainSearching) {
             setChainSearchResults([{ _id: "create_new_chain_option", title: searchTerm.trim(), isCreateOption: true }]);
        } else {
            setChainSearchResults([]);
            setShowChainResultsDropdown(false);
        }
        setIsChainSearching(false);
        return;
      }

      setIsChainSearching(true);
      try {
        const response = await fetch(`/api/posts/chains?search=${encodeURIComponent(searchTerm)}&limit=5`);
        if (!response.ok) throw new Error("Failed to fetch chains");
        const results = await response.json();
        const createNewOption = { _id: "create_new_chain_option", title: searchTerm.trim(), isCreateOption: true };
        const exactMatchExists = results.some(chain => chain.title.toLowerCase() === searchTerm.trim().toLowerCase());

        setChainSearchResults(exactMatchExists ? results : [createNewOption, ...results.filter(r => r.title.toLowerCase() !== searchTerm.trim().toLowerCase())]);
        setShowChainResultsDropdown(true);
      } catch (err) {
        console.error("Chain search failed:", err);
        setChainSearchResults([{ _id: "create_new_chain_option_onerror", title: searchTerm.trim(), isCreateOption: true }]);
        setShowChainResultsDropdown(true);
      } finally {
        setIsChainSearching(false);
      }
    }, 400),
    []
  );

  const handleChainSearchInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setChainSearchInput(newSearchTerm);
    if (newSearchTerm.trim() === "") {
      setFormData(prev => ({ ...prev, chainTitle: "", chainId: null }));
    }
    debouncedChainSearch(newSearchTerm);
  };

  const selectChain = (chain) => {
    if (chain.isCreateOption) {
      setFormData((prev) => ({ ...prev, chainTitle: chain.title, chainId: null }));
      setChainSearchInput(chain.title);
    } else {
      setFormData((prev) => ({ ...prev, chainTitle: chain.title, chainId: chain._id }));
      setChainSearchInput(chain.title);
    }
    setShowChainResultsDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error on change
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should not exceed 5MB.");
        setFormData((prev) => ({ ...prev, image: null, imageName: "" }));
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the file input
        return;
      }
      setFormData((prev) => ({ ...prev, image: file, imageName: file.name }));
      if (error) setError("");
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const resetForm = () => {
    setFormData({
      title: "", content: "", category: "", image: null, imageName: "",
      chainTitle: "", chainId: null,
    });
    setChainSearchInput("");
    setChainSearchResults([]);
    setError("");
    setSuccessMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    // Optionally ask for confirmation if form has data
    // For now, just navigate back or to home
    router.back(); // Or router.push('/')
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("You must be logged in to post.");
      return;
    }
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }
    if (!formData.title.trim()) {
        setError("Title is required.");
        return;
    }
    if (!formData.content.trim()) {
        setError("Content is required.");
        return;
    }


    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title.trim());
      formPayload.append("content", formData.content.trim());
      formPayload.append("category", formData.category);
      // authorId is derived from session in the backend API

      if (formData.image) {
        formPayload.append("image", formData.image);
      }
      if (formData.chainTitle.trim()) {
        formPayload.append("chainTitle", formData.chainTitle.trim());
        if (formData.chainId) {
          formPayload.append("chainId", formData.chainId);
        }
      }

      const response = await fetch("/api/posts", { method: "POST", body: formPayload });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unexpected error occurred during submission." }));
        throw new Error(errorData.message || "Failed to create post.");
      }

      const newPost = await response.json();
      setSuccessMessage("Post created successfully!");
      resetForm();
      // Navigate to the new post or a relevant feed
      router.push(newPost.chain ? `/chains/${newPost.chain._id}?post=${newPost._id}` : `/posts/${newPost._id}`); // Adjust as per your routing for single posts if not in a chain
    } catch (err) {
      console.error("Post creation failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (sessionStatus === "loading") {
    return (
        <div className="flex justify-center items-center min-h-screen bg-base-200">
            <span className="loading loading-dots loading-lg text-primary"></span>
        </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    // This should ideally be handled by the useEffect redirect,
    // but as a fallback or for initial render before redirect:
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-base-200 p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">You need to be logged in to create a post.</p>
            <button onClick={() => router.push("/api/auth/signin?callbackUrl=/posts/create")} className="btn btn-primary">
                Log In
            </button>
        </div>
    );
  }


  // Main page content
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 md:px-0">
      <div className="container mx-auto max-w-3xl">
        {/* Back button and Title */}
        <div className="mb-6 flex items-center gap-3">
            <button onClick={handleCancel} className="btn btn-ghost btn-sm p-1">
                <ArrowLeftIcon className="w-5 h-5"/> 
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content">Create a Post</h1>
        </div>

        {/* Form Container - Reddit uses a card-like structure for the form */}
        <div className="bg-base-100 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chain Selector - Placed prominently */}
            <div className="form-control" ref={chainSearchContainerRef}>
              <label htmlFor="chainSearchInput" className="label pb-1">
                <span className="label-text text-base font-medium">Choose a Chain (Optional)</span>
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
                <input
                  id="chainSearchInput"
                  type="text"
                  value={chainSearchInput}
                  onChange={handleChainSearchInputChange}
                  onFocus={() => { if (chainSearchInput.trim() || chainSearchResults.length > 0) setShowChainResultsDropdown(true);}}
                  placeholder="Search or type to create a chain..."
                  className="input input-bordered input-primary w-full pl-12 pr-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>
              {showChainResultsDropdown && (
                <div className="absolute z-30 mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto PrettyScroll">
                  {isChainSearching ? (
                    <div className="p-3 text-center text-sm text-base-content/70">Searching...</div>
                  ) : chainSearchResults.length > 0 ? (
                    chainSearchResults.map((chain) => (
                      <div
                        key={chain._id}
                        className="p-3 hover:bg-primary hover:text-primary-content cursor-pointer flex items-center gap-2 transition-colors"
                        onClick={() => selectChain(chain)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {chain.isCreateOption ? (
                          <>
                            <PlusCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span>Create new: `<strong>{chain.title}</strong>`</span>
                          </>
                        ) : (
                          <span className="font-medium">{chain.title}</span>
                        )}
                      </div>
                    ))
                  ) : chainSearchInput.trim().length >= 2 ? (
                     <div className="p-3 text-center text-sm text-base-content/70">No chains found. Type to create.</div>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Title */}
            <div className="form-control">
              <label htmlFor="title" className="label pb-1">
                <span className="label-text text-base font-medium">Title</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input input-bordered input-primary w-full text-lg py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                required
                maxLength={120} // Reddit-like titles can be longer
                disabled={isSubmitting}
                placeholder="An interesting title"
              />
            </div>

            {/* Content - Larger Textarea */}
            <div className="form-control">
              <label htmlFor="content" className="label pb-1">
                <span className="label-text text-base font-medium">Text (Optional if image is provided)</span>
              </label>
              <textarea
                id="content"
                ref={contentTextAreaRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary w-full min-h-[150px] md:min-h-[200px] text-base py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                disabled={isSubmitting}
                placeholder="Your text post (markdown is not supported in this basic editor)"
                rows={8} // Initial rows, auto-resize will adjust
              />
            </div>

            {/* Category & Image Upload - Side-by-side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="form-control">
                <label htmlFor="category" className="label pb-1">
                  <span className="label-text text-base font-medium">Category</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered select-primary w-full text-base py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Choose a category</option>
                  <option value="technology">Technology</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="education">Education</option>
                  {/* Add more relevant categories */}
                  <option value="discussion">Discussion</option>
                  <option value="news">News</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-base font-medium">Image (Optional, max 5MB)</span>
                </label>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className={`btn btn-outline w-full justify-start text-left normal-case transition-all ${formData.imageName ? 'btn-primary btn-active' : 'hover:border-primary'}`}
                  disabled={isSubmitting}
                >
                  <PhotoIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">{formData.imageName || "Select Image"}</span>
                </button>
                <input type="file" ref={fileInputRef} accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleFileChange} className="hidden" disabled={isSubmitting} />
                {formData.imageName && (
                    <p className="text-xs text-base-content/70 mt-1">Selected: {formData.imageName}</p>
                )}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div role="alert" className="alert alert-error shadow-md text-sm">
                <ExclamationCircleIcon className="w-6 h-6 mr-2"/>
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div role="alert" className="alert alert-success shadow-md text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Action Buttons - Aligned to the right */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-base-300 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost hover:bg-base-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary min-w-[120px] md:min-w-[150px] text-base"
                disabled={isSubmitting || !formData.title || !formData.content || !formData.category || (sessionStatus !== "authenticated")}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="text-xs text-center text-base-content/50 mt-8">
            Posting as <span className="font-semibold">{session?.user?.name || session?.user?.email}</span>.
            Ensure your content adheres to community guidelines.
        </p>
      </div>
    </div>
  );
}