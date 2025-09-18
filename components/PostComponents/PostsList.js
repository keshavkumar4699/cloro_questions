// components/PostComponents/PostsList.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { PostSkeleton } from "./PostSkeleton";

export default function PostsList() { // Removed onPostSelect prop
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname (e.g., / or /home)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        // Ensure this API returns posts with 'chainId' and other necessary fields like 'author.username'
        const res = await fetch("/api/posts");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: "Server error" }));
          throw new Error(errData.message || `Failed to fetch posts: ${res.status}`);
        }
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Fetch posts error in PostsList:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostClick = (post) => {
    if (!post.chainId) {
      console.error("Error: chainId is missing for the selected post.", post);
      setError("This post is not associated with a chain."); // Display error to user
      return;
    }
    // Update URL query params for the current page, without full reload
    router.push(`${pathname}?chainId=${post.chainId}&postId=${post._id}`, { scroll: false });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );

  if (error) return <div className="text-error text-center mt-8 p-4">Error: {error}</div>;
  if (!posts || posts.length === 0) return <div className="text-center mt-8 text-base-content/70">No posts found.</div>;

  return (
    <div className="m-3 space-y-3">
      {posts.map((post) => (
        <div
          key={post._id}
          className="card rounded-xl p-4 transition-all duration-300 border cursor-pointer bg-base-100 border-base-300 hover:bg-base-200 hover:border-primary/20 hover:shadow-md" // Adjusted bg for less "fill" and hover
          onClick={() => handlePostClick(post)}
        >
          {/* Post Header */}
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/users/${post.author?.username || "anonymous"}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full ring-1 ring-primary/50 hover:ring-primary transition-all duration-300">
                  {post.author?.image ? (
                    <img src={post.author.image} alt={post.author.name || post.author?.username || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-neutral text-neutral-content w-full h-full rounded-full flex items-center justify-center text-xs">
                      {post.author?.name?.charAt(0)?.toUpperCase() || post.author?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                <h3 className="font-semibold truncate hover:text-primary transition-colors">{post.title}</h3>
                <span className="text-base-content/50">•</span>
                <span className="text-base-content/50">{post.views || 0} views</span>
                <span className="text-base-content/50">•</span>
                <span className="text-base-content/50">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <Link href={`/users/${post.author?.username || "anonymous"}`} onClick={(e) => e.stopPropagation()}
                className="text-sm text-base-content/70 hover:text-primary transition-colors">
                @{post.author?.username || "user"}
              </Link>
            </div>
          </div>

          {/* Post Content Preview - Styling reverted */}
          <div className="mt-1"> {/* Removed specific background from this div */}
            {post.content && (
              <p className="text-base-content/90 text-sm mb-3 leading-relaxed line-clamp-3">
                {post.content}
              </p>
            )}
            {post.imageUrl && (
              <div className="rounded-lg overflow-hidden max-h-80 md:max-h-96 flex justify-center bg-base-200/30 mt-2"> {/* Subtle bg for image container */}
                <img
                  src={post.imageUrl}
                  alt={post.title || "Post image"}
                  className="object-contain max-h-80 md:max-h-96 w-full" // Removed hover scale from list view
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}