// components/PostSkeleton.jsx
export const PostSkeleton = () => {
  return (
    <div className="card bg-base-100 rounded-xl p-4 border border-base-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-full bg-base-300 h-8 w-8"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-base-300 rounded w-3/4"></div>
          <div className="h-3 bg-base-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-base-300 rounded"></div>
        <div className="h-4 bg-base-300 rounded w-5/6"></div>
      </div>
      <div className="h-48 bg-base-300 rounded-lg mb-3"></div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-base-300 rounded w-12"></div>
          ))}
        </div>
      </div>
    </div>
  );
};