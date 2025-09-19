"use client";

const TopicSkeleton = () => {
  return (
    <div className="ml-4 mt-1 space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center px-2 py-2">
            <div className="h-3 w-32 bg-base-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopicSkeleton;
