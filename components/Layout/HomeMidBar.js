// components/HomeMidBar.js
"use client";

import { Suspense } from "react"; // Import Suspense
import PostsList from "@/components/PostComponents/PostsList";

const HomeMidBar = () => {

  return (
    <div className="mx-auto">
      <Suspense fallback={<LoadingState />}>
        <PostsList />
      </Suspense>
    </div>
  );
};

// Basic loading state for Suspense fallback
const LoadingState = () => (
  <div className="flex justify-center items-center py-10">
    <span className="loading loading-lg loading-dots text-primary"></span>
  </div>
);

export default HomeMidBar;