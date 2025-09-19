// components/Layout/QuestionCardSkeleton.js
"use client";

const QuestionCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-lg border border-base-300 animate-pulse"
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300 rounded w-full"></div>
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2"></div>
                </div>
                <div className="h-5 w-5 bg-base-300 rounded ml-2"></div>
              </div>

              <div className="h-32 bg-base-300 rounded-lg mb-3"></div>

              <div className="flex items-center justify-between">
                <div className="h-3 bg-base-300 rounded w-20"></div>
                <div className="h-5 bg-base-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCardSkeleton;
