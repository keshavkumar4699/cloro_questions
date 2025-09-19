"use client";

const SubjectSkeleton = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center justify-between w-full px-2 py-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-base-300 rounded" />
              <div className="h-4 w-24 bg-base-300 rounded" />
            </div>
            <div className="h-4 w-4 bg-base-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectSkeleton;
