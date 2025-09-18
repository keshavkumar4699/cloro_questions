// components/ChainView/ChainView.js
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PostCardInChain = ({ post, isCurrent }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isCurrent && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 250);
    }
  }, [isCurrent]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div
      ref={cardRef}
      id={`chain-post-${post._id}`}
      className={`card rounded-xl p-4 transition-all duration-300 border cursor-pointer bg-base-100 border-base-300 hover:bg-base-200 hover:border-primary/20 hover:shadow-md ${
        isCurrent ? "bg-base-200/70 ring-1 ring-primary/50" : ""
      }`}
    >
      {/* Post Header - matches PostsList exactly */}
      <div className="mb-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <h3 className="font-semibold truncate hover:text-primary transition-colors">
            {post.title}
          </h3>
          <span className="text-base-content/50">•</span>
          <span className="text-base-content/50">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Post Content - matches PostsList exactly */}
      <div className="mt-1">
        {post.content && (
          <p className="text-base-content/90 text-sm leading-relaxed line-clamp-3">
            {post.content}
          </p>
        )}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden max-h-80 md:max-h-96 flex justify-center bg-base-200/30 mt-2">
            <img
              src={post.imageUrl}
              alt={post.title || "Post image"}
              className="object-contain max-h-80 md:max-h-96 w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChainView() {
  const [chainData, setChainData] = useState(null);
  const [postsInChain, setPostsInChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("latest");
  const headerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchParams = useSearchParams();
  const chainId = searchParams.get("chainId"); //from Url
  const currentPostIdInChain = searchParams.get("postId"); // To highlight specific post in chain

  useEffect(() => {
    if (chainId) {
      const fetchChainData = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/posts/chains?chainId=${chainId}`);
          if (!res.ok) {
            const errData = await res
              .json()
              .catch(() => ({ error: "Server error" }));
            throw new Error(
              errData.error || `Failed to fetch chain data: ${res.status}`
            );
          }
          const data = await res.json();
          setChainData(data);
          setPostsInChain(data.posts || []);
        } catch (err) {
          console.error("Fetch chain data error in ChainView:", err);
          setError(err.message);
        } finally {
          setLoading(false);
          if (isInitialLoad) setIsInitialLoad(false);
        }
      };
      fetchChainData();
    } else {
      setLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
      setError("No Chain ID provided to ChainView.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const sortedPosts = useCallback(() => {
    if (!postsInChain) return [];
    return [...postsInChain].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [postsInChain, sortOrder]);

  // Initial Loading Skeleton
  if (loading && isInitialLoad) {
    return (
      <div className="animate-pulse">
        <div className="sticky top-0 z-30 bg-base-100/90 py-3 border-b border-base-300">
          <div className="container mx-auto px-2 sm:px-0">
            <div className="flex flex-col items-center gap-1">
              <div className="h-6 bg-base-300 rounded w-1/2"></div>
              <div className="h-4 bg-base-300 rounded w-1/3 mt-1"></div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1 sm:px-4 md:px-8">
              <div className="h-5 bg-base-300 rounded w-1/5"></div>
              <div className="h-5 bg-base-300 rounded w-1/5"></div>
              <div className="h-5 bg-base-300 rounded w-1/5"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-2 sm:px-4 mt-4 space-y-4">
          {" "}
          {/* Fixed mt for gap */}
          <div className="flex justify-end">
            <div className="h-9 bg-base-300 rounded w-28"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-base-200 p-4 rounded-xl shadow space-y-3"
            >
              <div className="h-5 bg-base-300 rounded w-3/4"></div>
              <div className="h-4 bg-base-300 rounded w-1/2"></div>
              <div className="h-20 bg-base-300 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="text-error text-center mt-8 p-4">
        Error displaying chain: {error}
      </div>
    );
  if (!chainData && !loading)
    return (
      <div className="text-center mt-8 p-4 text-base-content/70">
        Chain not found.
      </div>
    );

  const displayPosts = sortedPosts();
  const chainAuthor = chainData?.author;

  return (
    <div className="relative animate-fadeIn">
      {/* Sticky Header - Design kept as you liked */}
      <div
        ref={headerRef} // Ref is kept in case you need its height for other purposes later
        className="sticky top-0 z-30 bg-base-100/95 backdrop-blur-sm py-3 border-b border-base-300 shadow-sm"
      >
        <div className="container mx-auto px-2 sm:px-0">
          {" "}
          {/* This container ensures header content aligns with page content */}
          <div className="flex flex-col items-center gap-0.5">
            <h1 className="text-lg sm:text-xl font-semibold text-base-content text-center truncate max-w-full px-2">
              {chainData?.title || "Chain"}
            </h1>
            {chainAuthor && (
              <p className="text-xs text-base-content/70">
                Curated by{" "}
                <Link
                  href={`/users/${chainAuthor.username || chainAuthor._id}`}
                  className="link link-hover text-xs font-medium hover:text-primary"
                >
                  {chainAuthor.name || chainAuthor.username}
                </Link>
              </p>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-base-content/80 mt-2 px-1 sm:px-4 md:px-8">
            <div className="text-center transition-transform duration-300 ease-out motion-safe:hover:scale-105">
              <span className="font-semibold">{displayPosts.length}</span>
              <span className="ml-1 text-base-content/70">
                Post{displayPosts.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="text-center transition-transform duration-300 ease-out motion-safe:hover:scale-105">
              <span className="font-semibold">
                {chainData?.followersCount?.toLocaleString() || 0}
              </span>
              <span className="ml-1 text-base-content/70">Followers</span>
            </div>
            <div className="text-center transition-transform duration-300 ease-out motion-safe:hover:scale-105">
              <span className="font-semibold">
                {chainData?.views?.toLocaleString() || 0}
              </span>
              <span className="ml-1 text-base-content/70">Views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Updated content area to match PostsList */}
      <div className="m-3">
        {" "}
        {/* Changed to match PostsList margin */}
        <div className="space-y-3">
          {" "}
          {/* Changed to match PostsList spacing */}
          {displayPosts.length > 1 && (
            <div className="flex justify-end">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          )}
          {loading && !isInitialLoad && (
            <div className="text-center py-10">
              <span className="loading loading-lg loading-spinner text-primary"></span>
            </div>
          )}
          {!loading && displayPosts.length > 0 ? (
            displayPosts.map((post, index) => (
              <PostCardInChain
                key={post._id}
                post={post}
                isCurrent={post._id === currentPostIdInChain}
              />
            ))
          ) : (
            <p className="text-center text-lg text-base-content/60 py-16 px-4">
              <span className="text-3xl block mb-2">📭</span> This chain has no
              posts yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
