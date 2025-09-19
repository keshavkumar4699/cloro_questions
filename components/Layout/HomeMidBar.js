// components/HomeMidBar.js
"use client";

import { Suspense } from "react"; // Import Suspense
import QuestionList from "@/components/ReadQuestions/QuestionList";

const HomeMidBar = () => {

  return (
    <div className="mx-auto">
      {/*
        Wrap the component that uses useSearchParams in Suspense.
        This is a requirement in Next.js App Router when reading searchParams
        during rendering, as it can cause the component to suspend.
      */}
      <Suspense fallback={<LoadingState />}>
        <QuestionList />
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